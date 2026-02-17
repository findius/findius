-- 005_community_features.sql
-- Nested comments, referral system, reputation system

-- ============================================
-- Feature 1: Nested Comments (2-level)
-- ============================================
ALTER TABLE public.comments ADD COLUMN parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;
CREATE INDEX idx_comments_parent ON public.comments(parent_id);

-- ============================================
-- Feature 2: Referral System
-- ============================================
CREATE TABLE public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  page_slug TEXT NOT NULL,
  ref_code TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT now(),
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ,
  affiliate_partner_id UUID REFERENCES public.affiliate_partners(id),
  commission_total NUMERIC(10,2) DEFAULT 0,
  commission_user NUMERIC(10,2) DEFAULT 0
);

CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_ref_code ON public.referrals(ref_code);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "System can insert referrals" ON public.referrals FOR INSERT WITH CHECK (true);

CREATE TABLE public.payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  paypal_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payouts" ON public.payouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can request payouts" ON public.payouts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Feature 4: Reputation System
-- ============================================
ALTER TABLE public.profiles ADD COLUMN reputation_points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN reputation_rank TEXT DEFAULT 'Neuling';

CREATE OR REPLACE FUNCTION public.update_reputation(user_uuid UUID, points_to_add INTEGER)
RETURNS void AS $$
DECLARE
  new_points INTEGER;
  new_rank TEXT;
BEGIN
  UPDATE public.profiles 
  SET reputation_points = reputation_points + points_to_add
  WHERE id = user_uuid
  RETURNING reputation_points INTO new_points;
  
  IF new_points >= 500 THEN new_rank := 'Top-Finder';
  ELSIF new_points >= 200 THEN new_rank := 'Experte';
  ELSIF new_points >= 50 THEN new_rank := 'Finder';
  ELSE new_rank := 'Neuling';
  END IF;
  
  UPDATE public.profiles SET reputation_rank = new_rank WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Comment written (+5)
CREATE OR REPLACE FUNCTION public.on_comment_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.update_reputation(NEW.user_id, 5);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_comment_reputation
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.on_comment_created();

-- Trigger: Rating given (+3)
CREATE OR REPLACE FUNCTION public.on_rating_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.update_reputation(NEW.user_id, 3);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_rating_reputation
  AFTER INSERT ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.on_rating_created();

-- Trigger: Like received (+1 to comment author)
CREATE OR REPLACE FUNCTION public.on_like_created()
RETURNS TRIGGER AS $$
DECLARE
  comment_author UUID;
BEGIN
  SELECT user_id INTO comment_author FROM public.comments WHERE id = NEW.comment_id;
  IF comment_author IS NOT NULL THEN
    PERFORM public.update_reputation(comment_author, 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_like_reputation
  AFTER INSERT ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.on_like_created();

-- Trigger: Referral click (+2) and conversion (+20)
CREATE OR REPLACE FUNCTION public.on_referral_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.update_reputation(NEW.referrer_id, 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_referral_reputation
  AFTER INSERT ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.on_referral_created();

CREATE OR REPLACE FUNCTION public.on_referral_converted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.converted = true AND (OLD.converted IS NULL OR OLD.converted = false) THEN
    PERFORM public.update_reputation(NEW.referrer_id, 20);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_referral_conversion_reputation
  AFTER UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.on_referral_converted();
