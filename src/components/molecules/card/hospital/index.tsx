"use client";

import Image from "next/image";

import styles from "./hospital-card.module.scss";
import Link from "next/link";
import { locationNames } from "@/constants";


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
    <article
    // className={styles.hospital_card_wrapper}
    onClick={() => onSelect && onSelect(name)}
  >
    <Link href={href}>
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl dark:bg-gray-950">
        <Image
          src={src}
          alt={alt}
          width={600}
          height={300}
          className="w-full h-40 object-cover"
          style={{ aspectRatio: "600/300", objectFit: "cover" }}
        />
        <div className="p-4 space-y-2">
          <h3 className="text-xl font-semibold">{name}</h3>
          {locationNum !== undefined && (
            <p className="text-gray-500 dark:text-gray-400">{locationNames[parseInt(locationNum)]}</p>
          )}
          
          {/* <div className="flex items-center justify-between">
            <span className="text-lg font-bold">
              <p>{locationNames[parseInt(locationNum)]}</p>
              </span>
            <Button>Add</Button>
          </div> */}
        </div>
      </div>
    </div>
    </Link>
    </article>
  )
}




// "use client";

// import Image from "next/image";

// import styles from "./hospital-card.module.scss";
// import Link from "next/link";

// interface HospitalCardProps {
//   src: string;
//   alt: string;

//   onSelect?: (name: string) => void;

//   name: string;

//   href: string;
// }

// export const HospitalCard = ({
//   alt,
//   src,
//   name,
//   href,
//   onSelect,
// }: HospitalCardProps) => {
//   return (
//     <article
//       className={styles.hospital_card_wrapper}
//       onClick={() => onSelect && onSelect(name)}
//     >
//       <Link href={href}>
//         <div className={styles.thumbnail_box}>
//           <Image fill src={src} alt={alt} priority />
//         </div>
      
//       </Link>
//       <p className={styles.name}>{name}</p>
//     </article>
//   );
// };
