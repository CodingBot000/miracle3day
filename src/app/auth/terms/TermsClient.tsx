'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
// import type { TSnsType } from '../login/actions';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import TermsHtmlModal from '@/components/template/modal/TermsHtmlModal';
import { useUser } from '@clerk/nextjs';
import { SNS_APPLE, SNS_GOOGLE, SNS_FACEBOOK } from '@/constants/key';

interface TermItem {
  id: string;
  label: string;
  required: boolean;
  url?: { ko?: string; en: string };
}

const terms: TermItem[] = [
  { id: 'age', label: 'Age 14 or older', required: true },
  { id: 'service', label: 'Terms of Service', required: true, url: { ko: '/contents/signup_terms/terms_of_use_ko.html', en: '/contents/signup_terms/terms_of_use_en.html' } },
  { id: 'location', label: 'Terms and Conditions of Location-based Services', required: true, url: { ko: '/contents/signup_terms/terms_and_conditions_of_LBS_BeautyWell_MimoTok_ko.html', en: '/contents/signup_terms/terms_and_conditions_of_LBS_BeautyWell_Mimotok_en.html' } },
  { id: 'privacy', label: 'Collection and Use of Personal Information', required: true, url: { ko: '/contents/signup_terms/privacy_collection_and_use_MimoTok_ko.html', en: '/contents/signup_terms/privacy_collection_and_use_MimoTok_en.html' } },
  { id: 'marketing', label: 'Leverage marketing and advertising', required: false, url: { ko: '/contents/signup_terms/leverage_marketing_and_advertising_ko.html', en: '/contents/signup_terms/leverage_marketing_and_advertising_en.html' } },
];

export type TSnsType = typeof SNS_FACEBOOK | typeof SNS_GOOGLE | typeof SNS_APPLE;

const snsLoginList: TSnsType[] = [SNS_GOOGLE, SNS_FACEBOOK, SNS_APPLE];

type TermsClientProps = {
  initialProvider?: TSnsType;
};

export default function TermsClient({ initialProvider }: TermsClientProps) {
  const router = useRouter();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState<string | undefined>(undefined);
  const [modalTitle, setModalTitle] = useState<string>('View');
  

  const { language } = useCookieLanguage();
  const locale = language === 'ko' ? 'ko' : 'en';
  const { user, isLoaded, isSignedIn } = useUser();

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
      if (term.required) {
        acc[term.id] = checked;
      }
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
      router.replace('/auth/login');
      return;
    }

    const metadata = (user?.publicMetadata ?? {}) as Record<string, unknown>;
    if (metadata?.terms_agreed === true) {
      router.replace('/onboarding/complete-profile');
    }
  }, [isLoaded, isSignedIn, user, router]);

  const handleNext = async () => {
    if (!isAllRequiredChecked || isSubmitting) return;

    if (!isSignedIn || !user) {
      setSubmissionError('세션이 만료되었습니다. 다시 로그인해 주세요.');
      router.replace('/auth/login');
      return;
    }

    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/terms/agree', {
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

      router.replace('/onboarding/complete-profile');
    } catch (error) {
      console.error('Failed to save terms agreement', error);
      setSubmissionError('동의 내용을 저장하지 못했습니다. 다시 시도해 주세요.');
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
            Agree with all (excluding optional)
          </label>
        </div>

        <div className="space-y-4">
          {terms.map((term) => {
            const termHref = term.url?.[locale] ?? term.url?.en;
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
