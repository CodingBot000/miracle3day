"use server";

import { redirect } from "next/navigation";
import { ROUTE } from "@/router";
import { signUp } from "@/services/auth";
import { revalidatePath } from "next/cache";

type SignUpResult = {
  message?: string;
  error?: {
    [key: string]: string[];
  };
};

export default async function signUpActions(
  prevState: SignUpResult | null,
  formData: FormData
): Promise<SignUpResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const password_confirm = formData.get("password_confirm") as string;
  const name = formData.get("name") as string;
  const nickname = formData.get("nickname") as string;
  const nation = formData.get("nation") as string;

  const fields = [
    { key: "email", value: email, message: "Please enter your email." },
    { key: "password", value: password, message: "Please enter your password." },
    { key: "password_confirm", value: password_confirm, message: "Please confirm your password." },
    { key: "name", value: name, message: "Please enter your name." },
    { key: "nickname", value: nickname, message: "Please enter your nickname." },
    { key: "nation", value: nation, message: "Please select your country." },
  ];
  
  const error: Record<string, string[]> = {};
  
  for (const field of fields) {
    if (!field.value) {
      error[field.key] = [field.message];
    }
  }
  
  if (Object.keys(error).length > 0) {
    return { error };
  }

  if (password !== password_confirm) {
    return {
      error: {
        password_confirm: ["Passwords do not match."],
      },
    };
  }

  try {
    await signUp({
      email,
      password,
      name,
      nickname,
      nation,
    });

    revalidatePath("/");
    redirect(ROUTE.LOGIN);
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: {
          email: [error.message],
        },
      };
    }
    return {
      error: {
        email: ["An error occurred during sign-up action."],
      },
    };
  }
}
