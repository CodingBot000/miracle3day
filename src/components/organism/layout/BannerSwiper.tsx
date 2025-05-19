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

interface BannerSwiperProps {
  bannerItem: BannerItem[];
}

export const BannerSwiper = ({ bannerItem = [] }: BannerSwiperProps) => {
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



const SURGERY_BANNERS = [
  {
    id: 0,
    id_unique: "sugery-banner-acne",
    imgurl: "/surgery_banner/surgery_acne.png",
    name: "ACNE",
  },
  {
    id: 1,
    id_unique: "sugery-banner-body",
    imgurl: "/surgery_banner/surgery_body.png",
    name: "BODY",
  },
  {
    id: 2,
    id_unique: "sugery-banner-botox",
    imgurl: "/surgery_banner/surgery_botox.png",
    name: "BOTOX",
  },
  {
    id: 3,
    id_unique: "sugery-banner-lifting",
    imgurl: "/surgery_banner/surgery_lifting.png",
    name: "LIFTING",
  },
  {
    id: 4,
    id_unique: "sugery-banner-pigmentation",
    imgurl: "/surgery_banner/surgery_pigmentation.png",
    name: "PIGMENTATION",
  },

  {
    id: 5,
    id_unique: "sugery-banner-pore",
    imgurl: "/surgery_banner/surgery_pore.png",
    name: "PORE",
  },
  {
    id: 6,
    id_unique: "sugery-banner-skinbooster",
    imgurl: "/surgery_banner/surgery_skinbooster.png",
    name: "SKINBOOSTER",
  },
]