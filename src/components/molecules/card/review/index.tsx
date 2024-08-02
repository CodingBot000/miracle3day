import Image from "next/image";

import styles from "./review-card.module.scss";

interface ReviewCardProps {
  src: string;
  alt: string;

  content: string;
  id: string;
  name: string;
}

export const ReviewCard = ({
  alt,
  src,
  id,
  content,
  name,
}: ReviewCardProps) => {
  return (
    <article className={styles.review}>
      <div className={styles.thumbnail}>
        <Image fill src={src} alt={alt} />
      </div>

      <div className={styles.content}>
        <p className={styles.review_content}>{content}</p>

        <div className={styles.review_footer}>
          <p className={styles.id}>{id}</p>
          <p className={styles.hospital}>{name}</p>
        </div>
      </div>
    </article>
  );
};
