'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/AuthProvider';
import { createBrowserSupabaseClient } from '@/lib/supabase-auth';
import ReputationBadge from '@/components/ReputationBadge';
import { motion } from 'framer-motion';
import {
  User,
  MessageCircle,
  Star,
  Link2,
  Wallet,
  Calendar,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

const supabase = createBrowserSupabaseClient();

type Tab = 'overview' | 'referrals' | 'comments' | 'ratings' | 'balance';

interface ReferralRow {
  id: string;
  page_slug: string;
  clicked_at: string;
  converted: boolean;
  commission_user: number;
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
  rating: number;
  created_at: string;
}

interface PayoutRow {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
}

export default function DashboardPage() {
  const { user, profile, loading } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [refRes, comRes, ratRes, payRes] = await Promise.all([
        supabase.from('referrals').select('*').order('clicked_at', { ascending: false }),
        supabase.from('comments').select('id, page_slug, content, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('ratings').select('id, page_slug, rating, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('payouts').select('*').order('requested_at', { ascending: false }),
      ]);
      setReferrals((refRes.data || []) as ReferralRow[]);
      setComments((comRes.data || []) as CommentRow[]);
      setRatings((ratRes.data || []) as RatingRow[]);
      setPayouts((payRes.data || []) as PayoutRow[]);
      setDataLoading(false);
    };
    load();
  }, [user]);

  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalEarnings = referrals.reduce((s, r) => s + Number(r.commission_user), 0);
  const totalPaid = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0);
  const balance = totalEarnings - totalPaid;
  const canPayout = balance >= 25;

  const handlePayout = async () => {
    if (!canPayout || !paypalEmail.trim()) return;
    setPayoutSubmitting(true);
    await supabase.from('payouts').insert({
      user_id: user.id,
      amount: balance,
      paypal_email: paypalEmail.trim(),
    });
    const { data } = await supabase.from('payouts').select('*').order('requested_at', { ascending: false });
    setPayouts((data || []) as PayoutRow[]);
    setPaypalEmail('');
    setPayoutSubmitting(false);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Übersicht', icon: <User className="h-4 w-4" /> },
    { id: 'referrals', label: 'Referrals', icon: <Link2 className="h-4 w-4" /> },
    { id: 'comments', label: 'Kommentare', icon: <MessageCircle className="h-4 w-4" /> },
    { id: 'ratings', label: 'Bewertungen', icon: <Star className="h-4 w-4" /> },
    { id: 'balance', label: 'Guthaben', icon: <Wallet className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {dataLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border/50 bg-card/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                    {profile.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{profile.username}</h2>
                    <div className="mt-1 flex items-center gap-2">
                      <ReputationBadge rank={profile.reputation_rank} points={profile.reputation_points} showPoints size="md" />
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Stat label="Kommentare" value={comments.length} />
                  <Stat label="Bewertungen" value={ratings.length} />
                  <Stat label="Referral-Klicks" value={referrals.length} />
                  <Stat label="Guthaben" value={`${balance.toFixed(2)} €`} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Mitglied seit {new Date(user.created_at).toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })}
              </div>
            </div>
          )}

          {tab === 'referrals' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Teile Vergleichsseiten mit deinem persönlichen Link und verdiene 50% der Affiliate-Provision.
              </p>
              {referrals.length === 0 ? (
                <Empty text="Noch keine Referrals. Teile einen Vergleich!" />
              ) : (
                <div className="divide-y divide-border/30 rounded-xl border border-border/50 bg-card/30">
                  {referrals.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4">
                      <div>
                        <Link href={`/vergleich/${r.page_slug}`} className="text-sm font-medium hover:text-primary">
                          {r.page_slug} <ExternalLink className="mb-0.5 inline h-3 w-3" />
                        </Link>
                        <p className="text-xs text-muted-foreground">{new Date(r.clicked_at).toLocaleDateString('de-DE')}</p>
                      </div>
                      <div className="text-right">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${r.converted ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                          {r.converted ? 'Conversion' : 'Klick'}
                        </span>
                        {r.commission_user > 0 && (
                          <p className="mt-1 text-xs font-medium text-green-600">{Number(r.commission_user).toFixed(2)} €</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'comments' && (
            <div className="space-y-3">
              {comments.length === 0 ? (
                <Empty text="Noch keine Kommentare geschrieben." />
              ) : (
                comments.map(c => (
                  <div key={c.id} className="rounded-xl border border-border/30 bg-card/30 p-4">
                    <Link href={`/vergleich/${c.page_slug}`} className="text-xs font-medium text-primary hover:underline">
                      {c.page_slug} <ExternalLink className="mb-0.5 inline h-3 w-3" />
                    </Link>
                    <p className="mt-1 text-sm text-foreground/80">{c.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString('de-DE')}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'ratings' && (
            <div className="space-y-3">
              {ratings.length === 0 ? (
                <Empty text="Noch keine Bewertungen abgegeben." />
              ) : (
                ratings.map(r => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl border border-border/30 bg-card/30 p-4">
                    <Link href={`/vergleich/${r.page_slug}`} className="text-sm font-medium hover:text-primary">
                      {r.page_slug} <ExternalLink className="mb-0.5 inline h-3 w-3" />
                    </Link>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'balance' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border/50 bg-card/50 p-6 text-center">
                <p className="text-sm text-muted-foreground">Aktuelles Guthaben</p>
                <p className="mt-1 text-3xl font-bold">{balance.toFixed(2)} €</p>
                <p className="mt-1 text-xs text-muted-foreground">Auszahlung ab 25,00 €</p>
              </div>

              {canPayout && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <h3 className="mb-3 text-sm font-medium">Auszahlung beantragen</h3>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="PayPal E-Mail"
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <button
                      onClick={handlePayout}
                      disabled={!paypalEmail.trim() || payoutSubmitting}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                    >
                      {payoutSubmitting ? '...' : `${balance.toFixed(2)} € auszahlen`}
                    </button>
                  </div>
                </div>
              )}

              {payouts.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-medium">Auszahlungshistorie</h3>
                  <div className="divide-y divide-border/30 rounded-xl border border-border/50 bg-card/30">
                    {payouts.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4">
                        <div>
                          <p className="text-sm font-medium">{Number(p.amount).toFixed(2)} €</p>
                          <p className="text-xs text-muted-foreground">{new Date(p.requested_at).toLocaleDateString('de-DE')}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          p.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          p.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                        }`}>
                          {p.status === 'pending' ? 'Ausstehend' : p.status === 'processing' ? 'In Bearbeitung' : p.status === 'completed' ? 'Ausgezahlt' : 'Fehlgeschlagen'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/30 bg-card/30 p-3 text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 py-12 text-center">
      <p className="text-sm text-muted-foreground/60">{text}</p>
    </div>
  );
}
