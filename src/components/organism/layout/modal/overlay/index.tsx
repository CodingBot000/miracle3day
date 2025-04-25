"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalOverlayProps {
  open: boolean;
  handleClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const ModalOverlay = ({
  open,
  handleClick,
  children,
  className,
}: ModalOverlayProps) => {
  return (
    <Dialog open={open} onOpenChange={handleClick}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        {children}
      </DialogContent>
    </Dialog>
  );
};
