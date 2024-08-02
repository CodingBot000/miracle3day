import Image from "next/image";
import styles from "./image.module.scss";

interface ImageBoxProps {
  src: string;
  alt: string;
}

const ImageBox = ({ src, alt }: ImageBoxProps) => {
  return (
    <div className={styles.thumbnail}>
      <Image fill src={src} alt={alt} />
    </div>
  );
};

export default ImageBox;
