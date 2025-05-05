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
        email: ["이메일을 입력해주세요."],
        password: ["비밀번호를 입력해주세요."],
        password_confirm: ["비밀번호 확인을 입력해주세요."],
        name: ["이름을 입력해주세요."],
        nickname: ["닉네임을 입력해주세요."],
        nation: ["국가를 선택해주세요."],
      },
    };
  }

  if (password !== password_confirm) {
    return {
      error: {
        password_confirm: ["비밀번호가 일치하지 않습니다."],
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
        email: ["회원가입 중 오류가 발생했습니다."],
      },
    };
  }
}
