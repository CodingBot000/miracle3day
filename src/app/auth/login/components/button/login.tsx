import Button from "@/components/atoms/button/Button";
import { useFormStatus } from "react-dom";

const LoginButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} color="blue">
      {!pending ? "LOGIN" : "...Loading"}
    </Button>
  );
};

export default LoginButton;
