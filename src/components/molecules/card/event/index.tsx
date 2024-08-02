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
}

export const EventCard = ({
  src,
  alt,
  title,
  desc,
  date,
  href,
}: EventCardProps) => {
  return (
    <article className={styles.event}>
      <Link className={styles.grid} href={href}>
        <div className={styles.thumbnail}>
          <Image fill src={src} alt={alt} />
        </div>

        <div className={styles.content}>
          <div className={styles.title}>
            <p className={styles.name}>{title}</p>
            <p className={styles.date}>{date}</p>
          </div>
          <p className={styles.desc}>{desc}</p>
        </div>
      </Link>
    </article>
  );
};
