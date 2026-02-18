import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Redirect to destination — force full page reload to pick up cookies
      const redirectUrl = new URL(next, origin);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(new URL('/login?error=auth', origin));
}
