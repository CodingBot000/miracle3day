import { TABLE_MEMBERS } from "@/constants/tables";
import { UserOutputDto } from "./getUser.dto";
import { createClient } from "@/utils/supabase/server";

export const getUserAPI = async (): Promise<UserOutputDto | null> => {
  const supabase = createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }
  console.log("getUserAPI authUser.id:", authUser.id);

  const { data: member, error } = await supabase
  .from(TABLE_MEMBERS)
  .select("*")
  .eq("uuid", authUser.id)
  .single();


  console.log("getUserAPI member:", JSON.stringify(member, null, 2));
  console.log("getUserAPI authUser:", JSON.stringify(authUser, null, 2));
  // console.log("getUserAPI error:", error);
  const userInfo = {
    auth_user: authUser,
    ...member,
  };

  if (!userInfo.auth_user) {
    return null;
  }

  return {
    userInfo: userInfo,
  };
};
