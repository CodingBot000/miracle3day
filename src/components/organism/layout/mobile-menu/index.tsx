"use client";

import { Home, Stethoscope, Calendar, MapPin, Heart } from "lucide-react";
import styles from "./mobile-menu.module.scss";
import { ROUTE } from "@/router";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LocationEnum, LOCATIONS } from "@/constants";

const MobileMenu = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locationNum = searchParams.get('locationNum') || LocationEnum.Apgujung;

  const handleHomeClick = () => {
    if (pathname === ROUTE.HOME) return;
    router.push(ROUTE.HOME);
  };

  const handleProcedureClick = () => {
    if (pathname === ROUTE.RECOMMEND) return;
    router.push(ROUTE.RECOMMEND);
  };

  const handleEventClick = () => {
    if (pathname === ROUTE.EVENT) return;
    router.push(ROUTE.EVENT);
  };

  const handleLocationClick = () => {
    const currentLocation = locationNum;
    const targetPath = ROUTE.LOCATION_DETAIL("") + currentLocation;
    if (pathname === targetPath) return;
    router.push(targetPath);
  };

  const handleFavoriteClick = () => {
    if (pathname === ROUTE.FAVORITE) return;
    router.push(ROUTE.FAVORITE);
  };

  return (
    <div className={styles.mobile_menu}>
      <div className={styles.menu_item} onClick={handleHomeClick}>
        <Home className={styles.icon} />
        <span className={styles.label}>Home</span>
      </div>
      <div className={styles.menu_item} onClick={handleProcedureClick}>
        <Stethoscope className={styles.icon} />
        <span className={styles.label}>Procedure</span>
      </div>
      <div className={styles.menu_item} onClick={handleEventClick}>
        <Calendar className={styles.icon} />
        <span className={styles.label}>Event</span>
      </div>
      <div className={styles.menu_item} onClick={handleLocationClick}>
        <MapPin className={styles.icon} />
        <span className={styles.label}>Location</span>
      </div>
      <div className={styles.menu_item} onClick={handleFavoriteClick}>
        <Heart className={styles.icon} />
        <span className={styles.label}>Favorite</span>
      </div>
    </div>
  );
};

export default MobileMenu; 