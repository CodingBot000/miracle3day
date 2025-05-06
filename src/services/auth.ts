import { createClient } from "@/utils/supabase/server";

type SignUpParams = {
  email: string;
  password: string;
  name: string;
  nickname: string;
  nation: string;
};

export async function signUp({
  email,
  password,
  name,
  nickname,
  nation,
}: SignUpParams) {
  const supabase = createClient();

  const { data: existingUser } = await supabase
    .from("user")
    .select("email")
    .match({ email })
    .single();

  if (existingUser) {
    throw new Error("이미 존재하는 이메일입니다.");
  }

  const { data: countryCode } = await supabase
    .from("country_codes")
    .select("*")
    .match({ country_name: nation })
    .single();

  if (!countryCode) {
    throw new Error("국가 코드를 찾을 수 없습니다.");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        nickname,
        id_country: countryCode.id,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }
} 