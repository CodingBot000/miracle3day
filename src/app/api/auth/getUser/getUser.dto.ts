export interface AuthUserLike {
  id: string;
  email?: string | null;
  [key: string]: unknown;
}

export interface UserInputDto {
  email: string;
}

export interface UserOutputDto {
  userInfo: UserInfoDto | null;
}

export interface UserInfoDto {
  auth_user: AuthUserLike | null;
  created_at: string;
  nickname: string;
  name: string;
  email: string;
  updated_at: string;
  uuid: string;
  user_no: number;
  id_country: string;
  avatar: string;
  provider: string;
  last_login_at: string;
  birth_date: string;
  gender: string;
  secondary_email: string;
}
