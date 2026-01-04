'use client';

import { Package, Play, Check } from 'lucide-react';
import { ProductStatus } from '../types';

interface StatusOption {
  status: ProductStatus;
  icon: React.ReactNode;
  labelKo: string;
  labelEn: string;
  color: string;
}

const statusOptions: Record<ProductStatus, StatusOption[]> = {
  wishlist: [
    {
      status: 'owned',
      icon: <Package className="w-5 h-5" />,
      labelKo: '보유중',
      labelEn: 'Owned',
      color: 'bg-teal-500',
    },
    {
      status: 'in_use',
      icon: <Play className="w-5 h-5" />,
      labelKo: '사용시작',
      labelEn: 'Start',
      color: 'bg-blue-500',
    },
  ],
  owned: [
    {
      status: 'in_use',
      icon: <Play className="w-5 h-5" />,
      labelKo: '사용시작',
      labelEn: 'Start',
      color: 'bg-blue-500',
    },
    {
      status: 'used',
      icon: <Check className="w-5 h-5" />,
      labelKo: '완료',
      labelEn: 'Done',
      color: 'bg-gray-500',
    },
  ],
  in_use: [
    {
      status: 'used',
      icon: <Check className="w-5 h-5" />,
      labelKo: '완료',
      labelEn: 'Done',
      color: 'bg-green-500',
    },
  ],
  used: [],
};

interface StatusChangeMenuProps {
  currentStatus: ProductStatus;
  onSelect: (newStatus: ProductStatus) => void;
  locale?: string;
}

export default function StatusChangeMenu({
  currentStatus,
  onSelect,
  locale = 'ko',
}: StatusChangeMenuProps) {
  const options = statusOptions[currentStatus] || [];

  if (options.length === 0) return null;

  return (
    <div className="flex h-full w-full">
      {options.map((option) => (
        <button
          key={option.status}
          onClick={() => onSelect(option.status)}
          className={`${option.color} text-white flex-1 flex flex-col items-center justify-center min-w-[70px] hover:opacity-90 active:opacity-80 transition-opacity`}
        >
          {option.icon}
          <span className="text-xs font-medium mt-1">
            {locale === 'ko' ? option.labelKo : option.labelEn}
          </span>
        </button>
      ))}
    </div>
  );
}
