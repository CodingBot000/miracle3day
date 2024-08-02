"use client";

import SlideImg from "@/components/molecules/img/slide";
import Image from "next/image";

import styles from "./thumbnail.module.scss";

interface SlideImgProps {
  imageurls: string[];
}

export const HospitalThumbnail = ({ imageurls }: SlideImgProps) => {
  return (
    <SlideImg imageurls={imageurls}>
      {(item) => {
        return (
          <div className={styles.thumbnail_box}>
            <Image fill src={item} alt={""} />
          </div>
        );
      }}
    </SlideImg>
  );
};
