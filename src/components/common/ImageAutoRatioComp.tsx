"use client";

import Image from "next/image";;
import { useEffect, useRef, useState } from "react";

interface ImageAutoRatioCompProps {
  src: string;
  alt: string;
  objectFit?: "contain" | "cover" | "fill";
  className?: string;
  showSkeleton?: boolean;
  fallbackText?: string;
}

const ImageAutoRatioComp = ({
  src,
  alt,
  objectFit = "contain",
  className = "",
  showSkeleton = true,
  fallbackText = "Image not available",
}: ImageAutoRatioCompProps) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
        setIsLoaded(true);
      }
    };
    img.onerror = () => {
      setHasError(true);
    };
  }, [src]);

  if (hasError) {
    return (
      <div
        className={`w-full rounded-lg border bg-gray-100 text-center py-10 text-sm text-gray-500 ${className}`}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg border bg-white ${className}`}
      style={{
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
      }}
    >
      {!isLoaded && showSkeleton && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}

      {aspectRatio && (
        <Image
          src={src}
          alt={alt}
          fill
          className={`transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } object-${objectFit}`}
          unoptimized
        />
      )}
    </div>
  );
};

export default ImageAutoRatioComp;
