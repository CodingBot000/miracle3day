"use client";

import Image from "next/image";

import styles from "./thumbnail.module.scss";
import { useState } from "react";
import { clsx } from "clsx";

interface ThumbnailImgProps {
  src: string;
  alt: string;

  blurDataURL?: string;
}

const ThumbnailImg = (props: ThumbnailImgProps) => {
  const { src, alt, blurDataURL } = props;

  // 기본 이미지 경로
  // 변경이나 예외가 발생한다면 경로 문제일수도 있으니
  // public 폴더가 기본 경로기 때문에 / hospitalimg / ~는 사실 public / hospitalimg~ 이니까 참고해서 사용하시면 됩니다.
  const placeholderImgPath = "/hospitalimg/hospital_default.png";

  const [imgSrc, setImgSrc] = useState<string>(src);
  const [load, setLoad] = useState<boolean>(false);

  const onError = () => {
    // 이미지 불러오기 실패시 기본 이미지 사용
    setImgSrc(placeholderImgPath);
  };

  const onLoad = () => {
    setLoad(true);
  };

  return (
    <div className={styles.thumbnail_box}>
      <Image
        className={clsx(styles.thumbnail_img, {
          [styles.load]: load,
        })}
        fill
        src={imgSrc}
        alt={alt}
        placeholder="blur"
        blurDataURL={blurDataURL || placeholderImgPath}
        onError={onError}
        onLoad={onLoad}
      />
    </div>
  );
};

export default ThumbnailImg;
