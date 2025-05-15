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
        <div className="w-full max-w-md mx-auto">
         <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl dark:bg-gray-950 flex flex-col">
            <Image
              src={src}
              alt={alt}
              width={600}
              height={300}
              className="w-full h-40 object-cover"
              style={{ aspectRatio: "600/300", objectFit: "cover" }}
            />
          <div className="p-3 space-y-1 flex-grow min-h-[72px]">
             <h3 className="font-semibold line-clamp-2 text-sm md:text-xl">
                {name}
              </h3>
              {locationNum !== undefined && (
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-base line-clamp-2">
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


