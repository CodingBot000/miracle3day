import styles from "./header.module.scss";

import { Menu } from "../sidebar/menu";

import Auth from "@/components/molecules/auth";

import Logo from "@/components/molecules/logo";
import LanguageDropdown from "../language";

export const Header = () => {
  return (
    <header className={styles.bg}>
      <div className={styles.wrapper}>
        <Logo />
        {/* <Menu />
        
        <Auth /> */}
        <div className={styles.rightWrapper}>
          <div className={styles.menu}>
            <Menu />
          </div>
          <div className={styles.language}>
            <LanguageDropdown />
          </div>
          <div className={styles.auth}>
            <Auth />
          </div>
        </div>
      </div>
    </header>
  );
};
