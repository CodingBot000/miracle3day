import { PropsWithChildren } from "react";

export const Chip = ({ children }: PropsWithChildren) => {
  return (
    <p className="rounded-[24px] border-2 border-[#b6b0b0] px-[10px] py-[3px] text-base cursor-pointer">
      {children}
    </p>
  );
};
