import { PropsWithChildren } from "react";

// export const Chip = ({ children }: PropsWithChildren) => (
//   <span className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
//     {children}
//   </span>
// );

export const Chip = ({ children }: PropsWithChildren) => {
  return (
    <p className="inline-block rounded-[24px] border-2 border-[#b6b0b0] px-[10px] py-[3px] text-base cursor-pointer">
      {children}
    </p>
  );
};
