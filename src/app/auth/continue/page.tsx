'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function AuthContinuePage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace('/auth/login');
      return;
    }

    const metadata = (user?.publicMetadata ?? {}) as Record<string, unknown>;
    const onboardingCompleted = metadata?.onboarding_completed === true;
    const termsAgreed = metadata?.terms_agreed === true;

    if (onboardingCompleted) {
      router.replace('/');
      return;
    }

    if (!termsAgreed) {
      router.replace('/auth/terms');
      return;
    }

    router.replace('/onboarding/complete-profile');
  }, [isLoaded, isSignedIn, user, router]);

  return null;
}
