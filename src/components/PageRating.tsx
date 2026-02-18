'use client';

import { useEffect, useState, useCallback } from 'react';
import { Star } from 'lucide-react';
import { useUser } from '@/components/AuthProvider';
import { createBrowserSupabaseClient } from '@/lib/supabase-auth';

let _supabase: ReturnType<typeof createBrowserSupabaseClient> | null = null;
function getSupabase() { if (!_supabase) _supabase = createBrowserSupabaseClient(); return _supabase; }

export default function PageRating({ pageSlug }: { pageSlug: string }) {
  const { user } = useUser();
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRatings = useCallback(async () => {
    const { data } = await getSupabase()
      .from('ratings')
      .select('score, user_id')
      .eq('page_slug', pageSlug);

    if (data && data.length > 0) {
      setCount(data.length);
      setAverage(data.reduce((sum, r) => sum + r.score, 0) / data.length);
      if (user) {
        const mine = data.find((r) => r.user_id === user.id);
        setUserScore(mine?.score ?? null);
      }
    } else {
      setCount(0);
      setAverage(0);
    }
  }, [pageSlug, user]);

  useEffect(() => { fetchRatings(); }, [fetchRatings]);

  const handleRate = async (score: number) => {
    if (!user || submitting) return;
    setSubmitting(true);

    if (userScore) {
      await getSupabase().from('ratings').update({ score }).match({ page_slug: pageSlug, user_id: user.id });
    } else {
      await getSupabase().from('ratings').insert({ page_slug: pageSlug, user_id: user.id, score });
    }

    setUserScore(score);
    setSubmitting(false);
    fetchRatings();
  };

  const displayScore = hovered ?? userScore ?? 0;

  return (
    <section className="mt-12">
      <div className="inline-flex flex-col items-center gap-3 rounded-2xl border border-border/30 bg-card/30 px-8 py-6 backdrop-blur-sm">
        <h3 className="text-sm font-medium text-muted-foreground">Wie hilfreich war dieser Artikel?</h3>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              disabled={!user || submitting}
              onClick={() => handleRate(star)}
              onMouseEnter={() => user && setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              className="group/star rounded-lg p-1 transition-transform duration-150 hover:scale-125 disabled:cursor-default disabled:hover:scale-100"
            >
              <Star
                className={`h-7 w-7 transition-all duration-200 ${
                  star <= displayScore
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                    : 'text-muted-foreground/25 group-hover/star:text-amber-300/50'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          {count > 0 ? (
            <>
              <span className="font-medium text-amber-400">{average.toFixed(1)}</span>
              <span>·</span>
              <span>{count} {count === 1 ? 'Bewertung' : 'Bewertungen'}</span>
            </>
          ) : (
            <span>Noch keine Bewertungen</span>
          )}
        </div>

        {!user && (
          <p className="text-xs text-muted-foreground/40">
            <a href="/login" className="text-primary/70 hover:text-primary hover:underline">Melde dich an</a> um zu bewerten
          </p>
        )}
      </div>
    </section>
  );
}
