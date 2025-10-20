"use server";

import { TABLE_MEMBERS } from "@/constants/tables";
import { ROUTE } from "@/router";
import { createClient } from "@/utils/session/server";

const resetPasswordActions = async (
  prev: { message: string },
  formData: FormData
) => {
  const backendClient = createClient();

  const email = formData.get("email") as string;

  const findUser = await backendClient.from(TABLE_MEMBERS).select("email").match({ email });

  if (!findUser.data?.length) {
    return {
      ...prev,
      message: "not found User",
    };
  }

  const { error } = await backendClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_API_ROUTE}${ROUTE.UPDATE_PASSWORD}`,
  });

  if (error) {
    return {
      ...prev,
      message: error.code || error.message,
    };
  }

  return {
    ...prev,
    message: "send success",
  };
};

export default resetPasswordActions;
