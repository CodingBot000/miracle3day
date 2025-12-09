'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CreateAccountPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [emailLocalPart, setEmailLocalPart] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    console.log('[CreateAccountPage] Auth 상태:', { user, isLoading });

    if (!isLoading && !user) {
      console.log('[CreateAccountPage] 로그인 안됨 → 로그인 페이지로 이동');
      router.push('/admin/login');
      return;
    }

    if (!isLoading && user && user.email !== process.env.SUPER_ADMIN_EMAIL) {
      console.log('[CreateAccountPage] 슈퍼관리자 아님:', user.email);
      setMessage('권한이 없습니다.');
      setMessageType('error');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailLocalPart.trim() || !password.trim()) {
      setMessage('이메일과 비밀번호를 모두 입력해주세요.');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setMessageType('');

    try {
      console.log('[CreateAccountPage] 계정 생성 요청:', { emailLocalPart });

      const res = await fetch('/api/admin/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailLocalPart,
          password,
        }),
      });

      console.log('[CreateAccountPage] 응답 상태:', res.status);

      if (res.status === 401) {
        setMessage('로그인 만료. 다시 로그인해주세요.');
        setMessageType('error');
        setTimeout(() => router.push('/admin/login'), 2000);
        return;
      }

      if (res.status === 403) {
        setMessage('권한이 없습니다.');
        setMessageType('error');
        return;
      }

      if (res.status === 409) {
        setMessage('이미 존재하는 계정입니다.');
        setMessageType('error');
        return;
      }

      const json = await res.json();
      console.log('[CreateAccountPage] 응답 데이터:', json);

      if (json.ok) {
        setMessage(`계정 생성 완료: ${json.row.email}`);
        setMessageType('success');
        // 폼 초기화
        setEmailLocalPart('');
        setPassword('');
      } else {
        setMessage('생성 실패');
        setMessageType('error');
      }
    } catch (error) {
      console.error('[CreateAccountPage] 오류:', error);
      setMessage('서버 오류가 발생했습니다.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한 없음</h1>
          <p className="text-gray-700 mb-6">이 페이지는 슈퍼관리자만 접근할 수 있습니다.</p>
          <button
            onClick={handleBack}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">병원 계정 신규 발급</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="email"
                value={emailLocalPart}
                onChange={(e) => setEmailLocalPart(e.target.value)}
                placeholder="clinic01"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              <span className="text-gray-600 font-medium">@beautylink.com</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              로컬파트만 입력하세요 (예: clinic01)
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                messageType === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '처리 중...' : '계정 발급'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
