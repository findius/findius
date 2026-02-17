import { createBrowserSupabaseClient } from '@/lib/supabase-auth';

export function getReferralCode(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/findius_ref=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setReferralCookie(refCode: string) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `findius_ref=${encodeURIComponent(refCode)};expires=${expires};path=/;SameSite=Lax`;
}

export async function trackReferral(refCode: string, pageSlug: string) {
  setReferralCookie(refCode);
  
  const visitorId = getVisitorId();
  const supabase = createBrowserSupabaseClient();
  
  // Look up referrer profile
  const { data: referrer } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', refCode)
    .single();
  
  if (!referrer) return;

  await supabase.from('referrals').insert({
    referrer_id: referrer.id,
    visitor_id: visitorId,
    page_slug: pageSlug,
    ref_code: refCode,
  });
}

function getVisitorId(): string {
  if (typeof localStorage === 'undefined') return crypto.randomUUID();
  let id = localStorage.getItem('findius_visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('findius_visitor_id', id);
  }
  return id;
}
