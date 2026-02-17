'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createBrowserSupabaseClient } from '@/lib/supabase-auth';

const supabase = createBrowserSupabaseClient();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session?.user) {
        setShowWelcome(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
      {showWelcome && user && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowWelcome(false)}
        >
          <div
            className="mx-4 max-w-sm animate-in fade-in zoom-in-95 rounded-2xl bg-card p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 text-5xl">👋</div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              Willkommen bei findius!
            </h2>
            <p className="mb-1 text-sm text-muted-foreground">
              Eingeloggt als
            </p>
            <p className="mb-6 font-medium text-foreground">
              {user.email}
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              Du kannst jetzt Vergleiche bewerten, kommentieren und deine Favoriten speichern.
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
