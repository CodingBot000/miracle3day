"use client";

import { MouseEventHandler, PropsWithChildren } from "react";
import clsx from "clsx";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "red" | "blue" | "white";
  variant?: "outline" | "contained";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  fullWidth?: boolean;
}

const Button = ({
  children,
  color = "white",
  variant = "contained",
  onClick,
  fullWidth,
  ...props
}: PropsWithChildren<ButtonProps>) => {
  const baseStyles = "outline-none border-none flex justify-center items-center px-4 py-3 rounded cursor-pointer disabled:bg-[#e8e8e8]";

  const colorMap: Record<string, string> = {
    "outline_red": "text-[#e74c3c] border border-[#e74c3c] bg-transparent",
    "outline_blue": "text-[#3498db] border border-[#3498db] bg-transparent",
    "outline_white": "text-[#000000] border border-[#000000] bg-transparent",

    "contained_red": "text-white bg-[#e74c3c]",
    "contained_blue": "text-white bg-[#3498db]",
    "contained_white": "text-white bg-[#000000]",
  };

  const key = `${variant}_${color}`;
  const colorStyles = colorMap[key] || "";

  return (
    <button
      onClick={onClick}
      className={clsx(baseStyles, colorStyles, {
        "w-full": fullWidth,
      })}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
