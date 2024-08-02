import Image from "next/image";

import styles from "./avatar.module.scss";

interface AvatarProps {
  src: string;
  alt: string;
}

const Avatar = ({ alt, src }: AvatarProps) => {
  return (
    <Image
      className={styles.avatar}
      width={92}
      height={92}
      src={src}
      alt={alt}
    />
  );
};

export default Avatar;
