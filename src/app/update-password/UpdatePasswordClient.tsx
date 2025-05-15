"use client";

import { useFormState } from "react-dom";
import updatePasswordActions from "./actions";
import { useEffect, useState } from "react";
import useModal from "@/hooks/useModal";
import { AlertModal } from "@/components/template/modal/Modal";
import { SubmitButton } from "@/components/atoms/button/SubmitButton";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ROUTE } from "@/router";
import InputField from "@/components/molecules/form/input-field";

type State = { status: string; message: string };

export default function UpdatePasswordClient() {
  const router = useRouter();
  const supabase = createClient();

  const { setOpen, open, handleOpenModal } = useModal();
  const [isAuth, setIsAuth] = useState(false);

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
    if (state.message) {
      setOpen(true);
    }
  }, [state.message]);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        router.replace(ROUTE.HOME);
      }
      setIsAuth(!!session);
    });
  }, []);

  return (
    <main>
      <form
        action={actions}
        className="flex justify-center items-center h-[80vh] w-full mx-auto"
      >
        <div className="flex flex-col gap-4 w-full max-w-md">
          <InputField
            label="New Password"
            name="password"
            type="password"
          />
          <div className="whitespace-pre">
            <SubmitButton disabled={!isAuth}>Reset Password</SubmitButton>
          </div>
        </div>
      </form>

      <AlertModal open={open} onCancel={handleModalClick}>
        {state.message}
      </AlertModal>
    </main>
  );
}
