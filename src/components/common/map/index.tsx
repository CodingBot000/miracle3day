"use client";

import Script from "next/script";
import { useRef } from "react";
import styles from "./map.module.scss";
import { createNonce } from "@/utils/security";

export type TCoordinatesType = {
  title?: string;
  lat: number;
  lng: number;
};

interface MapProps {
  coordinates: TCoordinatesType[];
}

export const Map = ({ coordinates }: MapProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const onReady = () => {
    if (!ref.current) return;

    const map = new window.google.maps.Map(ref.current, {
      center: coordinates[0],
      zoom: 18,
    });

    coordinates.forEach((maker) => {
      const makers = new google.maps.Marker({
        title: maker.title,
        position: {
          lat: maker.lat,
          lng: maker.lng,
        },
        map,
      });
    });
  };

  return (
    <>
      <Script
        type="text/javascript"
        strategy="afterInteractive"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}&region=KR&language=en&callback=initMap`}
        nonce={createNonce()}
        onReady={onReady}
      />

      <div ref={ref} id="map" className={styles.map}></div>
    </>
  );
};
