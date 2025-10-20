import { TABLE_MEMBERS } from "@/constants/tables";
import { UserOutputDto } from "./getUser.dto";
import { createClient } from "@/utils/session/server";

export const getUserAPI = async (): Promise<UserOutputDto | null> => {
  const backendClient = createClient();

  const {
    data: { user: authUser },
  } = await backendClient.auth.getUser();

  if (!authUser) {
    return null;
  }
  console.log("getUserAPI authUser.id:", authUser.id);

  const { data: member, error } = await backendClient
  .from(TABLE_MEMBERS)
  .select("*")
  .eq("uuid", authUser.id)
  .single();

  console.log("getUserAPI member:", JSON.stringify(member, null, 2));
  console.log("getUserAPI authUser:", JSON.stringify(authUser, null, 2));
  
  if (error) {
    console.error("getUserAPI error:", error);
    return null;
  }
  
  const userInfo = {
    auth_user: authUser,
    ...member,
  };

  return {
    userInfo: userInfo,
  };
};
