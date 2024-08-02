"use client";

import { MenuIcon } from "@icons/menu";
import styles from "./menu.module.scss";

import { CancelIcon } from "@/components/icons/cancel";
import Portal from "@/components/common/portal";
import { cosmetic, location, surgical } from "@/constants";
import { Chip } from "@/components/atoms/chip";
import Link from "next/link";
import { createSidebarPath } from "@/utils";
import { ROUTE } from "@/router";
import useModal from "@/hooks/useModal";
import { clsx } from "clsx";
import { useRef } from "react";

type TSubMenuList = { title: string; href: string };
type TMenuList = {
  title: string;
  list: { menu: string; href: string }[];
};

const menuList: TMenuList[] = [
  {
    title: "Surgical Procedure",
    list: createSidebarPath(surgical, "surgical"),
  },
  {
    title: "Cosmetic Procedure",
    list: createSidebarPath(cosmetic, "cosmetic"),
  },
  {
    title: "Location",
    list: createSidebarPath(location, "location"),
  },
];

const menu: TSubMenuList[] = [
  { title: "Favorite", href: ROUTE.FAVORITE },
  { title: "Event", href: ROUTE.EVENT },
  { title: "About Us", href: "#" },
];

export const Menu = ({}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const { handleOpenModal, open } = useModal();

  const renderMenuList = ({ title, list }: TMenuList) => {
    return (
      <section key={title} className={styles.section}>
        <h2 className={styles.title}>{title}</h2>

        <div className={styles.chip_wrapper}>
          {list.map(({ href, menu }) => {
            const isHref = title === "Location" ? href : "#";

            return (
              <Link key={menu} href={isHref} onClick={handleOpenModal}>
                <Chip>{menu}</Chip>
              </Link>
            );
          })}
        </div>
      </section>
    );
  };

  const renderSubMenu = ({ title, href }: TSubMenuList) => {
    return (
      <div className={styles.subMenu} key={title}>
        <Link href={href} onClick={handleOpenModal}>
          <nav className={styles.title}>{title}</nav>
        </Link>
      </div>
    );
  };

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

          {/* list menu */}
          {menuList.map(renderMenuList)}

          {/* sub menu */}
          {menu.map(renderSubMenu)}
        </div>
      </Portal>
    </div>
  );
};
