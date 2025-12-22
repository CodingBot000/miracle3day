'use client';

import { log } from '@/utils/logger';
import { useNavigation } from '@/hooks/useNavigation';
import React, { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { NationModal } from '@/components/template/modal/NationModal';
import { CountryCode } from '@/models/country-code.dto';
import { findCountry } from '@/constants/country';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const initialForm = {
  id_country: '',
  birth_date: '',
  gender: '',
  secondary_email: '',
  phone_country_code: '',
  phone_number: '',
};

// 18세 이상 제한을 위한 날짜 계산
const getMaxDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date;
};

// 100세 제한을 위한 날짜 계산
const getMinDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 100);
  return date;
};

export default function SignUpMoreInfoForm() {
  const t = useTranslations('signUpMoreInfo');
  const { navigate, goBack } = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [nation, setNation] = useState<CountryCode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAgreement, setCheckingAgreement] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const checkAuth = async () => {
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
        } else {
          log.debug('Auth check failed, redirecting to login. Auth data:', data.auth);
          navigate('/api/auth/google/start', { replace: true });
          return;
        }
      } else {
        navigate('/api/auth/google/start', { replace: true });
        return;
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setStatusError('AUTH_CHECK_ERROR');
    } finally {
      setCheckingAgreement(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 기존 프로필 데이터 조회 및 폼 채우기
  useEffect(() => {
    if (!isSignedIn) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/onboarding/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            const profile = data.profile;

            // 폼 데이터 설정
            setForm((prev) => ({
              ...prev,
              gender: profile.gender || '',
              secondary_email: profile.secondary_email || '',
              phone_number: profile.phone_number ? profile.phone_number.replace(/^\+\d+/, '') : '',
            }));

            // 생년월일 설정
            if (profile.birth_date) {
              setBirthDate(new Date(profile.birth_date));
            }

            // 국가 설정
            if (profile.id_country) {
              const country = findCountry(profile.id_country);
              if (country) {
                setNation(country);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    fetchProfile();
  }, [isSignedIn]);



  if (checkingAgreement) {
    return (
      <div className="space-y-6 rounded-2xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur">
        <p className="text-sm text-slate-500">{t('checkingAgreement')}</p>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="space-y-6 rounded-2xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur">
        <p className="text-sm text-red-500">{t('authCheckError')}</p>
        <button
          type="button"
          onClick={checkAuth}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          {t('retryButton')}
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
      // birthDate를 YYYY-MM-DD 형식으로 변환
      let formattedBirthDate = '';
      if (birthDate) {
        const year = birthDate.getFullYear();
        const month = String(birthDate.getMonth() + 1).padStart(2, '0');
        const day = String(birthDate.getDate()).padStart(2, '0');
        formattedBirthDate = `${year}-${month}-${day}`;
      }

      // nation의 country_code를 id_country로 설정
      // phone_country_code와 phone_number를 결합 (+{phone_code}{phone_number})
      const phoneCode = nation?.phone_code || '82';
      const fullPhoneNumber = form.phone_number
        ? `+${phoneCode}${form.phone_number}`
        : '';

      const submitData = {
        ...form,
        birth_date: formattedBirthDate || form.birth_date,
        id_country: nation?.country_code || form.id_country,
        phone_country_code: nation?.phone_code ? `+${nation.phone_code}` : '+82',
        phone_number: fullPhoneNumber,
      };

      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to complete onboarding');
      }

      // 팝업 윈도우에서 실행 중이면 자동으로 닫기
      if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
        console.log('Profile completed in popup, closing...');
        window.close();
        return;
      }

      // 세션이 업데이트되었으므로 window.location.href로 완전히 새로고침하며 이동
      // AuthClient가 업데이트된 세션 정보를 반영하도록 함
      window.location.href = '/';
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
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => goBack()}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label={t('goBackLabel')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-semibold text-slate-900">{t('title')}</h1>
        </div>
        <p className="mt-2 text-sm text-slate-500">
        {t('description')}
        <br />
        {t('descriptionSecondary')}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <Label htmlFor="nationality">{t('fields.nationality')}</Label>
          <NationModal
            nation={nation?.country_name || ''}
            onSelect={(value: CountryCode) => setNation(value)}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-medium text-slate-600">{t('fields.birthDate')}</Label>
          <p className="text-xs text-slate-500 mb-1">{t('fields.birthDateHint')}</p>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal rounded-lg border border-slate-200 bg-white/70 shadow-sm px-3 py-2 h-auto",
                  !birthDate && "text-muted-foreground"
                )}
              >
                <div className="flex items-center w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm flex-1">
                    {birthDate ? format(birthDate, 'yyyy-MM-dd') : t('fields.birthDatePlaceholder')}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={birthDate || undefined}
                onSelect={(date) => {
                  setBirthDate(date || null);
                  setIsCalendarOpen(false);
                }}
                disabled={(date) => {
                  const minDate = getMinDate();
                  const maxDate = getMaxDate();
                  return date < minDate || date > maxDate;
                }}
                defaultMonth={birthDate || getMaxDate()}
                className="p-0"
                classNames={{
                  months: "flex flex-col sm:flex-row p-0",
                  month: "space-y-4 p-0",
                  caption: "flex justify-center pt-1 pb-2 relative",
                  caption_label: "text-sm font-medium",
                  caption_dropdowns: "flex justify-center gap-1",
                  nav: "flex items-center gap-1",
                  nav_button: cn(
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                  ),
                  nav_button_previous: "",
                  nav_button_next: "",
                  table: "w-full border-collapse p-0",
                  head_row: "flex w-full",
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex-1 flex items-center justify-center",
                  row: "flex w-full mt-2",
                  cell: "flex-1 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: cn(
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 mx-auto"
                  ),
                  day_selected: "bg-slate-900 text-white hover:bg-slate-900 hover:text-white focus:bg-slate-900 focus:text-white",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-gray-300 opacity-50",
                  day_disabled: "!text-gray-400 !opacity-40 !cursor-not-allowed hover:!bg-transparent",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-medium text-slate-600">{t('fields.gender')}</Label>
          <RadioGroup
            value={form.gender}
            onValueChange={(value) => setForm((prev) => ({ ...prev, gender: value }))}
            className="flex space-x-4 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="font-normal cursor-pointer">{t('fields.genderMale')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="font-normal cursor-pointer">{t('fields.genderFemale')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="font-normal cursor-pointer">{t('fields.genderOther')}</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-medium text-slate-600">{t('fields.secondaryEmail')}</Label>
          <input
            type="email"
            value={form.secondary_email}
            onChange={handleChange('secondary_email')}
            className="w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm"
            placeholder={t('fields.secondaryEmailPlaceholder')}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-medium text-slate-600">{t('fields.phoneNumber')}</Label>
          <div className="flex gap-2">
            {/* Phone country code (read-only) */}
            <div className="w-24 flex-shrink-0">
              <input
                type="text"
                value={nation?.phone_code ? `+${nation.phone_code}` : '+82'}
                readOnly
                className="w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm text-center font-medium text-gray-700"
              />
            </div>
            {/* Phone number input */}
            <div className="flex-1">
              <input
                type="text"
                value={form.phone_number}
                onChange={handleChange('phone_number')}
                className="w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm"
                placeholder={t('fields.phoneNumberPlaceholder')}
              />
            </div>
          </div>
        </div>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <button
        type="button"
        disabled={submitting}
        onClick={handleSubmit}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {submitting ? t('buttons.saving') : t('buttons.finish')}
      </button>
    </div>
  );
}
