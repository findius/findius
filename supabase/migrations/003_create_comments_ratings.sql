-- Kommentare
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_page ON comments(page_slug);
CREATE INDEX idx_comments_user ON comments(user_id);

-- Bewertungen (1-5 Sterne pro Seite pro User)
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_slug, user_id)  -- Ein User kann pro Seite nur einmal bewerten
);

CREATE INDEX idx_ratings_page ON ratings(page_slug);

-- Likes auf Kommentare
CREATE TABLE comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- RLS Policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Auth insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own delete comments" ON comments FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read ratings" ON ratings FOR SELECT USING (true);
CREATE POLICY "Auth upsert ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth update ratings" ON ratings FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read likes" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Auth toggle likes" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth remove likes" ON comment_likes FOR DELETE USING (auth.uid() = user_id);
