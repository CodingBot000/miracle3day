"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalOverlayProps {
  open: boolean;
  handleClick: () => void;
  children: React.ReactNode;
  className?: string; // 확장용
}

export const ModalOverlay = ({
  open,
  handleClick,
  children,
  className,
}: ModalOverlayProps) => {
  return (
    <Dialog open={open} onOpenChange={handleClick}>
      <DialogContent
        className={cn(
          "flex flex-col bg-white p-2 rounded-[10px] shadow-md max-w-[600px] w-[80%] max-h-[80%] text-center mx-6",
          className
        )}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};
