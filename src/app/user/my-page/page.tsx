export const dynamic = "force-dynamic";

import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import { notFound } from "next/navigation";
import MyPageSkeleton from "./MyPageSkeleton";
import { getUserInfo } from "@/app/api/auth/getUser/user.service";

const MyPageMyInfo = dynamicImport(() => import("./MyPageMyInfo"), {
  ssr: false,
});

export default async function MyPage() {
  const users = await getUserInfo();

  if (!users?.userInfo?.auth_user) {
    notFound();
  }

  return (
    <SuspenseWrapper fallback={<MyPageSkeleton />}>
      <MyPageMyInfo user={users}/>
    </SuspenseWrapper>
  );
}
