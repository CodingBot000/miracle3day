import styles from "./header.module.scss";

import { Menu } from "../sidebar/menu";

import Auth from "@/components/molecules/auth";

import Logo from "@/components/molecules/logo";

export const Header = () => {
  return (
    <header className={styles.bg}>
      <div className={styles.wrapper}>
        <Logo />
        <Menu />
        <Auth />
      </div>
    </header>
  );
};
