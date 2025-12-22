'use client';

import { log } from '@/utils/logger';
import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
// import type { TSnsType } from '../login/actions';
import { useLocale } from 'next-intl';
import TermsHtmlModal from '@/components/template/modal/TermsHtmlModal';

import { SNS_APPLE, SNS_GOOGLE, SNS_FACEBOOK } from '@/constants/key';

export interface TermItem {
  id: string;
  label: string;
  required: boolean;
  url?: { ko?: string; en: string };
}

export const terms: TermItem[] = [
  { id: 'age', label: 'Age 14 or older', required: true },
  { id: 'service', label: 'Terms of Service', required: true, url: { ko: '/static/signup_terms/terms_of_use_ko.html', en: '/static/signup_terms/terms_of_use_en.html' } },
  { id: 'location', label: 'Terms and Conditions of Location-based Services', required: true, url: { ko: '/static/signup_terms/terms_and_conditions_of_LBS_BeautyWell_MimoTok_ko.html', en: '/static/signup_terms/terms_and_conditions_of_LBS_BeautyWell_Mimotok_en.html' } },
  { id: 'privacy', label: 'Collection and Use of Personal Information', required: true, url: { ko: '/static/signup_terms/privacy_collection_and_use_MimoTok_ko.html', en: '/static/signup_terms/privacy_collection_and_use_MimoTok_en.html' } },
  { id: 'marketing', label: 'Leverage marketing and advertising', required: false, url: { ko: '/static/signup_terms/leverage_marketing_and_advertising_ko.html', en: '/static/signup_terms/leverage_marketing_and_advertising_en.html' } },
];

export type TSnsType = typeof SNS_FACEBOOK | typeof SNS_GOOGLE | typeof SNS_APPLE;

const snsLoginList: TSnsType[] = [SNS_GOOGLE, SNS_FACEBOOK, SNS_APPLE];

type TermsClientProps = {
  initialProvider?: TSnsType;
};

export default function TermsClient({ initialProvider }: TermsClientProps) {
  const { navigate } = useNavigation();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState<string | undefined>(undefined);
  const [modalTitle, setModalTitle] = useState<string>('View');
  

  const locale = useLocale();
  const currentLocale = locale === 'ko' ? 'ko' : 'en';
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.auth && (data.auth.status === 'active' || data.auth.status === 'pending')) {
            setUser(data.auth);
            setIsSignedIn(true);
          } else {
            setUser(null);
            setIsSignedIn(false);
          }
        } else {
          setUser(null);
          setIsSignedIn(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        setIsSignedIn(false);
      } finally {
        setIsLoaded(true);
      }
    };

    checkAuth();
  }, []);

  const provider = useMemo(() => initialProvider, [initialProvider]);

  const providerLabel = useMemo(() => {
    switch (provider) {
      case "google":
        return "Google";
      case "facebook":
        return "Facebook";
      case "apple":
        return "Apple";
      default:
        return null;
    }
  }, [provider]);

  // View 클릭 시 모달 열기
  const openModal = (src: string | undefined, title: string) => {
    if (!src) return;
    setModalSrc(src);
    setModalTitle(title);
    setModalOpen(true);
  };

  const isAllRequiredChecked = terms
    .filter(term => term.required)
    .every(term => checkedItems[term.id]);

  const handleAgreeAll = (checked: boolean) => {
    const newCheckedItems = terms.reduce((acc, term) => {
      acc[term.id] = checked;
      return acc;
    }, {} as Record<string, boolean>);

    setCheckedItems(newCheckedItems);
  };

  const handleSingleCheck = (id: string, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      navigate('/api/auth/google/start', { replace: true });
      return;
    }

    // 이미 active 상태라면 마이페이지로 이동
    if (user?.status === 'active') {
      navigate('/user/my-page', { replace: true });
      return;
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  const checkSessionStatus = async (maxAttempts = 10, delay = 500) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          log.debug(`Session check ${i+1}:`, data); // 디버그 로그 추가
          if (data.auth?.status === 'active') {
            return true;
          }
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        console.error('Session check error:', error);
      }
    }
    return false;
  };
  

  const handleNext = async () => {
    if (!isAllRequiredChecked || isSubmitting) return;

    if (!isSignedIn || !user) {
      setSubmissionError('세션이 만료되었습니다. 다시 로그인해 주세요.');
      navigate('/login', { replace: true });
      return;
    }

    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/consent/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketingOptIn: checkedItems['marketing'] === true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      // 세션 저장 완료 확인
      const sessionSaved = await checkSessionStatus();
      if (!sessionSaved) {
        throw new Error('세션 저장이 완료되지 않았습니다.');
      }

      // 팝업 윈도우에서 실행 중이면 자동으로 닫기
      if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
        console.log('Terms accepted in popup, closing...');
        window.close();
        return;
      }

      // 일반 윈도우 - 프로필 완성 페이지로 이동
      navigate('/login/onboarding/complete-profile', { replace: true });
    } catch (error) {
      console.error('Failed to save terms agreement', error);
      setSubmissionError('can not save terms agreement. try again please.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome!</h1>
        <p className="text-gray-600 mt-2">
          In order to use BeautyWell, you need to agree to terms and conditions below.
        </p>
        {providerLabel ? (
          <p className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-600">
            Social login selected: <span className="font-semibold">{providerLabel}</span>
          </p>
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="all"
            checked={isAllRequiredChecked}
            onCheckedChange={(checked) => handleAgreeAll(checked as boolean)}
          />
          <label htmlFor="all" className="font-medium">
            Agree with all
          </label>
        </div>

        <div className="space-y-4">
          {terms.map((term) => {
            const termHref = term.url?.[currentLocale] ?? term.url?.en;
            return (
              <div key={term.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={term.id}
                    checked={checkedItems[term.id] || false}
                    onCheckedChange={(checked) => handleSingleCheck(term.id, checked as boolean)}
                  />
                  <label htmlFor={term.id} className="text-sm">
                    {term.required && '[Required] '}
                    {term.label}
                  </label>
                </div>
                {termHref && term.id !== 'age' ? (
                  <button
                    type="button"
                    onClick={() => openModal(termHref, term.label)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        {submissionError ? (
          <p className="text-sm text-red-500">{submissionError}</p>
        ) : null}

        <Button
          className="w-full"
          disabled={!isAllRequiredChecked || isSubmitting}
          onClick={handleNext}
        >
          {isSubmitting ? 'Processing…' : 'Next'}
        </Button>
      </div>

      <TermsHtmlModal
        open={modalOpen}
        src={modalSrc}
        title={modalTitle}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
