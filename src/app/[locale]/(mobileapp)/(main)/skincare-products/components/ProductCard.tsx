'use client';

import Image from 'next/image';
import { Star, Check, Plus, Heart } from 'lucide-react';

interface Product {
  id: number;
  product_name: string;
  brand_name: string;
  price_krw: number | null;
  volume_text: string | null;
  image_url: string | null;
  avg_rating: number | null;
  review_count: number | null;
}

interface ProductCardProps {
  product: Product;
  isSaved: boolean;
  isSelected: boolean;
  onToggle: () => void;
}

export default function ProductCard({ product, isSaved, isSelected, onToggle }: ProductCardProps) {
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

  // 이미 저장된 제품은 선택 불가
  const isDisabled = isSaved;

  return (
    <div
      className={`relative bg-white rounded-xl overflow-hidden shadow-sm border-2 transition-all ${
        isSaved
          ? 'border-pink-300 bg-pink-50/30'
          : isSelected
          ? 'border-pink-500'
          : 'border-transparent hover:border-gray-200'
      }`}
    >
      {/* 이미지 */}
      <div className="relative aspect-square bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.product_name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}

        {/* 저장됨 표시 (하트) */}
        {isSaved && (
          <div className="absolute top-2 right-2 w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center shadow-md">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-3">
        <p className="text-xs text-gray-500 truncate">{product.brand_name}</p>
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 h-10 mt-0.5">
          {product.product_name}
        </h3>

        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
          {product.avg_rating && (
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {formatRating(product.avg_rating)}
            </span>
          )}
          {product.review_count !== null && product.review_count > 0 && (
            <span>({product.review_count.toLocaleString()})</span>
          )}
        </div>

        <p className="text-sm font-bold text-gray-900 mt-1.5">
          {formatPrice(product.price_krw)}
        </p>
      </div>

      {/* 선택 버튼 */}
      <button
        onClick={onToggle}
        disabled={isDisabled}
        className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${
          isDisabled
            ? 'bg-gray-200 cursor-not-allowed'
            : isSelected
            ? 'bg-pink-500 text-white'
            : 'bg-white text-gray-600 hover:bg-pink-50'
        }`}
      >
        {isSelected ? (
          <Check className="w-4 h-4" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
