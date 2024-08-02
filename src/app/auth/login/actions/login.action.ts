"use server";

import { ROUTE } from "@/router";
import { createActionRedirectUrl } from "@/utils";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  email: z.string().email({ message: "Invalid Email" }),
  password: z
    .string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*_-]).{8,}$/, {
      message: "Invalid Password",
    }),
});

export const signInActions = async (prevState: any, formData: FormData) => {
  const referer = headers().get("referer") as string;

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validation = schema.safeParse({
    email,
    password,
  });

  if (!validation.success) {
    return {
      ...prevState,
      error: validation.error.flatten().fieldErrors,
    };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!error) {
    revalidatePath(ROUTE.HOME);
    redirect(ROUTE.HOME);
  }

  redirect(createActionRedirectUrl(referer, error?.message));
};
