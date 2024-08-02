import React from "react";

import Button, { ButtonProps } from "..";
import { useFormStatus } from "react-dom";

interface SubmitButton extends ButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
}

export const SubmitButton = ({
  children,
  disabled,
  ...buttonProps
}: SubmitButton) => {
  const { pending } = useFormStatus();

  return (
    <Button {...buttonProps} disabled={disabled || pending}>
      {children}
    </Button>
  );
};
