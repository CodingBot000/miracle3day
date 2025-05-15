"use client";


import { SwiperOptions } from "swiper/types";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

interface SlideImgProps {
  imageurls: string[];
  children: (img: string) => React.ReactNode;
}

const SlideImg = ({ imageurls, children }: SlideImgProps) => {
  const setting: SwiperOptions = {
    simulateTouch: true,
    grabCursor: true,
    centeredSlides: true,
    observer: true,
    pagination: true,
    modules: [Pagination],
  };

  return (
    <Swiper {...setting}>
      {imageurls.map((img, i) => {
        return <SwiperSlide key={i}>{children(img)}</SwiperSlide>;
      })}
    </Swiper>
  );
};

export default SlideImg;
