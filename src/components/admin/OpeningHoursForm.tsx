'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { log } from '@/utils/logger';

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);
const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

type DayOfWeek = (typeof days)[number];

export interface OpeningHour {
  day: DayOfWeek;
  from: { hour: number; minute: number };
  to: { hour: number; minute: number };
  open: boolean;
  closed: boolean;
  ask: boolean;
}

const defaultOpenings: Record<DayOfWeek, { from: [number, number]; to: [number, number] }> = {
  MON: { from: [10, 0], to: [19, 0] },
  TUE: { from: [10, 0], to: [19, 0] },
  WED: { from: [10, 0], to: [19, 0] },
  THU: { from: [10, 0], to: [19, 0] },
  FRI: { from: [10, 0], to: [19, 0] },
  SAT: { from: [10, 0], to: [16, 0] },
  SUN: { from: [10, 0], to: [16, 0] },
};

interface OpeningHoursFormProps {
  onSelectOpeningHours?: (openingHours: OpeningHour[]) => void;
  initialHours?: OpeningHour[];
}

export default function OpeningHoursForm({ onSelectOpeningHours, initialHours } : OpeningHoursFormProps) {
  const [hoursState, setHoursState] = useState<OpeningHour[]>(
    days.map((d) => ({
      day: d,
      from: { hour: defaultOpenings[d].from[0], minute: defaultOpenings[d].from[1] },
      to: { hour: defaultOpenings[d].to[0], minute: defaultOpenings[d].to[1] },
      open: d !== 'SUN', // 일요일이 아닌 경우 영업으로 기본 설정
      closed: d === 'SUN', // 일요일만 휴무로 기본 설정
      ask: false,
    }))
  );

  // const [savedHours, setSavedHours] = useState<OpeningHour[] | null>(null); // 주석처리 - Preview 버튼으로 자동 저장

  // 컴포넌트 마운트 시 초기값 설정
  useEffect(() => {
    // 마운트 시에 initialHours가 없거나 빈 배열이면 디폴트값 설정
    if (!initialHours || initialHours.length === 0) {
      log.info('OpeningHoursForm - 마운트 시 디폴트값 설정');
      const defaultHours = days.map((d) => ({
        day: d,
        from: { hour: defaultOpenings[d].from[0], minute: defaultOpenings[d].from[1] },
        to: { hour: defaultOpenings[d].to[0], minute: defaultOpenings[d].to[1] },
        open: d !== 'SUN', // 일요일이 아닌 경우 영업으로 기본 설정
        closed: d === 'SUN', // 일요일만 휴무로 기본 설정
        ask: false,
      }));
      setHoursState(defaultHours);
    }
  }, []); // 마운트 시에만 실행

  // 초기값이 변경될 때 상태 업데이트
  useEffect(() => {
    log.info('OpeningHoursForm - initialHours 변경됨:', initialHours);
    if (initialHours && initialHours.length > 0) {
      log.info('OpeningHoursForm - 초기값으로 상태 업데이트:', initialHours);
      setHoursState(initialHours);
    } else {
      // initialHours가 없거나 빈 배열인 경우 디폴트값으로 설정
      log.info('OpeningHoursForm - 디폴트값으로 상태 설정');
      setHoursState(days.map((d) => ({
        day: d,
        from: { hour: defaultOpenings[d].from[0], minute: defaultOpenings[d].from[1] },
        to: { hour: defaultOpenings[d].to[0], minute: defaultOpenings[d].to[1] },
        open: d !== 'SUN', // 일요일이 아닌 경우 영업으로 기본 설정
        closed: d === 'SUN', // 일요일만 휴무로 기본 설정
        ask: false,
      })));
    }
  }, [initialHours]);

  function handleChange(
    idx: number,
    field: 'from' | 'to',
    part: 'hour' | 'minute',
    value: number
  ) {
    setHoursState((prev) =>
      prev.map((h, i) =>
        i === idx
          ? {
              ...h,
              [field]: {
                ...h[field],
                [part]: value,
              },
            }
          : h
      )
    );
  }

  function handleCheckbox(idx: number, key: 'open' | 'closed' | 'ask', value: boolean) {
    if (!value) return; // 체크 해제는 불가능 (항상 하나는 선택되어야 함)
    
    setHoursState((prev) =>
      prev.map((h, i) =>
        i === idx
          ? {
              ...h,
              // 선택된 것만 true, 나머지는 false
              open: key === 'open',
              closed: key === 'closed',
              ask: key === 'ask',
            }
          : h
      )
    );
  }

  function isInvalidTime(from: { hour: number; minute: number }, to: { hour: number; minute: number }) {
    if (from.hour > to.hour) return true;
    if (from.hour === to.hour && from.minute >= to.minute) return true;
    return false;
  }

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const getStatusText = (row: OpeningHour) => {
    if (row.open) return '영업';
    if (row.closed) return '휴무';
    if (row.ask) return '진료시간 문의 필요';
    return '미설정';
  };

  // Preview 버튼 클릭 시 현재 상태를 자동으로 외부에 전달하는 함수
  const getCurrentHours = () => {
    return hoursState;
  };

  // 컴포넌트가 마운트되거나 상태가 변경될 때 부모에게 현재 상태 전달
  React.useEffect(() => {
    onSelectOpeningHours?.(hoursState);
  }, [hoursState, onSelectOpeningHours]);

  // 일괄 설정 상태
  const [bulkFrom, setBulkFrom] = useState({ hour: 9, minute: 0 });
  const [bulkTo, setBulkTo] = useState({ hour: 18, minute: 0 });

  // 일괄 적용 함수
  const handleBulkApply = () => {
    setHoursState((prev) =>
      prev.map((h) => ({
        ...h,
        from: { ...bulkFrom },
        to: { ...bulkTo },
      }))
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded-xl shadow">
      <h2 className="text-lg font-bold mb-4">진료시간 입력하기</h2>

      {/* 일괄 설정 섹션 */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">일괄설정하기</h3>
        <h3 className="text-sm text-gray-500">모든숫자는 직접 입력 복사/붙여넣기 모두 가능합니다</h3>
        <h3 className="text-sm text-gray-500 mb-1">09로 하시든 9로 하시든 최종은 모두 두 자리수 기준으로 보여집니다.</h3>
        <h3 className="text-sm text-gray-500 mb-1">시간, 분 칸을 선택하신후 커서 위아래로도 숫자조정이 가능하며 텍스트 복붙도 가능합니다.</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="23"
            value={bulkFrom.hour}
            onChange={(e) => setBulkFrom({ ...bulkFrom, hour: parseInt(e.target.value) || 0 })}
            className="border rounded px-2 py-1 text-sm w-16"
          />
          :
          <input
            type="number"
            min="0"
            max="59"
            value={bulkFrom.minute}
            onChange={(e) => setBulkFrom({ ...bulkFrom, minute: parseInt(e.target.value) || 0 })}
            className="border rounded px-2 py-1 text-sm w-16"
          />
          <span className="mx-1">~</span>
          <input
            type="number"
            min="0"
            max="23"
            value={bulkTo.hour}
            onChange={(e) => setBulkTo({ ...bulkTo, hour: parseInt(e.target.value) || 0 })}
            className="border rounded px-2 py-1 text-sm w-16"
          />
          :
          <input
            type="number"
            min="0"
            max="59"
            value={bulkTo.minute}
            onChange={(e) => setBulkTo({ ...bulkTo, minute: parseInt(e.target.value) || 0 })}
            className="border rounded px-2 py-1 text-sm w-16"
          />
          <button
            onClick={handleBulkApply}
            className="ml-3 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            일괄적용하기
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {hoursState.map((row, idx) => {
          const invalid = !row.closed && !row.ask && isInvalidTime(row.from, row.to);
          return (
            <div
              key={row.day}
              className="flex flex-row flex-nowrap items-center gap-3 bg-gray-50 rounded px-2 py-2 overflow-x-auto"
            >
              {/* 요일 */}
              <div className="w-8 text-center font-medium">{row.day}</div>

              {/* 시작시간 */}
              <input
                type="number"
                min="0"
                max="23"
                className="border rounded px-1 py-0.5 text-xs w-12"
                disabled={row.closed || row.ask}
                value={row.from.hour}
                onChange={(e) =>
                  handleChange(idx, 'from', 'hour', parseInt(e.target.value, 10) || 0)
                }
              />
              :
              <input
                type="number"
                min="0"
                max="59"
                className="border rounded px-1 py-0.5 text-xs w-12"
                disabled={row.closed || row.ask}
                value={row.from.minute}
                onChange={(e) =>
                  handleChange(idx, 'from', 'minute', parseInt(e.target.value, 10) || 0)
                }
              />

              {/* ~ */}
              <span className="mx-1">~</span>

              {/* 종료시간 */}
              <input
                type="number"
                min="0"
                max="23"
                className="border rounded px-1 py-0.5 text-xs w-12"
                disabled={row.closed || row.ask}
                value={row.to.hour}
                onChange={(e) =>
                  handleChange(idx, 'to', 'hour', parseInt(e.target.value, 10) || 0)
                }
              />
              :
              <input
                type="number"
                min="0"
                max="59"
                className="border rounded px-1 py-0.5 text-xs w-12"
                disabled={row.closed || row.ask}
                value={row.to.minute}
                onChange={(e) =>
                  handleChange(idx, 'to', 'minute', parseInt(e.target.value, 10) || 0)
                }
              />

              {/* 영업 라디오 버튼 */}
              <label className="flex items-center gap-1 text-xs ml-2">
                <input
                  type="radio"
                  name={`status-${idx}`}
                  checked={row.open}
                  onChange={() => handleCheckbox(idx, 'open', true)}
                />
                영업
              </label>
              
              {/* 휴무 라디오 버튼 */}
              <label className="flex items-center gap-1 text-xs ml-2">
                <input
                  type="radio"
                  name={`status-${idx}`}
                  checked={row.closed}
                  onChange={() => handleCheckbox(idx, 'closed', true)}
                />
                휴무
              </label>
              
              {/* 진료시간 문의 라디오 버튼 */}
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="radio"
                  name={`status-${idx}`}
                  checked={row.ask}
                  onChange={() => handleCheckbox(idx, 'ask', true)}
                />
                진료시간 문의 필요
              </label>
              
              {/* 경고문 */}
              {invalid && (
                <div className="ml-12 text-red-500 text-xs font-medium">
                  종료시간은 시작시간보다 항상 커야 합니다.
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* 일정저장 버튼 - 주석처리 (Preview 버튼 클릭 시 자동 저장으로 변경) */}
      {/* 
      <span className="flex flex-row flex-nowrap items-center gap-3">
      <Button 
        type="button"
        // onClick={handleSave}
      >
        일정저장 
      </Button>
      <p> 일정저장을 눌러서 최종결과를 반드시 확인하세요. </p>
      </span>
      */}
      
      {/* <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 영업시간은 Preview 버튼을 클릭했을때 마지막 선택사항이 자동으로 저장됩니다.
        </p>
      </div> */}

      {/* 저장된 일정 상태 표시 - 주석처리 */}
      {/* 
      {savedHours && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">💾 저장된 일정</h3>
          <div className="space-y-2">
            {savedHours.map((hour, idx) => (
              <div key={hour.day} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="font-medium w-6">{hour.day}</span>
                  <span className="text-gray-600">
                    {hour.closed || hour.ask 
                      ? '시간 설정 없음' 
                      : `${formatTime(hour.from.hour, hour.from.minute)} ~ ${formatTime(hour.to.hour, hour.to.minute)}`
                    }
                  </span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  hour.open 
                    ? 'bg-green-100 text-green-800' 
                    : hour.closed 
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {getStatusText(hour)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      */}
    </div>
  );
}
