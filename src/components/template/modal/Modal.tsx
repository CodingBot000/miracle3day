"use client";

import { log } from '@/utils/logger';


import { PropsWithChildren, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Button from "@/components/atoms/button/Button";

interface ModalBaseProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  footer?: ReactNode;
  className?: string;
}

export const ModalBase = ({
  open,
  onClose,
  title,
  children,
  footer,
  className = "max-w-md sm:rounded-xl animate-in fade-in-0 zoom-in-95",
}: PropsWithChildren<ModalBaseProps>) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={className}>
        {title && (
          <DialogHeader>
            <DialogTitle className="text-[1.5rem] font-bold py-4">{title}</DialogTitle>
          </DialogHeader>
        )}
        <div className="h-[60vh] max-h-full overflow-y-auto break-words">
          {children}
        </div>
        {footer && <DialogFooter className="pt-4">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};

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
  log.debug('ConfirmModal rendered');
  return (
    <ModalBase
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <div className="flex gap-4 justify-end">
          <Button variant="outline" color="white" onClick={onCancel}>
            CANCEL
          </Button>
          <Button color="blue" onClick={onConfirm}>
            SIGN UP
          </Button>
        </div>
      }
    >
      {children}
    </ModalBase>
  );
};

interface AlertModalProps {
  open: boolean;
  onCancel: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
}

export const AlertModal = ({
  open,
  onCancel,
  children,
  className,
  title,
}: AlertModalProps) => {
  return (
    <ModalBase
      open={open}
      onClose={onCancel}
      title={title}
      className={className || "max-w-sm sm:rounded-xl animate-in fade-in-0 zoom-in-95"}
      footer={
        <div className="flex justify-center">
          <Button onClick={onCancel}>확인</Button>
        </div>
      }
    >
      <div className="text-sm break-words py-4 text-center">
        {children}
      </div>
    </ModalBase>
  );
};
