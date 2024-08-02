"use client";

import { MouseEventHandler, PropsWithChildren } from "react";

import styles from "./button.module.scss";
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
  const buttonTypeStyles = `${variant}_${color}`;

  return (
    <button
      onClick={onClick}
      className={clsx(styles.button, styles[buttonTypeStyles], {
        [styles.fullWidth]: fullWidth,
      })}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
