'use client';

import { useEffect, useState, useCallback } from 'react';
import { Heart, Send, Trash2, MessageCircle, Reply } from 'lucide-react';
import { useUser } from '@/components/AuthProvider';
import { createBrowserSupabaseClient } from '@/lib/supabase-auth';
import ReputationBadge from '@/components/ReputationBadge';

const supabase = createBrowserSupabaseClient();

interface Comment {
  id: string;
  page_slug: string;
  user_id: string;
  user_email: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  likes_count: number;
  user_liked: boolean;
  username: string | null;
  reputation_rank: string;
  replies: Comment[];
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

function CommentItem({
  comment,
  user,
  onLike,
  onDelete,
  onReply,
  isReply = false,
}: {
  comment: Comment;
  user: { id: string } | null;
  onLike: (id: string, liked: boolean) => void;
  onDelete: (id: string) => void;
  onReply: (id: string) => void;
  isReply?: boolean;
}) {
  return (
    <div className={`group/comment rounded-xl border border-border/30 bg-card/30 p-4 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:bg-card/50 ${isReply ? '' : ''}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {displayName(comment)[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium">{displayName(comment)}</span>
          <ReputationBadge rank={comment.reputation_rank || 'Neuling'} />
          <span className="text-xs text-muted-foreground/50">{timeAgo(comment.created_at)}</span>
        </div>
        {user?.id === comment.user_id && (
          <button
            onClick={() => onDelete(comment.id)}
            className="rounded-lg p-1.5 text-muted-foreground/30 opacity-0 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group-hover/comment:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <p className="mb-3 text-sm leading-relaxed text-foreground/80">{comment.content}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onLike(comment.id, comment.user_liked)}
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
        {!isReply && user && (
          <button
            onClick={() => onReply(comment.id)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-muted-foreground/50 transition-all hover:bg-muted hover:text-foreground"
          >
            <Reply className="h-3.5 w-3.5" />
            Antworten
          </button>
        )}
      </div>
    </div>
  );
}

export default function Comments({ pageSlug }: { pageSlug: string }) {
  const { user, profile } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*, profiles(username, reputation_rank)')
      .eq('page_slug', pageSlug)
      .order('created_at', { ascending: false });

    if (!commentsData) { setLoading(false); return; }

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

    const allComments = commentsData.map((c: Record<string, unknown>) => {
      const profileData = c.profiles as { username: string; reputation_rank: string } | null;
      return {
        id: c.id as string,
        page_slug: c.page_slug as string,
        user_id: c.user_id as string,
        user_email: c.user_email as string,
        content: c.content as string,
        created_at: c.created_at as string,
        parent_id: (c.parent_id as string) || null,
        likes_count: likesMap[c.id as string]?.count || 0,
        user_liked: likesMap[c.id as string]?.userLiked || false,
        username: profileData?.username || null,
        reputation_rank: profileData?.reputation_rank || 'Neuling',
        replies: [] as Comment[],
      };
    });

    // Organize into tree (1 level deep)
    const topLevel = allComments.filter(c => !c.parent_id);
    const repliesMap: Record<string, Comment[]> = {};
    allComments.filter(c => c.parent_id).forEach(c => {
      if (!repliesMap[c.parent_id!]) repliesMap[c.parent_id!] = [];
      repliesMap[c.parent_id!].push(c);
    });
    topLevel.forEach(c => {
      c.replies = (repliesMap[c.id] || []).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    setComments(topLevel);
    setLoading(false);
  }, [pageSlug, user]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    const text = parentId ? replyContent : content;
    if (!user || !text.trim()) return;
    setSubmitting(true);

    await supabase.from('comments').insert({
      page_slug: pageSlug,
      user_id: user.id,
      user_email: user.email!,
      content: text.trim(),
      parent_id: parentId || null,
    });

    if (parentId) {
      setReplyContent('');
      setReplyTo(null);
    } else {
      setContent('');
    }
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

  const totalCount = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);
  const currentDisplayName = profile?.username || user?.email?.split('@')[0] || '';

  return (
    <section className="mt-16">
      <div className="mb-8 flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">Kommentare</h2>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
          {totalCount}
        </span>
      </div>

      {user ? (
        <form onSubmit={(e) => handleSubmit(e)} className="mb-8">
          <div className="group relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-lg focus-within:shadow-primary/5">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Schreibe einen Kommentar..."
              rows={3}
              className="w-full resize-none rounded-xl bg-transparent px-4 pt-4 pb-14 text-sm outline-none placeholder:text-muted-foreground/60"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground/50">{currentDisplayName}</span>
              <button
                type="submit"
                disabled={!content.trim() || submitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-md disabled:opacity-40"
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
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                user={user}
                onLike={handleLike}
                onDelete={handleDelete}
                onReply={(id) => setReplyTo(replyTo === id ? null : id)}
              />
              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="ml-6 mt-2 space-y-2 border-l-2 border-border/30 pl-4">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      user={user}
                      onLike={handleLike}
                      onDelete={handleDelete}
                      onReply={() => setReplyTo(comment.id)}
                      isReply
                    />
                  ))}
                </div>
              )}
              {/* Reply Form */}
              {replyTo === comment.id && user && (
                <form onSubmit={(e) => handleSubmit(e, comment.id)} className="ml-6 mt-2 border-l-2 border-primary/30 pl-4">
                  <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all focus-within:border-primary/50">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Antwort an ${displayName(comment)}...`}
                      rows={2}
                      autoFocus
                      className="w-full resize-none rounded-xl bg-transparent px-4 pt-3 pb-12 text-sm outline-none placeholder:text-muted-foreground/60"
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { setReplyTo(null); setReplyContent(''); }}
                        className="rounded-lg px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        disabled={!replyContent.trim() || submitting}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Antworten
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
