'use client';

import { useState, useEffect } from 'react';
import { useDevDateOffset } from './useDevDateOffset';

/**
 * 개발용 날짜 Offset 조작 패널
 *
 * 서버 시간에 offset을 적용하여 날짜 변경 로직 테스트 가능
 * 실제 하루가 지나길 기다리지 않고 테스트 가능
 */
export function DevDateOffsetPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [realDate, setRealDate] = useState<string>('');
  const { offset, increment, decrement, reset, getAdjustedDate } = useDevDateOffset();

  // 실제 서버 날짜 조회
  useEffect(() => {
    const fetchRealDate = async () => {
      try {
        const response = await fetch('/api/skincare/server-time');
        if (response.ok) {
          const data = await response.json();
          setRealDate(data.server_date);
        }
      } catch {
        // 에러 시 클라이언트 날짜 사용
        setRealDate(new Date().toISOString().split('T')[0]);
      }
    };
    fetchRealDate();
  }, []);

  const adjustedDate = realDate ? getAdjustedDate(realDate) : '';

  // 접힌 상태
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed right-4 top-[200px] z-[9999] w-10 h-10 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700 active:bg-gray-600 transition-colors"
        title="Dev Date Offset Panel"
      >
        <span className="text-lg">🔧</span>
        {offset > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            +{offset}
          </span>
        )}
      </button>
    );
  }

  // 펼친 상태
  return (
    <div className="fixed right-4 top-[200px] z-[9999] w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 text-white">
        <span className="font-semibold flex items-center gap-2">
          <span>📅</span>
          날짜 Offset
        </span>
        <button
          onClick={() => setIsExpanded(false)}
          className="w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded"
        >
          ✕
        </button>
      </div>

      {/* 내용 */}
      <div className="p-4 space-y-4">
        {/* 현재 offset */}
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">현재 offset</div>
          <div className={`text-2xl font-bold ${offset > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            +{offset}일
          </div>
        </div>

        {/* 날짜 정보 */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-500 mb-1">적용 날짜</div>
          <div className="text-lg font-semibold text-blue-600">{adjustedDate || '...'}</div>
          {offset > 0 && realDate && (
            <div className="text-xs text-gray-400 mt-1">(실제: {realDate})</div>
          )}
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={decrement}
            disabled={offset === 0}
            className="w-12 h-12 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xl font-bold transition-colors"
          >
            −
          </button>
          <button
            onClick={increment}
            className="w-12 h-12 bg-blue-100 hover:bg-blue-200 active:bg-blue-300 rounded-lg text-xl font-bold text-blue-600 transition-colors"
          >
            +
          </button>
          <button
            onClick={reset}
            disabled={offset === 0}
            className="px-4 h-12 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            초기화
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className="text-xs text-center text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          * 화면 새로고침 후 적용됩니다
        </div>
      </div>
    </div>
  );
}
