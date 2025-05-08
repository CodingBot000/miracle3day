import Image from "next/image";

import styles from "./event-card.module.scss";
import Link from "next/link";
import { PriceDisplay } from "@/components/common/PriceDisplay";

interface EventCardProps {
  src: string;
  alt: string;

  title: string;
  date: string;
  price: number[];
  desc: string;

  href: string;
  layout?: "responsive";
}

export const EventCard = ({
  src,
  alt,
  title,
  desc,
  date,
  price,
  href,
  layout = "responsive",
}: EventCardProps) => {
  return (
      <article className="bg-white dark:bg-gray-950 rounded-lg overflow-hidden transition hover:bg-purple-50">
      <Link
        href={href}
        className={`
          flex flex-row md:flex-col
        `}
      >
        {/* 이미지 영역 */}
        <div
          className={`
            relative
            w-[120px] h-[120px]
            md:w-full md:h-[180px]
            flex-shrink-0
          `}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 120px, 100vw"
          />
        </div>

        
        <div className="p-4 flex flex-col gap-1 text-sm md:min-h-[140px]">
          <h3 className="font-bold text-xl leading-tight">{title}</h3>
          <time className="text-gray-500 text-sm mb-1">{date}</time>
          <PriceDisplay price={price} />
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{desc}</p>
      </div>
      </Link>
    </article>
  );
};
