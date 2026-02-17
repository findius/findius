'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-auth';
import { Mail, ArrowLeft, Loader2, CheckCircle, User, AtSign } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const supabase = createBrowserSupabaseClient();

type Step = 'email' | 'register' | 'sent';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);

  const validateUsername = (val: string) => {
    if (val.length < 5) return 'Mindestens 5 Zeichen';
    if (val.length > 15) return 'Maximal 15 Zeichen';
    if (!/^[a-zA-Z0-9_]+$/.test(val)) return 'Nur Buchstaben, Zahlen und _';
    return '';
  };

  const handleUsernameChange = async (val: string) => {
    setUsername(val);
    const validationError = validateUsername(val);
    setUsernameError(validationError);
    if (validationError) return;

    setCheckingUsername(true);
    const { data, error } = await supabase.rpc('check_username_available', { check_username: val });
    setCheckingUsername(false);
    if (error) {
      setUsernameError('Fehler bei der Prüfung');
    } else if (!data) {
      setUsernameError('Username bereits vergeben');
    } else {
      setUsernameError('');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.rpc('check_email_exists', { check_email: email });
      if (error) throw error;

      if (data) {
        // Existing user — send magic link directly
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (otpError) throw otpError;
        setStep('sent');
      } else {
        // New user — show registration
        setStep('register');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameError || !agreedToTerms) return;
    setLoading(true);
    setError('');

    try {
      // Store username in localStorage for profile creation after auth
      localStorage.setItem('findius_pending_username', username);

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (otpError) throw otpError;
      setStep('sent');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Link>

        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.div
              key="email"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
                Anmelden
              </h1>
              <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
                Gib deine E-Mail-Adresse ein, um fortzufahren.
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="deine@email.de"
                    required
                    className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-blue-400"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Weiter'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 'register' && (
            <motion.div
              key="register"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
                Konto erstellen
              </h1>
              <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
                Wähle einen Nutzernamen für dein Profil.
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Email readonly */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                  />
                </div>

                {/* Username */}
                <div>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="nutzername"
                      required
                      minLength={5}
                      maxLength={15}
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors ${
                        usernameError
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-700'
                          : username && !checkingUsername && !usernameError
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700'
                            : 'border-zinc-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:focus:border-blue-400'
                      } bg-white text-zinc-900 placeholder-zinc-400 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500`}
                    />
                    {checkingUsername && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400" />
                    )}
                    {username && !checkingUsername && !usernameError && (
                      <CheckCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {usernameError && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">{usernameError}</p>
                  )}
                  <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                    5–15 Zeichen, Buchstaben, Zahlen und _
                  </p>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
                  />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Ich stimme den{' '}
                    <Link href="/agb" className="text-blue-600 hover:underline dark:text-blue-400">AGB</Link>
                    {' '}und der{' '}
                    <Link href="/datenschutz" className="text-blue-600 hover:underline dark:text-blue-400">Datenschutzerklärung</Link>
                    {' '}zu.
                  </span>
                </label>

                {error && (
                  <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !!usernameError || !username || !agreedToTerms || checkingUsername}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Registrieren & Magic Link senden'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(''); }}
                  className="w-full text-center text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  Andere E-Mail verwenden
                </button>
              </form>
            </motion.div>
          )}

          {step === 'sent' && (
            <motion.div
              key="sent"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950/30">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                  Magic Link gesendet!
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Schau in dein Postfach (<strong>{email}</strong>) und klicke den Link.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
