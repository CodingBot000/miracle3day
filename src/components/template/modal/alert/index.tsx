"use client";

import { ModalOverlay } from "@/components/organism/layout/modal/overlay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AlertModalProps {
  open: boolean;
  onCancel: () => void;
  children: React.ReactNode;
  className?: string;
}

export const AlertModal = ({
  open,
  onCancel,
  children,
  className,
}: AlertModalProps) => {
  return (
    <ModalOverlay open={open} handleClick={onCancel} className={className}>
      <div className="space-y-4">
        <div className="text-center">{children}</div>
        <div className="flex justify-center">
          <Button onClick={onCancel}>확인</Button>
        </div>
      </div>
    </ModalOverlay>
  );
};
