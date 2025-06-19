import { AuthUser } from "@supabase/supabase-js";

export interface UserInputDto {
  email: string;
}

export interface UserOutputDto {
  userInfo: UserInfoDto;
}

export interface UserInfoDto {
  auth_user: AuthUser;
  created_at: string;
  nickname: string;
  name: string;
  email: string;
  updated_at: string;
  uuid: string;
  user_no: number;
  id_country: number;
  avatar: string;
  provider: string;
  last_login_at: string;
  birth_date: string;
  gender: string;
  secondary_email: string;
}
