"use client";

import { MouseEvent, PropsWithChildren, useEffect, useRef } from "react";

import Portal from "@/components/common/portal";

import styles from "./modal-overlay.module.scss";
import { clsx } from "clsx";

interface ModalOverlayProps {
  open: boolean;
  handleClick: () => void;

  type?: "alert" | "overlay";
}

export const ModalOverlay = ({
  children,
  open,
  handleClick,
  type = "overlay",
}: PropsWithChildren<ModalOverlayProps>) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const handleOutsideClick = (e: MouseEvent<HTMLDivElement>) => {
    if (modalRef.current === e.target) {
      handleClick();
    }
  };

  if (!open) return null;

  return (
    <Portal>
      <div
        ref={modalRef}
        onClick={handleOutsideClick}
        className={styles.overlay}
      >
        <div
          className={clsx(styles.open, {
            [styles.alert]: type === "alert",
          })}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
};
