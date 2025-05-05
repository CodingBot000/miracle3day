import Image from "next/image";

import styles from "./event-card.module.scss";
import Link from "next/link";

interface EventCardProps {
  src: string;
  alt: string;

  title: string;
  date: string;
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

        {/* 콘텐츠 영역 */}
        <div
          className={`
            p-4 flex flex-col gap-1 text-sm
            md:min-h-[140px]
          `}
        >
          <h3 className="font-semibold text-sm leading-snug line-clamp-2">{title}</h3>
          <time className="text-gray-500 dark:text-gray-400 text-xs">{date}</time>
          <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-3">{desc}</p>
        </div>
      </Link>
    </article>
  );
};
