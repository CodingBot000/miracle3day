"use client";

import Link from "next/link";
import Image from "next/image";
import { daysYMDFormat } from "@/utils/days";
import formatCount from "@/utils/number-formating/index";
import { PriceDisplay } from "@/components/common/PriceDisplay";

export interface ProductCardProps {
//   id: string;
  src: string;
//   clinicName: string;
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
//   id,
  src,
//   clinicName,
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
        <button className="absolute top-2 right-2 z-10">
          <Image
            src="https://ext.same-assets.com/1284539012/2575877458.svg"
            alt="scrap"
            width={24}
            height={24}
          />
        </button>
      </div>
      <div className="p-3">
        <div className="flex flex-col">
          <div className="flex flex-col mb-1">
            <div className="flex items-center">
              {/* <span className="text-sm font-medium text-gray-800">{clinicName}</span>
              {location && (
                <>
                  <span className="mx-1">
                    <img
                      src="https://ext.same-assets.com/1284539012/3621063382.svg"
                      alt="dot"
                      className="w-1 h-1"
                    />
                  </span>
                  <span className="text-xs text-gray-500">{location}</span>
                </>
              )} */}
            </div>
            <h3 className="text-sm font-medium mt-1">{productName}</h3>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base font-bold">{price}</span>
          </div>

          <div className="flex justify-end text-xs text-gray-500 mb-1">
            <time>
              {daysYMDFormat(dateFrom)} ~ {daysYMDFormat(dateTo)}
            </time>
          </div>

          <PriceDisplay price={price} />

          <div className="flex items-center mt-1 text-xs">
            <Image
              src="https://ext.same-assets.com/1284539012/882512749.svg"
              alt="star"
              width={12}
              height={12}
              className="mr-1"
            />
            <span className="mr-1">{rating}</span>
            <span className="text-gray-500 mr-2">{formatCount(reviewCount)}</span>
            <Image
              src="https://ext.same-assets.com/1284539012/1338461603.svg"
              alt="scrap"
              width={12}
              height={12}
              className="mr-1"
            />
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
