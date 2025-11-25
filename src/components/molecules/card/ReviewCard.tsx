import Image from "next/image";;

import { formatDate } from "@/app/utils/date/formatDate";

interface ReviewCardProps {
  src?: string;
  alt: string;

  content: string;
  id: string;
  name: string;
  created_at: string;
}

export const ReviewCard = ({
  alt,
  src,
  id,
  content,
  name,
  created_at,
}: ReviewCardProps) => {
  log.debug(`ReviewCard ================================================`);
  log.debug(`ReviewCard name: ${name}`);
  log.debug(`ReviewCard created_at: ${created_at}`);
  log.debug(`ReviewCard src: ${src}`);
  log.debug(`ReviewCard content: ${content}`);
  
  return (
    <article className="w-full max-w-[280px] h-auto flex-shrink-0">
      <div className="bg-white rounded-lg overflow-hidden transition-all duration-300 dark:bg-gray-950 h-full flex flex-col">
        {src && (
          <Image
          src={src!}
          alt={alt}
          width={600}
          height={300}
          className="w-full h-[140px] object-cover"
          style={{ aspectRatio: "600/300", objectFit: "cover" }}
        />
      )}
        
        <div className="p-3 text-xs leading-tight flex-1 flex flex-col">
          <p className="font-medium line-clamp-3 mb-1">
            {content}
          </p>
          <div className="space-y-[2px]">
            <p className="text-gray-500 dark:text-gray-400 font-bold text-[0.75rem]">{name}</p>
            <p className="text-gray-500 dark:text-gray-400 text-[0.75rem]">{id}</p>
            <p className="text-gray-500 dark:text-gray-400 text-[0.75rem]">
              {formatDate(created_at, { formatString: "PPP", locale: "en" })}

            </p>
          </div>
        </div>
      </div>
    </article>

  );
};
