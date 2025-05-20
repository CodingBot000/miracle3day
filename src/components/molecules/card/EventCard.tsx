import Link from "next/link";
import { DiscountPriceDisplay } from "@/components/common/DiscountPriceDisplay";
import ImageAutoRatioComp from "@/components/common/ImageAutoRatioComp";
import { daysYMDFormat } from "@/utils/days";
interface EventCardProps {
  src: string;
  alt: string;
  title: string;
  dateFrom: string;
  dateTo: string;
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
  dateFrom,
  dateTo,
  price,
  href,
  layout = "responsive",
}: EventCardProps) => {
  return (
    <article className="bg-white dark:bg-gray-950 rounded-lg overflow-hidden hover:bg-purple-50 shadow-sm">
      <Link href={href} className="flex flex-col">
        {/* 이미지 영역 */}
        <div className="w-full">
          <ImageAutoRatioComp
            src={src}
            alt={alt}
            objectFit="cover"
            showSkeleton={true}
            fallbackText="can't load image"
            className="w-full h-full shadow-md rounded-t-lg"
          />
        </div>

        {/* 텍스트 영역 */}
        <div className="p-4 flex flex-col gap-2 justify-between text-xs sm:text-sm md:text-base">
          <h3 className="font-bold text-lg sm:text-xl leading-tight line-clamp-2 min-h-[3.5rem]">
            {title}
          </h3>

          <div className="flex justify-end text-xs text-gray-500 mb-1">
            <time>
              {daysYMDFormat(dateFrom)} ~ {daysYMDFormat(dateTo)}
            </time>
          </div>

          <DiscountPriceDisplay price={price} />

          <p className="text-gray-600 leading-relaxed line-clamp-3">{desc}</p>
        </div>

      </Link>
    </article>
  );
};
