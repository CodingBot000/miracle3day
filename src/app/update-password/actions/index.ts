"use server";

import { ROUTE } from "@/router";
import { createClient } from "@/utils/session/server";
import { redirect } from "next/navigation";

const updatePasswordActions = async (
  prev: { status: string; message: string },
  formData: FormData
) => {
  const backendClient = createClient();

  const password = formData.get("password") as string;

  if (!password) {
    return {
      ...prev,
      message: "required password",
      status: "error",
    };
  }

  const { error } = await backendClient.auth.updateUser({
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
