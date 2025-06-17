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
  console.log('auth signUp params:', { email, password, name, nickname, nation });
  const supabase = createClient();

  const { data: existingUser } = await supabase
    .from("user")
    .select("email")
    .match({ email })
    .single();
    console.log('auth signUp params:', { email, password, name, nickname, nation });
  if (existingUser) {
    throw new Error("already exists email");
  }

  const { data: countryCode } = await supabase
    .from("country_codes")
    .select("*")
    .match({ country_name: nation })
    .single();

  if (!countryCode) {
    throw new Error("country code not found");
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
  console.log(`auth signUp error message:  ${error?.message} 
    code:${error?.code} 
     cause:${error?.cause} 
      status:${error?.status} 
      name:${error?.name} 
      `);
  if (error) {
    throw new Error(`sign up error: ${error.message}`);
  }
} 