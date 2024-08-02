import { User } from "@supabase/supabase-js";

export interface UserInputDto {
  email: string;
}

export interface UserOutputDto {
  user: User;
}
