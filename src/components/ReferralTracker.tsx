'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackReferral } from '@/lib/referral';

export default function ReferralTracker({ pageSlug }: { pageSlug: string }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      trackReferral(ref, pageSlug);
    }
  }, [searchParams, pageSlug]);

  return null;
}
