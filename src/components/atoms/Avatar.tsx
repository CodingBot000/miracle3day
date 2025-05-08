"use client";

import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  src: string;
  alt: string;
}

const Avatar = ({ alt, src }: AvatarProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const fallback = "/default/doctor_default.png";

  return (
    <Image
      className="rounded-full border border-[#eee]"
      width={92}
      height={92}
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== fallback) {
          setImgSrc(fallback);
        }
      }}
    />
  );
};

export default Avatar;
