"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { SwiperOptions } from "swiper/types";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import Image from "next/image";
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
            <div
              className="
                relative w-full max-w-[800px] mx-auto overflow-hidden bg-white
                aspect-[4/2] md:aspect-[4/2] sm:aspect-[3/2]
              "
            >
              <Image
                src={imgurl}
                alt={name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 800px) 50vw, 33vw"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
              <span
                className="
                  absolute right-4 bottom-4 px-4 py-2 bg-[#e5982c] text-white rounded-lg
                  sm:right-2 sm:bottom-2 sm:px-2 sm:py-1 sm:text-sm
                "
              >
                {name}
              </span>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
