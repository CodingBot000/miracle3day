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
import { mobileStorage, STORAGE_KEYS } from '@/lib/storage';

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

  // Remote DB의 Skincare 데이터만 삭제 (계정 유지)
  const handleResetRemoteData = async () => {
    if (!session) return;
    if (!confirm('정말 Remote DB의 Skincare 데이터를 초기화하시겠습니까?\n(계정은 유지됩니다)')) return;

    setActionLoading('reset-remote');
    setError(null);

    try {
      const res = await fetch('/api/dev/reset-skincare', {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Remote DB 초기화 완료: ${data.deleted?.total || 0}건 삭제`);
      } else {
        setError(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading(null);
    }
  };

  // Local Storage 초기화
  const handleResetLocalStorage = () => {
    if (!confirm('정말 Local Storage를 초기화하시겠습니까?\n(온보딩, 루틴, 진행상태 등 모든 로컬 데이터 삭제)')) return;

    setActionLoading('reset-local');
    setError(null);

    try {
      // 삭제 전 키 개수 확인
      const progressKeys = mobileStorage.getKeysByPattern(/^routine_progress_/);
      let deletedCount = 0;

      // 정의된 키들 삭제
      if (mobileStorage.has(STORAGE_KEYS.SKINCARE_ONBOARDING_ANSWERS)) {
        mobileStorage.remove(STORAGE_KEYS.SKINCARE_ONBOARDING_ANSWERS);
        deletedCount++;
      }
      if (mobileStorage.has(STORAGE_KEYS.SKINCARE_ROUTINE_DATA)) {
        mobileStorage.remove(STORAGE_KEYS.SKINCARE_ROUTINE_DATA);
        deletedCount++;
      }
      if (mobileStorage.has(STORAGE_KEYS.SKINCARE_USER_PROFILE)) {
        mobileStorage.remove(STORAGE_KEYS.SKINCARE_USER_PROFILE);
        deletedCount++;
      }
      if (mobileStorage.has(STORAGE_KEYS.ROUTINE_LAST_SAVED)) {
        mobileStorage.remove(STORAGE_KEYS.ROUTINE_LAST_SAVED);
        deletedCount++;
      }

      // routine_progress_* 패턴 키들 삭제
      mobileStorage.removeByPattern(/^routine_progress_/);
      deletedCount += progressKeys.length;

      showToast(`Local Storage 초기화 완료: ${deletedCount}건 삭제`);
    } catch (err) {
      const errorDetail = {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        type: 'LocalStorage Error'
      };
      setError(JSON.stringify(errorDetail, null, 2));
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
            <div className="space-y-2">
              {/* 데이터 초기화 버튼들 */}
              <div className="flex gap-2">
                <button
                  onClick={handleResetRemoteData}
                  disabled={!!actionLoading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-2 px-2 rounded text-xs"
                >
                  {actionLoading === 'reset-remote' ? '처리중...' : '🌐 Remote DB'}
                </button>
                <button
                  onClick={handleResetLocalStorage}
                  disabled={!!actionLoading}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-bold py-2 px-2 rounded text-xs"
                >
                  {actionLoading === 'reset-local' ? '처리중...' : '💾 Local Storage'}
                </button>
              </div>
              {/* 계정 삭제 버튼 */}
              <button
                onClick={handleDeleteAccount}
                disabled={!!actionLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-3 rounded text-xs"
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
