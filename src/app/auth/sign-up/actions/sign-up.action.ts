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

  if (!email || !password || !password_confirm || !name || !nickname || !nation) {
    return {
      error: {
        email: ["Please enter your email."],
        password: ["Please enter your password."],
        password_confirm: ["Please confirm your password."],
        name: ["Please enter your name."],
        nickname: ["Please enter your nickname."],
        nation: ["Please select your country."],
      },
    };
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
        email: ["An error occurred during sign-up."],
      },
    };
  }
}
