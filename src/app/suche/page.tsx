import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import SucheChat from '@/components/SucheChat';

export const metadata: Metadata = {
  title: 'Suche | findius',
  description: 'Erstelle deinen personalisierten Vergleich mit KI-Unterstützung.',
  robots: {
    index: false,
    follow: true,
  },
};

function SucheLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function SuchePage() {
  return (
    <Suspense fallback={<SucheLoading />}>
      <SucheChat />
    </Suspense>
  );
}
