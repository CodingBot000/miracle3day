"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/atoms/button/Button";

const SignUpButton = () => {
  const router = useRouter();

  return (
    <>
      <Button
        variant="outline"
        color="blue"
        onClick={(e) => {
          e.preventDefault();
          router.push('/auth/terms');    
        }}
      >
        SIGN UP
      </Button>
    </>
  );
};

export default SignUpButton;
