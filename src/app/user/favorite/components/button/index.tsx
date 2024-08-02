import Button, { ButtonProps } from "@/components/atoms/button";
import LoadingSpinner from "@/components/atoms/loading/spinner";
import React from "react";

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
    <>
      {pending && <LoadingSpinner backdrop />}
      <Button {...buttonProps} color="blue">
        {children}
      </Button>
    </>
  );
};
