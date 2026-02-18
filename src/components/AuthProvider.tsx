'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { createBrowserSupabaseClient } from '@/lib/supabase-auth';

interface Profile {
  username: string;
  avatar_url: string | null;
  reputation_points: number;
  reputation_rank: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const supabaseRef = useRef<ReturnType<typeof createBrowserSupabaseClient> | null>(null);

  function getClient() {
    if (!supabaseRef.current) {
      supabaseRef.current = createBrowserSupabaseClient();
    }
    return supabaseRef.current;
  }

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await getClient()
        .from('profiles')
        .select('username, avatar_url, reputation_points, reputation_rank')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error('Profile fetch failed:', err);
      return null;
    }
  };

  const createProfileFromStorage = async (userId: string): Promise<Profile | null> => {
    try {
      const pendingUsername = localStorage.getItem('findius_pending_username');
      if (!pendingUsername) return null;

      const { data, error } = await getClient()
        .from('profiles')
        .insert({ id: userId, username: pendingUsername })
        .select('username, avatar_url, reputation_points, reputation_rank')
        .single();

      if (!error && data) {
        localStorage.removeItem('findius_pending_username');
        return data as Profile;
      }
      return null;
    } catch (err) {
      console.error('Profile creation failed:', err);
      return null;
    }
  };

  useEffect(() => {
    const client = getClient();

    // Initial session check
    client.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        let p = await fetchProfile(currentUser.id);
        if (!p) {
          // Maybe profile needs to be created from pending registration
          p = await createProfileFromStorage(currentUser.id);
        }
        setProfile(p);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('getSession failed:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (event === 'SIGNED_IN' && currentUser) {
        let p = await fetchProfile(currentUser.id);
        if (!p) {
          p = await createProfileFromStorage(currentUser.id);
        }
        setProfile(p);
        setShowWelcome(true);
        setLoading(false);
      }

      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setShowWelcome(false);
      }
    });

    // Safety: ensure loading is false after 3 seconds max
    const timeout = setTimeout(() => setLoading(false), 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
    await getClient().auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const displayName = profile?.username ?? user?.email?.split('@')[0] ?? '';

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
      {showWelcome && user && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowWelcome(false)}
        >
          <div
            className="mx-4 max-w-sm animate-in fade-in zoom-in-95 rounded-2xl bg-card p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 text-5xl">👋</div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              Hey {displayName}!
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Willkommen zurück bei findius! Du kannst jetzt Vergleiche bewerten, kommentieren und deine Favoriten speichern.
            </p>
            <button
              onClick={() => setShowWelcome(false)}
              className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Los geht&apos;s! 🚀
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useUser() {
  return useContext(AuthContext);
}
