import { TABLE_MEMBERS } from "@/constants/tables";
import { UserOutputDto } from "./getUser.dto";
import { createClient } from "@/utils/supabase/client";
import { useUserStore } from "@/stores/useUserStore";

export const getUserAPI = async (): Promise<UserOutputDto | null> => {
  const supabase = createClient();
  
  // 먼저 세션을 확인하고 새로고침
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log("getUserAPI client session:", session);
  console.log("getUserAPI client sessionError:", sessionError);
  
  if (!session) {
    console.log("getUserAPI: No session found");
    return null;
  }
  
  // 세션이 있으면 사용자 정보 가져오기
  const {
    data: { user: authUser },
    error: userError
  } = await supabase.auth.getUser();
  
  console.log("getUserAPI clientauthUser 1:", authUser);
  console.log("getUserAPI clientauthUser 2:", JSON.stringify(authUser, null, 2));
  console.log("getUserAPI client userError:", userError);
  
  if (!authUser || userError) {
    console.log("getUserAPI: No auth user found or error occurred");
    return null;
  }
  
  console.log("getUserAPI client authUser valid");
  const { data: member, error } = await supabase
  .from(TABLE_MEMBERS)
  .select("*")
  .eq("uuid", authUser.id)
  .single();


  console.log("getUserAPI client member:", JSON.stringify(member, null, 2));
  console.log("getUserAPI client authUser:", JSON.stringify(authUser, null, 2));
  // console.log("getUserAPI error:", error);
  const userInfo = {
    auth_user: authUser,
    ...member,
  };

  useUserStore.getState().clearUser();
  
  if (!userInfo.auth_user) {
    return null;
  }

  useUserStore.getState().setUser({
    ...userInfo,
  });

  return {
    userInfo: userInfo,
  };
};
