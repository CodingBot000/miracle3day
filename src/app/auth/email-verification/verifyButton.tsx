import Button from "@/components/atoms/button";
import { useFormStatus } from "react-dom";

interface VerifyButtonProps {
  disabled: boolean;
}
const VerifyButton = ({ disabled }: VerifyButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" color="blue" fullWidth disabled={pending || disabled}>
      Verification Code
    </Button>
  );
};

export default VerifyButton;
