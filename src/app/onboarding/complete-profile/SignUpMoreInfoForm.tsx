'use client';

import { useRouter } from 'next/navigation';

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
  const [user, setUser] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [form, setForm] = useState({
    ...initialForm,
    nickname: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAgreement, setCheckingAgreement] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    setCheckingAgreement(true);
    setStatusError(null);

    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        // 정보처리방침 동의한 순간에도 pending 상태로 떨어질수있어서 조건추가 
        if (data.auth && (data.auth.status === 'active' || data.auth.status === 'pending')) {
          setUser(data.auth);
          setIsSignedIn(true);
          setForm(prev => ({ ...prev, nickname: data.auth.email?.split('@')[0] || '' }));
        } else {
          console.log('Auth check failed, redirecting to login. Auth data:', data.auth);
          router.replace('/api/auth/google/start');
          return;
        }
      } else {
        router.replace('/api/auth/google/start');
        return;
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setStatusError('인증 상태를 확인하지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setCheckingAgreement(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);



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
          onClick={checkAuth}
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
