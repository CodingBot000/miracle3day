"use client";

import { PropsWithChildren } from "react";

import styles from "./alert-modal.module.scss";
import Button from "@/components/atoms/button";
import { ModalOverlay } from "@/components/organism/layout/modal/overlay";

interface AlertModalProps {
  open: boolean;

  onCancel: () => void;

  title?: string;
}

export const AlertModal = ({
  open,
  title,
  children,
  onCancel,
}: PropsWithChildren<AlertModalProps>) => {
  return (
    <ModalOverlay open={open} handleClick={onCancel} type="alert">
      {title && <h1 className={styles.title}>{title}</h1>}

      <div className={styles.content}>{children}</div>

      <div className={styles.btn_group}>
        <Button variant="contained" color="red" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </ModalOverlay>
  );
};
