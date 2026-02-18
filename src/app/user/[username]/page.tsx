'use client';

import { useEffect, useState, use } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-auth';
import ReputationBadge from '@/components/ReputationBadge';
import Link from 'next/link';
import { ArrowLeft, Calendar, MessageCircle, Star, ExternalLink } from 'lucide-react';

let _supabase: ReturnType<typeof createBrowserSupabaseClient> | null = null;
function getSupabase() { if (!_supabase) _supabase = createBrowserSupabaseClient(); return _supabase; }

interface ProfileData {
  id: string;
  username: string;
  avatar_url: string | null;
  reputation_points: number;
  reputation_rank: string;
  created_at: string;
}

interface CommentRow {
  id: string;
  page_slug: string;
  content: string;
  created_at: string;
}

interface RatingRow {
  id: string;
  page_slug: string;
  score: number;
  created_at: string;
}

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: p } = await getSupabase()
        .from('profiles')
        .select('id, username, avatar_url, reputation_points, reputation_rank, created_at')
        .eq('username', username)
        .single();

      if (!p) { setNotFound(true); setLoading(false); return; }
      setProfile(p as ProfileData);

      const [comRes, ratRes] = await Promise.all([
        getSupabase().from('comments').select('id, page_slug, content, created_at').eq('user_id', p.id).is('parent_id', null).order('created_at', { ascending: false }).limit(20),
        getSupabase().from('ratings').select('id, page_slug, score, created_at').eq('user_id', p.id).order('created_at', { ascending: false }).limit(20),
      ]);
      setComments((comRes.data || []) as CommentRow[]);
      setRatings((ratRes.data || []) as RatingRow[]);
      setLoading(false);
    };
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Benutzer nicht gefunden</h1>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline">Zurück zur Startseite</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Zurück
      </Link>

      <div className="rounded-xl border border-border/50 bg-card/50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {profile.username[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{profile.username}</h1>
            <div className="mt-1 flex items-center gap-2">
              <ReputationBadge rank={profile.reputation_rank} points={profile.reputation_points} showPoints size="md" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Mitglied seit {new Date(profile.created_at).toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <MessageCircle className="h-5 w-5 text-primary" /> Kommentare
        </h2>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Kommentare.</p>
        ) : (
          <div className="space-y-3">
            {comments.map(c => (
              <div key={c.id} className="rounded-xl border border-border/30 bg-card/30 p-4">
                <Link href={`/vergleich/${c.page_slug}`} className="text-xs font-medium text-primary hover:underline">
                  {c.page_slug} <ExternalLink className="mb-0.5 inline h-3 w-3" />
                </Link>
                <p className="mt-1 text-sm text-foreground/80">{c.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString('de-DE')}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ratings */}
      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <Star className="h-5 w-5 text-primary" /> Bewertungen
        </h2>
        {ratings.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Bewertungen.</p>
        ) : (
          <div className="space-y-3">
            {ratings.map(r => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-border/30 bg-card/30 p-4">
                <Link href={`/vergleich/${r.page_slug}`} className="text-sm font-medium hover:text-primary">
                  {r.page_slug} <ExternalLink className="mb-0.5 inline h-3 w-3" />
                </Link>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.score ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
