"use server";

import { ROUTE } from "@/router";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const updatePasswordActions = async (
  prev: { status: string; message: string },
  formData: FormData
) => {
  const supabase = createClient();

  const password = formData.get("password") as string;

  if (!password) {
    return {
      ...prev,
      message: "required password",
      status: "error",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      ...prev,
      message: error.code || error.message,
      status: "error",
    };
  }

  redirect(ROUTE.HOME);
};

export default updatePasswordActions;
