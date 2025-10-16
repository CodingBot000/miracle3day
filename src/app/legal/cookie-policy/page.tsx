'use client';

import Link from 'next/link';
import Cookies from 'js-cookie';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const CONSENT_COOKIE = 'cookie_consent';
type ConsentValue = 'accepted' | 'rejected';

function removeCookie(name: string) {
  const host = window.location.hostname.replace(/^www\./, '');
  const domainsToTry = [window.location.hostname, `.${host}`];
  const pathsToTry = ['/', ''];
  domainsToTry.forEach((d) =>
    pathsToTry.forEach((p) => {
      Cookies.remove(name, { path: p });
      Cookies.remove(name, { path: p, domain: d });
    }),
  );
}

function removeAnalyticsCookies() {
  const all = document.cookie.split(';').map((s) => s.trim().split('=')[0]);
  const names = Array.from(
    new Set(all.filter((n) => /^_ga|^_gid|^_gat|^_gac|^_gcl/.test(n)))
  );
  names.forEach((n) => removeCookie(n));
}

function updateGtagConsent(allowed: boolean) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      analytics_storage: allowed ? 'granted' : 'denied',
      ad_storage: allowed ? 'granted' : 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
    });
  }
}

export default function CookiePolicyPage() {
  const [consent, setConsent] = useState<ConsentValue | null>(null);
  const { language } = useLanguage();
  const locale = language === 'ko' ? 'ko' : 'en';

  useEffect(() => {
    const v = Cookies.get(CONSENT_COOKIE) as ConsentValue | undefined;
    setConsent(v ?? null);
  }, []);

  const t = {
    ko: {
      title: '쿠키 정책 (Cookie Policy)',
      updated: '최종 업데이트: 2025-10-16',
      s1_title: '1) 쿠키란?',
      s1_body:
        '쿠키는 웹사이트가 사용자의 브라우저에 저장하는 작은 텍스트 파일로, 로그인 상태 유지, 환경설정 복원, 서비스 개선을 위한 통계 분석 등에 사용됩니다. 일부 쿠키는 서비스 제공에 필수이며, 분석/마케팅 등 선택 쿠키는 사용자의 사전 동의가 필요합니다.',
      s2_title: '2) 우리가 사용하는 쿠키 종류',
      table_headers: ['구분', '예시 값', '목적', '보관 기간', '법적 근거'],
      rows: [
        ['세션 관리 (필수)', 'session_id=abc123', '로그인/세션 유지, 보안', '세션 종료 시', '정당한 이익 / 서비스 제공 필요'],
        ['인증 정보 (필수)', 'token=eyJhbGciOi... (HttpOnly)', '로그인 유지, API 접근', '서비스 정책에 따름', '계약 이행 / 보안 필요'],
        ['사용자 설정 (선택)', 'lang=en, theme=dark', '언어/테마 등 환경설정 복원', '최대 1년(권장)', '동의'],
        ['트래킹/분석 (선택)', '_ga=...', '이용행태 분석·개선', '공급자 정책에 따름', '동의'],
      ],
      s3_title: '3) 제3자(Third-party) 쿠키',
      s3_body:
        '분석/마케팅 도구 사용 시 제3자 쿠키가 설정될 수 있습니다. 선택 쿠키는 동의 이후에만 로드되며, 동의 철회 시 가능 범위 내에서 즉시 삭제하고 재로딩을 중단합니다.',
      s4_title: '4) 쿠키 관리',
      s4_list: [
        '[모두 허용] : 필수 + 선택(분석/마케팅/환경설정) 허용',
        '[필수만 허용] : 선택 쿠키 차단 및 가능한 경우 삭제',
        '[동의 철회] : 기존 동의를 철회하고 선택 쿠키 차단/삭제',
        '브라우저에서 사이트 데이터 삭제도 가능합니다.',
      ],
      s5_title: '5) 문의',
      s5_body_prefix: '쿠키 및 개인정보 처리에 대한 문의는 이메일 ',
      s5_body_suffix: ' 로 연락해 주세요.',
      state_label: '현재 동의 상태:',
      state_accepted: '모두 허용',
      state_rejected: '필수만 허용',
      state_none: '아직 선택하지 않음',
      btn_accept: '모두 허용',
      btn_essential: '필수만 허용',
      btn_withdraw: '동의 철회',
      note_http_only:
        '* 인증용 HttpOnly 쿠키(예: JWT)는 보안을 위해 브라우저 스크립트로 변경/삭제할 수 없습니다. 로그아웃 또는 서버 요청을 통해 삭제됩니다.',
    },
    en: {
      title: 'Cookie Policy',
      updated: 'Last updated: 2025-10-16',
      s1_title: '1) What are cookies?',
      s1_body:
        'Cookies are small text files stored in your browser to keep you logged in, remember preferences, and help us analyze and improve our services. Some cookies are essential for the site to function, while optional cookies (e.g., analytics/marketing) require your prior consent.',
      s2_title: '2) Types of cookies we use',
      table_headers: ['Category', 'Example', 'Purpose', 'Retention', 'Legal Basis'],
      rows: [
        ['Session (Essential)', 'session_id=abc123', 'Login/session, security', 'Until session ends', 'Legitimate interest / necessary for service'],
        ['Authentication (Essential)', 'token=eyJhbGciOi... (HttpOnly)', 'Keep you signed in, API access', 'Per service policy', 'Contract performance / security'],
        ['Preferences (Optional)', 'lang=en, theme=dark', 'Restore language/theme settings', 'Up to 1 year (recommended)', 'Consent'],
        ['Tracking/Analytics (Optional)', '_ga=...', 'Usage analysis & improvements', 'Per provider policy', 'Consent'],
      ],
      s3_title: '3) Third-party cookies',
      s3_body:
        'Third-party cookies may be set by analytics/marketing tools. Optional cookies load only after consent; withdrawing consent stops loading and removes them when possible.',
      s4_title: '4) Managing cookies',
      s4_list: [
        '[Accept all]: Allow essential + optional (analytics/marketing/preferences)',
        '[Essential only]: Block optional cookies and remove them when possible',
        '[Withdraw consent]: Revoke previous consent and block/remove optional cookies',
        'You can also clear site data in your browser settings.',
      ],
      s5_title: '5) Contact',
      s5_body_prefix: 'For inquiries, email ',
      s5_body_suffix: '.',
      state_label: 'Current consent:',
      state_accepted: 'Accepted (all)',
      state_rejected: 'Essential only',
      state_none: 'Not set yet',
      btn_accept: 'Accept all',
      btn_essential: 'Essential only',
      btn_withdraw: 'Withdraw consent',
      note_http_only:
        '* HttpOnly auth cookies (e.g., JWT) cannot be modified/removed via scripts for security. Use logout or a server request.',
    },
  } as const;

  const consentLabel = useMemo(() => {
    if (consent === 'accepted') return t[locale].state_accepted;
    if (consent === 'rejected') return t[locale].state_rejected;
    return t[locale].state_none;
  }, [consent, locale]);

  const handleAcceptAll = () => {
    Cookies.set(CONSENT_COOKIE, 'accepted', { expires: 365, path: '/' });
    updateGtagConsent(true);
    setConsent('accepted');
  };

  const handleEssentialOnly = () => {
    Cookies.set(CONSENT_COOKIE, 'rejected', { expires: 365, path: '/' });
    removeAnalyticsCookies();
    updateGtagConsent(false);
    setConsent('rejected');
  };

  const handleWithdraw = () => {
    handleEssentialOnly();
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">{t[locale].title}</h1>
      <p className="text-sm text-gray-500 mb-8">{t[locale].updated}</p>

      {/* Section 1 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{t[locale].s1_title}</h2>
        <p className="text-gray-700">{t[locale].s1_body}</p>
      </section>

      {/* Section 2 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{t[locale].s2_title}</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full border-collapse text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-900">
              <tr className="divide-x divide-gray-200">
                {t[locale].table_headers.map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {t[locale].rows.map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  {r.map((cell, i) => (
                    <td key={i} className="px-4 py-3 align-top">
                      {i === 1 ? <code className="text-gray-800">{cell}</code> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{t[locale].s3_title}</h2>
        <p>{t[locale].s3_body}</p>
      </section>

      {/* Section 4 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{t[locale].s4_title}</h2>
        <ul className="list-disc ml-5 text-gray-700 space-y-1">
          {t[locale].s4_list.map((li) => (
            <li key={li}>{li}</li>
          ))}
        </ul>
      </section>

      {/* Section 5 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{t[locale].s5_title}</h2>
        <p>
          {t[locale].s5_body_prefix}
          <Link href="mailto:mimotok.official@gmail.com" className="text-blue-600 underline">
            mimotok.official@gmail.com
          </Link>
          {t[locale].s5_body_suffix}
        </p>
      </section>

      <hr className="my-10" />

      {/* Consent Control */}
      <section aria-label="cookie-consent-controls" className="space-y-3">
        <div className="text-sm text-gray-600">
          {t[locale].state_label}{' '}
          <span className="font-medium text-gray-800">{consentLabel}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            aria-label={t[locale].btn_accept}
          >
            {t[locale].btn_accept}
          </button>
          <button
            onClick={handleEssentialOnly}
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
            aria-label={t[locale].btn_essential}
          >
            {t[locale].btn_essential}
          </button>
          <button
            onClick={handleWithdraw}
            className="px-4 py-2 rounded-md bg-white border text-gray-800 hover:bg-gray-50"
            aria-label={t[locale].btn_withdraw}
          >
            {t[locale].btn_withdraw}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">{t[locale].note_http_only}</p>
      </section>
    </main>
  );
}
