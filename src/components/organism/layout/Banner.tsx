"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { SwiperOptions } from "swiper/types";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import Image from "next/image";;
import Link from "next/link";
import { ROUTE } from "@/router";
import { BannerItem } from "@/app/api/home/banner/banner.dto";

// interface BannerProps {
//   bannerItem: BannerItem[];
// }

// export const Banner = ({ bannerItem = [] }: BannerProps) => {

export default function SurgeryBannerGrid() {
  return (
    <div className="w-full px-4">
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {SURGERY_BANNERS.map((item) => (
          <Link
            href={`/treatment/${item.id_unique}`}
            key={item.id_unique}
            className="block break-inside-avoid rounded-md shadow-sm hover:shadow-lg transform hover:scale-[1.02] transition duration-200 bg-white overflow-hidden"
          >
            <Image
              src={item.imgurl}
              alt={item.name}
              width={600}
              height={800}
              className="w-full h-auto object-cover"
            />
            <div className="p-3 bg-gray-50 border-t text-center">
              <span className="text-sm font-semibold text-gray-700 tracking-wide">
                {item.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

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