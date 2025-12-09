'use client';

import React from 'react';

interface ProductPreviewProps {
  data: {
    name_ko: string;
    name_en: string;
    regular_price: number;
    sale_price: number;
    price_notice_enabled: boolean;
    event_title_ko: string;
    event_title_en: string;
    event_desc_ko: string;
    event_desc_en: string;
    event_images: string[];
    event_start_immediate: boolean;
    event_no_end_date: boolean;
    event_start_date: string;
    event_end_date: string;
    options: Array<{
      option_name_ko: string;
      option_name_en: string;
      original_price: number | null;
      selling_price: number;
      description_ko: string;
      description_en: string;
      display_order: number;
    }>;
  };
  isOpen: boolean;
  onToggle: () => void;
  onRefresh: () => void;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({
  data,
  isOpen,
  onToggle,
  onRefresh
}) => {
  // 할인율 계산
  const calculateDiscountRate = (regular: number, sale: number): number | null => {
    if (!regular || !sale || regular <= sale) {
      return null;
    }
    return Math.round(((regular - sale) / regular) * 100);
  };

  const mainDiscountRate = calculateDiscountRate(data.regular_price, data.sale_price);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-3 rounded-r-lg shadow-lg hover:bg-blue-600 transition-colors z-50"
      >
        <span className="writing-mode-vertical">미리보기 열기 →</span>
      </button>
    );
  }

  return (
    <div className="w-1/2 border-r bg-gray-50 overflow-y-auto flex flex-col">
      {/* 고정 헤더 */}
      <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center shadow-sm z-10">
        <h3 className="font-bold text-lg">미리보기</h3>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 transition-colors"
          >
            🔄 새로고침
          </button>
          <button
            onClick={onToggle}
            className="bg-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-400 transition-colors"
          >
            ← 닫기
          </button>
        </div>
      </div>

      {/* 미리보기 컨텐츠 */}
      <div className="p-8 flex-1">
        {/* 상품명 */}
        <h1 className="text-2xl font-bold mb-2">
          {data.name_ko || '상품명을 입력하세요'}
        </h1>
        {data.name_en && (
          <h2 className="text-lg text-gray-600 mb-4">{data.name_en}</h2>
        )}

        {/* 가격 */}
        <div className="mb-6">
          {mainDiscountRate && (
            <span className="text-red-500 font-bold text-xl mr-2">
              {mainDiscountRate}%
            </span>
          )}
          {data.regular_price > data.sale_price && (
            <span className="line-through text-gray-400 mr-2">
              ₩{data.regular_price.toLocaleString()}
            </span>
          )}
          <span className="text-3xl font-bold">
            ₩{data.sale_price.toLocaleString()}
          </span>
        </div>

        {/* 가격 변동 안내 */}
        {data.price_notice_enabled && (
          <p className="text-sm text-orange-600 mb-4 p-3 bg-orange-50 rounded">
            ⚠️ 시술 상황에 따라 가격이 소폭 변경될 수 있습니다.
            자세한사항은 상담후 확인하시기 바랍니다.
          </p>
        )}

        {/* 옵션 */}
        {data.options.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-3 text-lg">이벤트 옵션</h3>
            {data.options.map((opt, idx) => {
              const optDiscountRate = calculateDiscountRate(
                opt.original_price || 0,
                opt.selling_price
              );

              return (
                <div key={idx} className="border p-4 mb-3 rounded bg-white shadow-sm">
                  <div className="font-semibold text-base">{opt.option_name_ko}</div>
                  {opt.option_name_en && (
                    <div className="text-sm text-gray-500">{opt.option_name_en}</div>
                  )}
                  <div className="mt-2">
                    {optDiscountRate && (
                      <span className="text-red-500 font-bold mr-2">
                        {optDiscountRate}%
                      </span>
                    )}
                    {opt.original_price && opt.original_price > opt.selling_price && (
                      <span className="line-through text-gray-400 mr-2">
                        ₩{opt.original_price.toLocaleString()}
                      </span>
                    )}
                    <span className="font-bold">
                      ₩{opt.selling_price.toLocaleString()}
                    </span>
                  </div>
                  {opt.description_ko && (
                    <p className="text-sm text-gray-600 mt-2">{opt.description_ko}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 이벤트 설명 */}
        {(data.event_title_ko || data.event_desc_ko) && (
          <div className="mb-6 p-4 bg-white rounded shadow-sm">
            {data.event_title_ko && (
              <h3 className="font-bold text-lg mb-2">{data.event_title_ko}</h3>
            )}
            {data.event_desc_ko && (
              <p className="whitespace-pre-wrap text-gray-700">{data.event_desc_ko}</p>
            )}
          </div>
        )}

        {/* 이벤트 이미지 */}
        {data.event_images.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-3 text-lg">이벤트 이미지</h3>
            {data.event_images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`이벤트 이미지 ${idx + 1}`}
                className="w-full rounded shadow"
              />
            ))}
          </div>
        )}

        {/* 이벤트 기간 */}
        {(!data.event_start_immediate || !data.event_no_end_date) && (
          <div className="text-sm text-gray-500 p-3 bg-gray-100 rounded">
            <strong>이벤트 기간:</strong>{' '}
            {data.event_start_immediate ? '지금부터' : data.event_start_date}
            {' ~ '}
            {data.event_no_end_date ? '종료일 없음' : data.event_end_date}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPreview;
