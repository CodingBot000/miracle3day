'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import AnalyzingAnimation from './components/AnalyzingAnimation';

export default function AnalyzingPage() {
  const { navigate } = useNavigation();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3000; // 3 seconds
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            navigate(`/${locale}/skincare-onboarding/recommend-routine`);
          }, 500);
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [navigate, locale]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <AnalyzingAnimation progress={progress} />
    </div>
  );
}
