'use client';

import { useEffect, useState, useCallback } from 'react';
import { Heart, Send, Trash2, MessageCircle } from 'lucide-react';
import { useUser } from '@/components/AuthProvider';
import { createBrowserSupabaseClient } from '@/lib/supabase-auth';

const supabase = createBrowserSupabaseClient();

interface Comment {
  id: string;
  page_slug: string;
  user_id: string;
  user_email: string;
  content: string;
  created_at: string;
  likes_count: number;
  user_liked: boolean;
  username: string | null;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'gerade eben';
  if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`;
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std.`;
  if (diff < 2592000) return `vor ${Math.floor(diff / 86400)} Tagen`;
  return new Date(dateStr).toLocaleDateString('de-DE');
}

function displayName(comment: Comment) {
  return comment.username || comment.user_email.split('@')[0];
}

export default function Comments({ pageSlug }: { pageSlug: string }) {
  const { user, profile } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('page_slug', pageSlug)
      .order('created_at', { ascending: false });

    if (!commentsData) { setLoading(false); return; }

    // Fetch likes counts
    const commentIds = commentsData.map((c: Record<string, unknown>) => c.id as string);
    const { data: likesData } = await supabase
      .from('comment_likes')
      .select('comment_id, user_id')
      .in('comment_id', commentIds.length ? commentIds : ['__none__']);

    const likesMap: Record<string, { count: number; userLiked: boolean }> = {};
    (likesData || []).forEach((l: Record<string, unknown>) => {
      const cid = l.comment_id as string;
      if (!likesMap[cid]) likesMap[cid] = { count: 0, userLiked: false };
      likesMap[cid].count++;
      if (user && l.user_id === user.id) likesMap[cid].userLiked = true;
    });

    setComments(
      commentsData.map((c: Record<string, unknown>) => {
        const profileData = c.profiles as { username: string } | null;
        return {
          id: c.id as string,
          page_slug: c.page_slug as string,
          user_id: c.user_id as string,
          user_email: c.user_email as string,
          content: c.content as string,
          created_at: c.created_at as string,
          likes_count: likesMap[c.id as string]?.count || 0,
          user_liked: likesMap[c.id as string]?.userLiked || false,
          username: profileData?.username || null,
        };
      })
    );
    setLoading(false);
  }, [pageSlug, user]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;
    setSubmitting(true);

    await supabase.from('comments').insert({
      page_slug: pageSlug,
      user_id: user.id,
      user_email: user.email!,
      content: content.trim(),
    });

    setContent('');
    setSubmitting(false);
    fetchComments();
  };

  const handleLike = async (commentId: string, userLiked: boolean) => {
    if (!user) return;
    if (userLiked) {
      await supabase.from('comment_likes').delete().match({ comment_id: commentId, user_id: user.id });
    } else {
      await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id });
    }
    fetchComments();
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;
    await supabase.from('comments').delete().match({ id: commentId, user_id: user.id });
    fetchComments();
  };

  const currentDisplayName = profile?.username || user?.email?.split('@')[0] || '';

  return (
    <section className="mt-16">
      <div className="mb-8 flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">Kommentare</h2>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
          {comments.length}
        </span>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="group relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-lg focus-within:shadow-primary/5">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Schreibe einen Kommentar..."
              rows={3}
              className="w-full resize-none rounded-xl bg-transparent px-4 pt-4 pb-14 text-sm outline-none placeholder:text-muted-foreground/60"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground/50">
                {currentDisplayName}
              </span>
              <button
                type="submit"
                disabled={!content.trim() || submitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-md disabled:opacity-40 disabled:hover:shadow-none"
              >
                <Send className="h-3.5 w-3.5" />
                Senden
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-xl border border-dashed border-border/50 bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <a href="/login" className="font-medium text-primary hover:underline">Melde dich an</a>
            {' '}um einen Kommentar zu schreiben.
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 py-12 text-center">
          <MessageCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground/60">Noch keine Kommentare. Sei der Erste!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="group/comment rounded-xl border border-border/30 bg-card/30 p-4 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:bg-card/50"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {displayName(comment)[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{displayName(comment)}</span>
                  <span className="text-xs text-muted-foreground/50">{timeAgo(comment.created_at)}</span>
                </div>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="rounded-lg p-1.5 text-muted-foreground/30 opacity-0 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group-hover/comment:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="mb-3 text-sm leading-relaxed text-foreground/80">{comment.content}</p>
              <button
                onClick={() => handleLike(comment.id, comment.user_liked)}
                disabled={!user}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all duration-200 ${
                  comment.user_liked
                    ? 'bg-red-500/10 text-red-500'
                    : 'text-muted-foreground/50 hover:bg-muted hover:text-red-400'
                } disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-muted-foreground/50`}
              >
                <Heart className={`h-3.5 w-3.5 transition-transform duration-200 ${comment.user_liked ? 'fill-current scale-110' : ''}`} />
                {comment.likes_count > 0 && comment.likes_count}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
