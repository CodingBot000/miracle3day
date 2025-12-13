"use client";

import { useNavigation } from "@/hooks/useNavigation";
import Button from "@/components/atoms/button/Button";

const SignUpButton = () => {
  const { navigate } = useNavigation();

  return (
    <>
      <Button
        variant="outline"
        color="blue"
        onClick={(e) => {
          e.preventDefault();
          navigate('/terms');
        }}
      >
        SIGN UP
      </Button>
    </>
  );
};

export default SignUpButton;
