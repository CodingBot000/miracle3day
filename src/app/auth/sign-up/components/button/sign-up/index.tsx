"use client";

import Button from "@/components/atoms/button/Button";
import { useFormStatus } from "react-dom";

interface SignUpButtonProps {
  disabled: boolean;
}

const SignUpConfirmButton = ({ disabled }: SignUpButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <Button fullWidth disabled={pending || !disabled} color="blue">
      {pending ? "Loading..." : "SIGN UP"}
    </Button>
  );
};

export default SignUpConfirmButton;
