"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, HeartIcon, Star, StarIcon } from "lucide-react";
import { daysYMDFormat } from "@/utils/days";
import formatCount from "@/utils/number-formating/index";
import { DiscountPriceDisplay } from "@/components/common/DiscountPriceDisplay";

export interface ProductCardProps {
  src: string;
  location?: string;
  productName: string;
  dateFrom: string;
  dateTo: string;
  price: number[];
  desc: string;
  alt: string;
  rating: number;
  reviewCount: number;
  scrapCount: number;
  badges: string[];
  href: string;
}

export function ProductCard({
  src,
  location,
  productName,
  dateFrom,
  dateTo,
  price,
  desc,
  alt,
  rating,
  reviewCount,
  scrapCount,
  badges,
  href,
}: ProductCardProps) {
  const [scrapped, setScrapped] = useState(false);

  const handleToggleScrap = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 링크 이동 방지
    setScrapped((prev) => !prev);
    // TODO: 여기에 백엔드 연동 로직 삽입
    // 예: await toggleScrapAPI(productId);
  };

  return (
    <Link href={href} className="block relative bg-white rounded-lg overflow-hidden shadow-sm mb-4">
      <div className="relative aspect-square">
        <Image
          src={src}
          alt={productName}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />
        <button
          onClick={handleToggleScrap}
          className="absolute top-2 right-2 z-10 p-1 bg-white/80 rounded-full"
        >
          {scrapped ? (
            <Heart className="text-red-500 fill-red-500 w-6 h-6" />
          ) : (
            <HeartIcon className="text-gray-400 w-6 h-6" />
          )}
        </button>
      </div>

      <div className="p-3">
        <div className="flex flex-col">
          {/* <div className="flex flex-col mb-1">
            <div className="flex items-center"></div> */}
            <h3 className="text-sm font-medium mt-1">{productName}</h3>
          {/* </div> */}

          {/* <div className="flex justify-between items-center">
            <span className="text-base font-bold">{price}</span>
          </div> */}

          <div className="flex justify-end text-[0.625rem] text-gray-500 mb-1 mr-5">
            <time>
              {daysYMDFormat(dateFrom)}
            </time>
          </div>
          <div className="flex justify-end text-[0.625rem] text-gray-500 mb-1">
            <time>
               ~ {daysYMDFormat(dateTo)}
            </time>
          </div>
          {/* 원가 가운데 취소선 + 할인율 퍼센티지  */}
          <DiscountPriceDisplay price={price} /> 

          <div className="flex items-center mt-1 text-xs">
            <Star className="text-green-500 fill-green-500 w-3 h-3 mr-1" />
            <span className="mr-1">{rating}</span>
            <span className="text-gray-500 mr-2">{formatCount(reviewCount)}</span>
            <Heart className="text-red-500 fill-red-500 w-3 h-3  mr-1" />
            <span className="text-gray-500">{formatCount(scrapCount)}</span>
          </div>

          <div className="flex gap-1 mt-2">
            {badges.map((badge, index) => (
              <span key={index} className={`badge-${badge.toLowerCase()}`}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
