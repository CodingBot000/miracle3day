"use client";

import { MenuIcon } from "@icons/menu";
import styles from "./menu.module.scss";

import { CancelIcon } from "@/components/icons/cancel";
import Portal from "@/components/common/portal";
import { cosmetic, locationNames, surgical } from "@/constants";

import { Chip } from "@/components/atoms/Chip";
import Link from "next/link";
import { createSidebarPath } from "@/utils";
import { ROUTE } from "@/router";
import useModal from "@/hooks/useModal";
import { clsx } from "clsx";
import { useRef, useEffect, useState } from "react";

type TSubMenuList = { title: string; href: string };
type TMenuList = {
  title: string;
  list: { menu: string; href: string }[];
};

const menuList: TMenuList[] = [
  {
    title: "Surgical\nProcedure",
    list: createSidebarPath(surgical, "procedure"),
  },
  {
    title: "Cosmetic\nProcedure",
    list: createSidebarPath(cosmetic, "procedure"),
  },
  {
    title: "Location",
    list: createSidebarPath(locationNames, "location"),
  },
];

const menu: TSubMenuList[] = [
  { title: "Favorite", href: ROUTE.FAVORITE },
  { title: "Event", href: ROUTE.EVENT },
  { title: "About Us", href: ROUTE.ABOUTUS },
  // { title: "About Us", href: "#" },
];

export const Menu = ({}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { handleOpenModal, open } = useModal();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const renderMenuList = ({ title, list }: TMenuList) => {
    
    return (
      <section key={title} className={styles.section}>
        <h2 className={styles.title}>{title}</h2>

        <div className={styles.chip_wrapper}>
          {list.map(({ href, menu }) => {
            // let logRenderMenu = `log logRenderMenu title=${title} href=${href} menu=${menu}`;
            // console.log(logRenderMenu);
            // const isHref = title === "Location" ? href : "#";
            

            return (
              // <Link key={menu} href={isHref} onClick={handleOpenModal}>
              <Link key={menu} href={href} onClick={handleOpenModal} className={styles.menuItem}>
                {/* <Chip>{menu}</Chip> */}
                {menu}
              </Link>
            );
          })}
        </div>
      </section>
    );
  };

  const renderSubMenu = ({ title, href }: TSubMenuList) => {
    // let logRenderSubMenu = `log renderSubMenu title=${title} href=${href}`;
    // console.log(logRenderSubMenu);

    return (
      <div className={styles.subMenu} key={title}>
        <Link href={href} onClick={handleOpenModal}  className={styles.menuItem}>
          <nav className={styles.title}>{title}</nav>
        </Link>
      </div>
    );
  };

  if (isMobile) {
    return null;
  }

  return (
    <div className={styles.menu}>
      <MenuIcon onClick={handleOpenModal} />

      <Portal>
        <div
          ref={modalRef}
          className={clsx(styles.overlay, {
            [styles.open]: open,
          })}
        >
          <div className={styles.cancel} onClick={handleOpenModal}>
            <CancelIcon />
          </div>

          <div className={styles.menu_container}>
            {/* list menu */}
            {menuList.map(renderMenuList)}

            {/* sub menu */}
            <div className={styles.subMenu_container}>
              {menu.map(renderSubMenu)}
            </div>
          </div>
        </div>
      </Portal>
    </div>
  );
};

export default Menu;
