/**
 * [DEV] 디버그 패널 - 개발/테스트 전용
 *
 * 역할:
 * - 로그인 상태 표시
 * - Skincare 데이터 초기화 (계정 유지)
 * - 계정 완전 삭제 (회원탈퇴)
 *
 * ⚠️ 프로덕션 배포 전 제거 또는 비활성화 필요
 */

'use client';

import React, { useState, useEffect } from 'react';

interface UserSession {
  id: string;
  email: string;
}

// 환경변수로 디버그 패널 활성화 여부 제어 (기본: 개발환경에서만)
const DEV_DEBUG_ENABLED = process.env.NODE_ENV === 'development';

export default function DevDebugPanel() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 토스트 표시 (3초 후 자동 사라짐)
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // 디버그 모드가 아니면 렌더링하지 않음
  // if (!DEV_DEBUG_ENABLED) return null;

  // 세션 확인
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' });
      const data = await res.json();
      if (data.auth) {
        setSession({ id: data.auth.id, email: data.auth.email });
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error('[DevDebug] Session check failed:', error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Skincare 데이터만 삭제 (계정 유지)
  const handleResetSkincareData = async () => {
    if (!session) return;
    if (!confirm('정말 Skincare 데이터를 초기화하시겠습니까?\n(계정은 유지됩니다)')) return;

    setActionLoading('reset');
    setError(null);

    try {
      const res = await fetch('/api/dev/reset-skincare', {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Skincare 초기화 완료: ${data.deleted?.total || 0}건 삭제`);
      } else {
        setError(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading(null);
    }
  };

  // 계정 완전 삭제 (회원탈퇴)
  const handleDeleteAccount = async () => {
    if (!session) return;
    if (!confirm('정말 계정을 삭제하시겠습니까?\n모든 데이터가 영구적으로 삭제됩니다.')) return;
    if (!confirm('⚠️ 마지막 확인: 이 작업은 되돌릴 수 없습니다!')) return;

    setActionLoading('delete');
    setError(null);

    try {
      const res = await fetch('/api/dev/delete-account', {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('계정 삭제 완료. 리다이렉트...');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setError(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      {/* 성공 토스트 */}
      {toast && (
        <div className="fixed top-4 left-4 right-4 z-[10000] bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-center animate-pulse">
          {toast}
        </div>
      )}

      <div className="fixed bottom-[150px] left-4 right-4 z-[9999] bg-yellow-100 border-2 border-yellow-500 rounded-lg p-3 shadow-lg text-xs">
        {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-yellow-800">🛠️ DEV DEBUG</span>
        <span className="text-yellow-600">개발 전용</span>
      </div>

      {/* 로딩 상태 */}
      {isLoading ? (
        <div className="text-gray-600">세션 확인 중...</div>
      ) : (
        <>
          {/* 세션 상태 */}
          <div className="mb-3 p-2 bg-white rounded border">
            {session ? (
              <div className="text-green-700">
                <span className="font-semibold">✅ 로그인:</span> {session.email}
              </div>
            ) : (
              <div className="text-red-600">
                <span className="font-semibold">❌ 미로그인</span>
              </div>
            )}
          </div>

          {/* 액션 버튼들 */}
          {session && (
            <div className="flex gap-2">
              <button
                onClick={handleResetSkincareData}
                disabled={!!actionLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-2 px-3 rounded text-xs"
              >
                {actionLoading === 'reset' ? '처리중...' : '🔄 Skincare 초기화'}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!!actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-3 rounded text-xs"
              >
                {actionLoading === 'delete' ? '처리중...' : '🗑️ 계정 삭제'}
              </button>
            </div>
          )}

          {/* 에러 메시지 (복붙 가능) */}
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="text-red-700 font-semibold">Error:</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  ✕
                </button>
              </div>
              <pre className="text-red-600 text-[10px] whitespace-pre-wrap break-all select-all bg-white p-1 rounded border">
                {error}
              </pre>
            </div>
          )}
        </>
      )}
      </div>
    </>
  );
}
