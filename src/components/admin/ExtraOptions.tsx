'use client';

import { HAS_ANESTHESIOLOGIST, HAS_CCTV, HAS_FEMALE_DOCTOR, HAS_NIGHT_COUNSELING, HAS_PARKING, HAS_PRIVATE_RECOVERY_ROOM } from '@/constants/extraoptions';
import React, { useState, useEffect } from 'react';
import { log } from '@/utils/logger';
interface ExtraOption {
  key: string;
  label: string;
}

const extraOptions: ExtraOption[] = [
  { key: HAS_PRIVATE_RECOVERY_ROOM, label: '전담회복실' },
  { key: HAS_PARKING, label: '주차가능' },
  { key: HAS_CCTV, label: 'CCTV설치' },
  { key: HAS_NIGHT_COUNSELING, label: '야간상담' },
  { key: HAS_FEMALE_DOCTOR, label: '여의사진료' },
  { key: HAS_ANESTHESIOLOGIST, label: '마취전문의' },
];

export interface ExtraOptionState {
  has_private_recovery_room: boolean;
  has_parking: boolean;
  has_cctv: boolean;
  has_night_counseling: boolean;
  has_female_doctor: boolean;
  has_anesthesiologist: boolean;
  specialist_count: number;
}

interface ExtraOptionStateProps {
  onSelectOptionState?: (address: ExtraOptionState) => void;
  initialOptions?: ExtraOptionState;
}

export default function ExtraOptions({
  onSelectOptionState,
  initialOptions,
}: ExtraOptionStateProps) {
  const [options, setOptions] = useState<ExtraOptionState>(
    initialOptions || {
      has_private_recovery_room: false,
      has_parking: false,
      has_cctv: false,
      has_night_counseling: false,
      has_female_doctor: false,
      has_anesthesiologist: false,
      specialist_count: 1,
    },
  );

  // 렌더링 시점 디버깅
  log.info('ExtraOptions 렌더링:', {
    받은initialOptions: initialOptions,
    현재options: options,
  });

  // props 변경 시 상태 업데이트
  useEffect(() => {
    if (
      initialOptions &&
      JSON.stringify(initialOptions) !==
        JSON.stringify(options)
    ) {
      setOptions(initialOptions);
      log.info('ExtraOptions 초기값 설정 완료');
    }
  }, [initialOptions]);

  // options가 변경될 때마다 상위 컴포넌트에 알림
  useEffect(() => {
    log.info(' ExtraOptions - 상태 변경:', options);
    onSelectOptionState?.(options);
  }, [options, onSelectOptionState]);

  // 체크박스 변경 핸들러
  const handleCheck =
    (key: keyof ExtraOptionState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.checked;
      log.info(
        ` ExtraOptions - ${key} 체크박스 변경:`,
        newValue,
      );

      setOptions((prev) => ({
        ...prev,
        [key]: newValue,
      }));
    };

  // 숫자 입력 핸들러
  const handleCountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = Math.max(
      1,
      parseInt(
        e.target.value.replace(/\D/g, '') || '1',
        10,
      ),
    );
    log.info(' ExtraOptions - 전문의 수 변경:', val);

    setOptions((prev) => ({
      ...prev,
      specialist_count: val,
    }));
  };

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto p-4 bg-white rounded-xl shadow">
      {/* 제목 */}
      <h2 className="text-lg font-bold">부가 정보 입력하기</h2>
  
      {/* 기존 내용 (가로 배치) */}
      <div className="flex flex-row items-end gap-6">
        {/* 전문의 O명 */}
        <div className="flex flex-row items-end gap-1">
          <span className="text-sm font-medium">의사</span>
          <input
            type="number"
            className="w-12 border-b border-gray-300 focus:outline-none focus:border-blue-500 px-1 text-center text-sm appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min={1}
            value={options.specialist_count}
            onChange={handleCountChange}
          />
          <span className="text-sm font-medium">명</span>
        </div>
  
        {/* 체크박스 옵션들 */}
        {extraOptions.map((opt) => (
          <label
            key={opt.key}
            className="flex flex-col items-center gap-1 min-w-[68px]"
          >
            <input
              type="checkbox"
              checked={
                options[opt.key as keyof ExtraOptionState] as boolean
              }
              onChange={handleCheck(opt.key as keyof ExtraOptionState)}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="text-xs text-gray-700">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
  
}
