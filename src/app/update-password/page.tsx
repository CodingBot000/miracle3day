"use client";

import InputField from "@/components/molecules/form/input-field";

import styles from "./update-password.module.scss";
import { useFormState } from "react-dom";
import updatePasswordActions from "./actions";
import { useEffect, useState } from "react";
import useModal from "@/hooks/useModal";
import { AlertModal } from "@/components/template/modal/alert";
import { SubmitButton } from "@/components/atoms/button/submit";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ROUTE } from "@/router";

type State = { status: string; message: string };

const UpdatePasswordPage = () => {
  const router = useRouter();
  const supabase = createClient();

  const { setOpen, open, handleOpenModal } = useModal();

  const [isAuth, setIsAuth] = useState<boolean>(false);

  const [state, actions] = useFormState<State, FormData>(
    updatePasswordActions,
    { status: "", message: "" }
  );

  const handleModalClick = () => {
    if (state.status === "error") {
      handleOpenModal();
    } else {
      router.replace(ROUTE.HOME);
    }
  };

  useEffect(() => {
    if (state?.message) {
      setOpen(true);
    }
  }, [setOpen, state]);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        router.replace(ROUTE.HOME);
      }

      setIsAuth(!!session);
    });
  }, [router, supabase.auth]);

  return (
    <main>
      <form className={styles.wrapper} action={actions}>
        <div>
          <InputField label="New Password" name="password" type="password" />
        </div>
        <div className={styles.btn}>
          <SubmitButton disabled={!isAuth}>Reset Password</SubmitButton>
        </div>
      </form>

      <AlertModal open={open} onCancel={handleModalClick}>
        {state?.message}
      </AlertModal>
    </main>
  );
};

export default UpdatePasswordPage;
