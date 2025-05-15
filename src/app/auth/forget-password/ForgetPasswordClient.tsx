"use client";

import InputField from "@/components/molecules/form/input-field";
import { useFormState } from "react-dom";
import resetPasswordActions from "./actions";
import { useEffect } from "react";
import useModal from "@/hooks/useModal";
import { AlertModal } from "@/components/template/modal/Modal";
import { SubmitButton } from "@/components/atoms/button/SubmitButton";

const ForgetPasswordClient = () => {
  const [state, actions] = useFormState<{ message: string }, FormData>(
    resetPasswordActions,
    { message: "" }
  );

  const { setOpen, open, handleOpenModal } = useModal();

  useEffect(() => {
    if (state?.message) {
      setOpen(true);
    }
  }, [state]);

  return (
    <main>
      <form
        className="flex justify-center items-center h-[80vh] w-full mx-auto"
        action={actions}
      >
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <InputField label="Email" name="email" />
          <div className="whitespace-pre">
            <SubmitButton color="blue">Send Email</SubmitButton>
          </div>
        </div>
      </form>

      <AlertModal open={open} onCancel={handleOpenModal}>
        {state?.message}
      </AlertModal>
    </main>
  );
};

export default ForgetPasswordClient;
