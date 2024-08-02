"use client";

import InputField from "@/components/molecules/form/input-field";

import styles from "./forget-password.module.scss";
import { useFormState } from "react-dom";
import resetPasswordActions from "./actions";
import { useEffect } from "react";
import useModal from "@/hooks/useModal";
import { AlertModal } from "@/components/template/modal/alert";

import { SubmitButton } from "@/components/atoms/button/submit";

const ForgetPasswordPage = () => {
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
      <form className={styles.wrapper} action={actions}>
        <div>
          <InputField label={"Email"} name={"email"} />
        </div>
        <div className={styles.btn}>
          <SubmitButton color="blue">{"Send Email"}</SubmitButton>
        </div>
      </form>

      <AlertModal open={open} onCancel={handleOpenModal}>
        {state?.message}
      </AlertModal>
    </main>
  );
};

export default ForgetPasswordPage;
