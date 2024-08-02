"use client";

import { PropsWithChildren } from "react";

import styles from "./confirm-modal.module.scss";
import Button from "@/components/atoms/button";
import { ModalOverlay } from "@/components/organism/layout/modal/overlay";

interface ConfirmModalProps {
  open: boolean;

  onCancel: () => void;
  onConfirm: () => void;

  title?: string;
}

export const ConfirmModal = ({
  open,
  title,
  children,
  onCancel,
  onConfirm,
}: PropsWithChildren<ConfirmModalProps>) => {
  return (
    <ModalOverlay open={open} handleClick={onCancel}>
      {title && <h1 className={styles.title}>{title}</h1>}

      <div className={styles.content}>{children}</div>

      <div className={styles.btn_group}>
        <Button variant="outline" color="white" onClick={onCancel}>
          CANCEL
        </Button>
        <Button color="blue" onClick={onConfirm}>
          SIGN UP
        </Button>
      </div>
    </ModalOverlay>
  );
};
