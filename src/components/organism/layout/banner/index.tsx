"use client";

import React from "react";

import { SwiperOptions } from "swiper/types";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Pagination, Autoplay } from "swiper/modules";

import Image from "next/image";

import styles from "./banner.module.scss";

import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { ROUTE } from "@/router";
import { BannerItem } from "@/app/api/home/banner/banner.dto";

interface BannerProps {
  bannerItem: BannerItem[];
}

export const Banner = ({ bannerItem = [] }: BannerProps) => {
  const setting: SwiperOptions = {
    simulateTouch: true,
    grabCursor: true,
    centeredSlides: true,
    observer: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: true,
    modules: [Autoplay, Pagination],
  };

  return (
    <Swiper {...setting}>
      {bannerItem.map(({ id, id_unique, imgurl, name }) => (
        <SwiperSlide key={id_unique}>
          <Link href={ROUTE.RECOMMEND_DETAIL("") + id}>
            <div className={styles.banner_img}>
              <Image
                src={imgurl}
                alt={name}
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                sizes="(max-width: 768px) 50vw, (max-width: 800px) 50vw, 33vw"
                fill
              />
              <span className={styles.banner_name}>{name}</span>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
