"use client";

import Image from "next/image";
import Link from "next/link";

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
  return (
    <article onClick={() => onSelect && onSelect(name)}>
      <Link href={href}>
        <div className="w-full max-w-sm mx-auto">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100">
            {/* Hospital Image */}
            <div className="relative ">
              <Image
                src={src}
                alt={alt}
                width={400}
                height={240}
                className="w-full h-48 object-cover  rounded-xl"
                style={{ aspectRatio: "400/240", objectFit: "cover" }}
              />
            </div>
            
            {/* Hospital Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                {name}
              </h3>
              {locationNum && (
                <p className="text-gray-500 text-sm mb-3">
                  {locationNum}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};


