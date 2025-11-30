"use client";

import { UserOutputDto } from "@/app/api/auth/getUser/getUser.dto";
import LogoutAction from "@/components/molecules/LogoutAction";

interface MyPageClientProps {
  user: UserOutputDto;
}

export default function MyPageClient({ user }: MyPageClientProps) {
  
  return (
    <main className="flex mt-8 justify-center items-center gap-4">
      {/* <div>{user?.user_metadata?.full_name ?? "Unknown User"}</div> */}
      {/* <div>{user?.userInfo?.auth_user?.user_metadata?.full_name ?? "Unknown User"}</div> */}
      <div>{user?.userInfo?.nickname ?? "Unknown User"}</div>
      <div>{user?.userInfo?.name ?? "Unknown User"}</div>
      <div>{user?.userInfo?.email ?? "Unknown User"}</div>
      <div>{user?.userInfo?.created_at ?? "Unknown User"}</div>
      <div>{user?.userInfo?.updated_at ?? "Unknown User"}</div>
      <div>{user?.userInfo?.id_uuid ?? "Unknown User"}</div>
      <div>{user?.userInfo?.user_no ?? "Unknown User"}</div>
      <div>{user?.userInfo?.id_country ?? "Unknown User"}</div>
      <div>{user?.userInfo?.gender ?? "Unknown User"}</div>
      <div>{user?.userInfo?.secondary_email ?? "Unknown User"}</div>
      <div>
        <LogoutAction />
      </div>
    </main>
  );
}
