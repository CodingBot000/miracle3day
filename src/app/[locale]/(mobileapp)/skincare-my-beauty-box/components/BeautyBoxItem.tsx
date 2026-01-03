'use client';

import Image from 'next/image';
import { Trash2, Star } from 'lucide-react';

interface BeautyBoxProduct {
  id: number;
  product_id: number;
  product_name: string;
  brand_name: string;
  price_krw: number | null;
  image_url: string | null;
  volume_text: string | null;
  avg_rating: number | null;
  review_count: number | null;
  added_at: string;
}

interface BeautyBoxItemProps {
  product: BeautyBoxProduct;
  locale: string;
  onDelete: () => void;
}

export default function BeautyBoxItem({ product, locale, onDelete }: BeautyBoxItemProps) {
  const formatPrice = (price: number | null) => {
    if (price === null) return '-';
    return `₩${price.toLocaleString()}`;
  };

  const formatRating = (rating: number | string | null) => {
    if (rating === null || rating === undefined) return '-';
    const num = typeof rating === 'string' ? parseFloat(rating) : rating;
    if (isNaN(num)) return '-';
    return num.toFixed(1);
  };

  return (
    <div className="flex gap-3 p-4 bg-white">
      {/* 이미지 */}
      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.product_name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5 truncate">{product.brand_name}</p>
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
          {product.product_name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {product.avg_rating && (
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {formatRating(product.avg_rating)}
            </span>
          )}
          {product.volume_text && <span>{product.volume_text}</span>}
        </div>
        <p className="text-sm font-semibold text-gray-900 mt-1">
          {formatPrice(product.price_krw)}
        </p>
      </div>

      {/* 삭제 버튼 */}
      <button
        onClick={onDelete}
        className="flex-shrink-0 self-center p-2 rounded-full hover:bg-red-50 transition-colors group"
        aria-label="Delete"
      >
        <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
      </button>
    </div>
  );
}
