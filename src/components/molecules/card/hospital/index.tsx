"use client";

import Image from "next/image";

import styles from "./hospital-card.module.scss";
import Link from "next/link";

interface HospitalCardProps {
  src: string;
  alt: string;

  onSelect?: (name: string) => void;

  name: string;

  href: string;
}

export const HospitalCard = ({
  alt,
  src,
  name,
  href,
  onSelect,
}: HospitalCardProps) => {
  return (
    <article
      className={styles.hospital_card_wrapper}
      onClick={() => onSelect && onSelect(name)}
    >
      <Link href={href}>
        <div className={styles.thumbnail_box}>
          <Image fill src={src} alt={alt} priority />
        </div>
      </Link>
      <p className={styles.name}>{name}</p>
    </article>
  );
};
