"use server";

import { ROUTE } from "@/router";
import { createClient } from "@/utils/supabase/server";

import { redirect } from "next/navigation";

const signUpActions = async (
  prevState: { message: string | null },
  formData: FormData
) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const nickname = formData.get("nickname") as string;
  const country_name = formData.get("nationality") as string;

  if (!country_name) {
    return {
      ...prevState,
      message: "not select country",
    };
  }

  const supabase = createClient();

  const { data } = await supabase.from("user").select("email").match({ email });

  const users = data && data[0];

  if (users && users.email) {
    return { ...prevState, message: "The email already exists." };
  }

  const getCountryCode = await supabase
    .from("country_codes")
    .select("*")
    .match({ country_name });

  if (!getCountryCode.data) {
    return { ...prevState, message: "not found country code" };
  }

  const params = new URLSearchParams({
    email,
    password,
    name,
    nickname,
    country_name,
  }).toString();

  const createUser = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        nickname,
        id_country: getCountryCode.data[0].id,
      },
    },
  });

  if (createUser.error) {
    return {
      ...prevState,
      message: createUser.error.code || createUser.error.message,
    };
  }

  const url = `${ROUTE.EMAIL_VERIFICATION}?${params}`;

  redirect(url);
};

export default signUpActions;
