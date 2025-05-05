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
    // console.log("Initializing map", ref.current, coordinates);
    // console.log("coordinates[0].lat", Number(coordinates[0].lat));
    // console.log("coordinates[0].lng", Number(coordinates[0].lng));
    if (!ref.current) {
      console.warn("X Map container not ready");
      return;
    }

    if (!window.google?.maps) {
      console.error("X Google Maps JS API not available");
      return;
    }


    const map = new window.google.maps.Map(ref.current, {
      center: {
        lat: Number(coordinates[0].lat),
        lng: Number(coordinates[0].lng),
      },
      zoom: 18,
    });

    coordinates.forEach((maker) => {
      new google.maps.Marker({
        title: maker.title,
        position: {
          lat: Number(maker.lat),
          lng: Number(maker.lng),
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
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}&region=KR&language=en`}
        nonce={createNonce()}
        onLoad={onReady} 
      />
      <div ref={ref} id="map" className={styles.map}></div>
    </>
  );
};
