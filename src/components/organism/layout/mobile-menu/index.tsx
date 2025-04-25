"use client";

import { Home, Stethoscope, Calendar, MapPin, Heart } from "lucide-react";
import styles from "./mobile-menu.module.scss";

const MobileMenu = () => {
  const handleHomeClick = () => {
    console.log("Home clicked");
  };

  const handleProcedureClick = () => {
    console.log("Procedure clicked");
  };

  const handleEventClick = () => {
    console.log("Event clicked");
  };

  const handleLocationClick = () => {
    console.log("Location clicked");
  };

  const handleFavoriteClick = () => {
    console.log("Favorite clicked");
  };

  return (
    <div className={styles.mobile_menu}>
      <div className={styles.menu_item} onClick={handleHomeClick}>
        <Home className={styles.icon} />
        <span className={styles.label}>홈</span>
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