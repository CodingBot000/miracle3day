"use client";

import { log } from '@/utils/logger';


import { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import { MenuIcon } from "@/components/icons/menu";
import { CancelIcon } from "@/components/icons/cancel";
import { ROUTE } from "@/router";
import { cosmetic, LOCATIONS, surgical } from "@/constants";
import { createSidebarPath } from "@/utils";
import Link from "next/link";
import Portal from "@/components/common/portal";
import useModal from "@/hooks/useModal";

const menuList = [
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
    list: createSidebarPath(LOCATIONS, "location"),
  },
];

const menu = [
  { title: "Favorite", href: ROUTE.FAVORITE },
  { title: "Event", href: ROUTE.EVENT },
  { title: "Overall AI Treatment Flow", href: ROUTE.DIAGNOTSTIC },
  { title: "Online Consultation", href: ROUTE.ONLINE_CONSULTING },
  { title: "About Us", href: ROUTE.ABOUTUS },
];

const Menu = () => {
  const modalRef = useRef(null);
  const { handleOpenModal, open } = useModal();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);


  return (
    <div className="flex items-center">
      <MenuIcon
        onClick={() => {
          log.debug("Menu Clicked open", open);
          handleOpenModal();
        }}
      />

      <Portal>
        <div
          ref={modalRef}
          className={`fixed left-0 w-full max-h-[80vh] transition-all duration-300 p-5 bg-white/70 backdrop-blur z-[99] flex-col md:flex ${
            open ? "top-0" : "-top-[100%]"
          }`}
        >
          <div
            className="justify-end cursor-pointer md:flex"
            onClick={handleOpenModal}
          >
            <CancelIcon />
          </div>

          <div className="overflow-y-auto bg-white/20 flex-wrap justify-around w-full scrollbar-thin scrollbar-thumb-black/30 scrollbar-track-transparent md:flex">
            {/* Menu sections */}
            {menuList.map(({ title, list }) => (
              <section key={title} className="p-4 flex-1 flex-col md:flex">
                <h2 className="text-[1.1rem] font-bold my-4 whitespace-pre-line md:block">
                  {title}
                </h2>
                <div className="flex flex-col gap-4 justify-center mt-4 md:flex">
                  {list.map(({ href, menu }) => (
                    <Link
                      key={menu}
                      href={href}
                      onClick={handleOpenModal}
                      className="text-[0.8rem] block px-4 rounded-lg transition-all duration-300 hover:bg-black/10 hover:text-[#363fa8] hover:scale-105 hover:shadow-md"
                    >
                      {menu}
                    </Link>
                  ))}
                </div>
              </section>
            ))}

            {/* Sub menu */}
            <div className="hidden md:flex flex-col items-start gap-5 p-2">
              {menu.map(({ title, href }) => (
                <div key={title} className="flex flex-col p-2 min-w-[150px] md:flex">
                  <Link
                    href={href}
                    onClick={handleOpenModal}
                    className="block px-4 rounded-lg transition-all duration-300 hover:bg-black/10 hover:text-[#363fa8] hover:scale-105 hover:shadow-md"
                  >
                    <nav className="text-[1.1rem] font-bold whitespace-pre-line">{title}</nav>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Portal>
    </div>
  );
};

export default Menu;
