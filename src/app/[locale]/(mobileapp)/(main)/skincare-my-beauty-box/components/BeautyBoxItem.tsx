'use client';

import Image from 'next/image';
import { Calendar, RotateCcw } from 'lucide-react';
import { BeautyBoxProduct, ProductStatus } from '../types';
import {
  getDaysRemaining,
  getDaysSinceOpened,
  getUsageDuration,
  getExpiryBadgeStyle,
  formatDate,
} from '../utils/beautybox-helpers';
import SwipeableCard from './SwipeableCard';

interface BeautyBoxItemProps {
  product: BeautyBoxProduct;
  locale: string;
  onDelete: () => void;
  onStatusChange: (newStatus: ProductStatus) => void;
  onDateEdit?: () => void;
  onAddAgain?: () => void;
}

export default function BeautyBoxItem({
  product,
  locale,
  onDelete,
  onStatusChange,
  onDateEdit,
  onAddAgain,
}: BeautyBoxItemProps) {
  const t = locale === 'ko' ? textKo : textEn;

  const daysRemaining = getDaysRemaining(product);
  const daysSinceOpened = getDaysSinceOpened(product.opened_at);
  const usageDuration = getUsageDuration(product.opened_at, product.finished_at);
  const hasUseByDate = !!product.use_by_date;

  // 배지 스타일 (in_use, owned 상태에서만)
  const badge =
    product.status === 'in_use' || product.status === 'owned'
      ? getExpiryBadgeStyle(daysRemaining, hasUseByDate, locale)
      : null;

  // 날짜 편집 버튼 표시 여부
  // in_use, owned 상태에서는 항상 날짜 편집 가능
  const showDateEditButton =
    product.status === 'in_use' || product.status === 'owned';

  return (
    <SwipeableCard
      status={product.status}
      onDelete={onDelete}
      onStatusChange={onStatusChange}
      locale={locale}
    >
      <div className="flex gap-3 px-3 py-2.5">
        {/* 이미지 (더 작게) */}
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.product_name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
              No Img
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          {/* 브랜드 */}
          <p className="text-[11px] text-gray-500 truncate">{product.brand_name}</p>

          {/* 제품명 + 용량 */}
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-[13px] font-medium text-gray-900 truncate leading-tight">
              {product.product_name}
            </h3>
            {product.volume_text && (
              <span className="text-[11px] text-gray-400 flex-shrink-0">
                {product.volume_text}
              </span>
            )}
          </div>

          {/* 상태별 부가 정보 */}
          <div className="flex items-center gap-2 mt-0.5">
            {/* in_use: 개봉 경과일 */}
            {product.status === 'in_use' && daysSinceOpened !== null && (
              <span className="text-[11px] text-gray-500">
                {t.openedDays.replace('{days}', String(daysSinceOpened))}
              </span>
            )}

            {/* owned: 유통기한 */}
            {product.status === 'owned' && product.expiry_date && (
              <span className="text-[11px] text-gray-500">
                {t.expiryOn.replace('{date}', formatDate(product.expiry_date, locale))}
              </span>
            )}

            {/* wishlist: 추가일 */}
            {product.status === 'wishlist' && (
              <span className="text-[11px] text-gray-500">
                {t.addedOn.replace('{date}', formatDate(product.added_at, locale))}
              </span>
            )}

            {/* used: 완료일 + 사용기간 */}
            {product.status === 'used' && (
              <>
                <span className="text-[11px] text-gray-500">
                  {t.finishedOn.replace('{date}', formatDate(product.finished_at, locale))}
                </span>
                {usageDuration !== null && (
                  <span className="text-[11px] text-gray-400">
                    {t.usedDays.replace('{days}', String(usageDuration))}
                  </span>
                )}
              </>
            )}

            {/* 2차 유통기한 사용시 라벨 */}
            {hasUseByDate && product.status === 'in_use' && (
              <span className="text-[10px] text-gray-400">{t.userSetExpiry}</span>
            )}
          </div>
        </div>

        {/* 우측: 배지 + 날짜 편집 버튼 */}
        <div className="flex-shrink-0 flex flex-col items-end justify-center gap-1">
          {/* D-day 배지 (클릭하면 날짜 편집) */}
          {badge && onDateEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDateEdit();
              }}
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.bgColor} ${badge.color} hover:opacity-80 transition-opacity`}
            >
              {badge.text}
            </button>
          )}

          {/* 날짜 편집 버튼 (배지가 없을 때만) */}
          {showDateEditButton && !badge && onDateEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDateEdit();
              }}
              className="flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors"
            >
              <Calendar className="w-3 h-3" />
              <span>{t.inputDate}</span>
            </button>
          )}

          {/* used 상태: 다시 담기 버튼 */}
          {product.status === 'used' && onAddAgain && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddAgain();
              }}
              className="flex items-center gap-1 text-[11px] text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full hover:bg-pink-100 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.addAgain}</span>
            </button>
          )}
        </div>
      </div>
    </SwipeableCard>
  );
}

const textKo = {
  openedDays: '개봉 {days}일째',
  expiryOn: '유통 {date}',
  addedOn: '추가 {date}',
  finishedOn: '완료 {date}',
  usedDays: '({days}일 사용)',
  userSetExpiry: '(사용자설정)',
  inputDate: '날짜 입력',
  addAgain: '다시 담기',
};

const textEn = {
  openedDays: 'Opened {days}d ago',
  expiryOn: 'Exp {date}',
  addedOn: 'Added {date}',
  finishedOn: 'Done {date}',
  usedDays: '({days}d used)',
  userSetExpiry: '(custom)',
  inputDate: 'Add date',
  addAgain: 'Add again',
};
