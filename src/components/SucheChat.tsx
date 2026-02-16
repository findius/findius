'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, ArrowLeft, MessageCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Question {
  text: string;
  options: string[];
}

interface Answer {
  question: string;
  answer: string;
}

export default function SucheChat() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    async function fetchQuestions() {
      try {
        // Validate query first
        const validateRes = await fetch('/api/validate-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (validateRes.ok) {
          const validation = await validateRes.json();
          if (!validation.valid) {
            setError(
              'Das können wir leider nicht vergleichen. Probiere z.B. „Günstiges Girokonto" oder „Beste Haftpflichtversicherung".'
            );
            setIsLoadingQuestions(false);
            return;
          }
        }

        const res = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (!res.ok) throw new Error('Failed to generate questions');

        const data = await res.json();
        setQuestions(data.questions);
      } catch (err) {
        setError('Fehler beim Laden der Fragen. Bitte versuche es erneut.');
        console.error(err);
      } finally {
        setIsLoadingQuestions(false);
      }
    }

    fetchQuestions();
  }, [query]);

  const handleOptionClick = (questionText: string, option: string) => {
    setAnswers((prev) => [...prev, { question: questionText, answer: option }]);
    setCurrentStep((prev) => prev + 1);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, answers }),
      });

      if (!res.ok) throw new Error('Failed to generate page');

      const data = await res.json();
      router.push(`/suche/${data.slug}`);
    } catch (err) {
      setError('Fehler beim Erstellen der Vergleichsseite. Bitte versuche es erneut.');
      setIsGenerating(false);
      console.error(err);
    }
  };

  const allQuestionsAnswered = questions.length > 0 && currentStep >= questions.length;

  if (!query) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <p className="text-muted-foreground">Keine Suchanfrage angegeben.</p>
        <Link
          href="/"
          className="mt-4 text-sm text-primary hover:underline"
        >
          Zurück zur Startseite
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Startseite
        </Link>

        {/* Query Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/10 p-4">
            <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deine Anfrage</p>
              <p className="mt-0.5 text-lg font-semibold text-foreground">{query}</p>
            </div>
          </div>
        </motion.div>

        {/* Loading Questions */}
        {isLoadingQuestions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-12"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Fragen werden vorbereitet...
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center"
          >
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
            >
              Erneut versuchen
            </button>
          </motion.div>
        )}

        {/* Questions Flow */}
        {!isLoadingQuestions && !error && (
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Answered questions */}
              {answers.map((answer, idx) => (
                <motion.div
                  key={`answered-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {answer.question}
                    </p>
                  </div>
                  <p className="mt-1 ml-6 font-medium text-foreground">
                    {answer.answer}
                  </p>
                </motion.div>
              ))}

              {/* Current question */}
              {!allQuestionsAnswered && questions[currentStep] && (
                <motion.div
                  key={`question-${currentStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl border border-primary/20 bg-card p-5"
                >
                  <p className="mb-4 text-base font-semibold text-foreground">
                    {questions[currentStep].text}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {questions[currentStep].options.map((option) => (
                      <button
                        key={option}
                        onClick={() =>
                          handleOptionClick(questions[currentStep].text, option)
                        }
                        className="rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* CTA Button */}
              {allQuestionsAnswered && !isGenerating && (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="pt-4 text-center"
                >
                  <p className="mb-4 text-sm text-muted-foreground">
                    Perfekt! Wir haben alle Informationen, um deinen Vergleich zu erstellen.
                  </p>
                  <button
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
                  >
                    <Sparkles className="h-5 w-5" />
                    Deinen persönlichen Vergleich erstellen
                  </button>
                </motion.div>
              )}

              {/* Generating State */}
              {isGenerating && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 pt-4"
                >
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="relative">
                      <Sparkles className="h-10 w-10 text-primary" />
                      <Loader2 className="absolute -right-1 -bottom-1 h-5 w-5 animate-spin text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">
                        Dein Vergleich wird erstellt...
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Die KI analysiert und vergleicht die besten Optionen für dich.
                      </p>
                    </div>
                  </div>

                  {/* Skeleton loading */}
                  <div className="space-y-3">
                    <div className="h-6 w-3/4 animate-pulse rounded-lg bg-muted" />
                    <div className="h-4 w-full animate-pulse rounded-lg bg-muted" />
                    <div className="h-4 w-5/6 animate-pulse rounded-lg bg-muted" />
                    <div className="h-4 w-2/3 animate-pulse rounded-lg bg-muted" />
                    <div className="mt-6 h-32 w-full animate-pulse rounded-xl bg-muted" />
                    <div className="h-4 w-full animate-pulse rounded-lg bg-muted" />
                    <div className="h-4 w-4/5 animate-pulse rounded-lg bg-muted" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
