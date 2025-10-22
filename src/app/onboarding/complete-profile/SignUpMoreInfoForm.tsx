'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';


const initialForm = {
  id_country: '',
  birth_date: '',
  gender: '',
  secondary_email: '',
  phone_country_code: '',
  phone_number: '',
  nickname: '',
};

export default function SignUpMoreInfoForm() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [form, setForm] = useState({
    ...initialForm,
    nickname: user?.fullName ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAgreement, setCheckingAgreement] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  const checkAgreementStatus = useCallback(async () => {
    setCheckingAgreement(true);
    setStatusError(null);

    let redirecting = false;

    try {
      const res = await fetch('/api/auth/getUser/agreement_status', { cache: 'no-store' });

      if (res.status === 401) {
        redirecting = true;
        router.replace('/auth/login');
        return;
      }

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data: { satisfied: boolean; missing: string[] } = await res.json();

      if (!data.satisfied) {
        redirecting = true;
        router.replace('/auth/terms');
        return;
      }
    } catch (err) {
      console.error('Failed to verify agreement status', err);
      setStatusError('약관 동의 상태를 확인하지 못했습니다. 다시 시도해 주세요.');
    } finally {
      if (!redirecting) {
        setCheckingAgreement(false);
      }
    }
  }, [router]);

  useEffect(() => {
    if (!isSignedIn) return;
    checkAgreementStatus();
  }, [isSignedIn, checkAgreementStatus]);

  if (!isSignedIn) {
    router.replace('/auth/login');
    return null;
  }

  if (checkingAgreement) {
    return (
      <div className="space-y-6 rounded-2xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur">
        <p className="text-sm text-slate-500">약관 동의 상태를 확인하는 중입니다…</p>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="space-y-6 rounded-2xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur">
        <p className="text-sm text-red-500">{statusError}</p>
        <button
          type="button"
          onClick={checkAgreementStatus}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const handleChange = (field: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to complete onboarding');
      }

      router.replace('/');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Complete your profile</h1>
        <p className="mt-2 text-sm text-slate-500">
          Tell us a bit more so we can personalize your experience.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600">Nickname</label>
          <input
            type="text"
            value={form.nickname}
            onChange={handleChange('nickname')}
            className="w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600">Country</label>
          <input
            type="text"
            value={form.id_country}
            onChange={handleChange('id_country')}
            placeholder="e.g. KR"
            className="w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600">Birth date</label>
          <input
            type="date"
            value={form.birth_date}
            onChange={handleChange('birth_date')}
            className="w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600">Gender</label>
          <input
            type="text"
            value={form.gender}
            onChange={handleChange('gender')}
            placeholder="female / male / other"
            className="w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600">Secondary email</label>
          <input
            type="email"
            value={form.secondary_email}
            onChange={handleChange('secondary_email')}
            className="w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600">Phone country code</label>
          <input
            type="text"
            value={form.phone_country_code}
            onChange={handleChange('phone_country_code')}
            placeholder="e.g. +82"
            className="w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600">Phone number</label>
          <input
            type="text"
            value={form.phone_number}
            onChange={handleChange('phone_number')}
            className="w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <button
        type="button"
        disabled={submitting}
        onClick={handleSubmit}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {submitting ? 'Saving...' : 'Finish'}
      </button>
    </div>
  );
}
