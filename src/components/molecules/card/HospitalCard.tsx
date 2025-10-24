"use client";

import { findRegionByKey, REGIONS } from "@/constants";
// import Image from "next/image";;
import Link from "next/link";
// import { SmartImage } from "@/components/template/SmartImage";
import Image from "next/image";

interface HospitalCardProps {
  src: string;
  alt: string;

  onSelect?: (name: string) => void;

  name: string;
  href: string;
  locationNum?: string;
}

export const HospitalCard = ({
  alt,
  src,
  name,
  href,
  locationNum,
  onSelect,
}: HospitalCardProps) => {
  const locationKey =
    typeof locationNum === "string" && locationNum.length > 0
      ? Number.parseInt(locationNum, 10)
      : undefined;
  const region =
    typeof locationKey === "number" && Number.isFinite(locationKey)
      ? findRegionByKey(REGIONS, locationKey)
      : undefined;
        
  // console.log('HospitalCard src:', src);
  return (
    <article onClick={() => onSelect && onSelect(name)}>
      <Link href={href}>
        <div className="w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full transition-all duration-300 hover:shadow-md">
            {/* Hospital Image */}
            <div className="relative h-40 md:h-48 rounded-t-xl overflow-hidden">
              <Image src={src} alt={alt} fill className="object-cover" />
              
            </div>
            
            {/* Hospital Info */}
            <div className="p-3 md:p-4">
              <h3 className="font-semibold text-gray-900 text-sm md:text-lg mb-1 line-clamp-2">
                {name}
              </h3>
              {region?.label?.en && (
                <p className="text-gray-500 text-xs md:text-sm">
                  {region.label.en}
                  
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};
