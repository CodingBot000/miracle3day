export const dynamic = "force-dynamic";

import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import { getUserAPI } from "@/app/api/auth/getUser";
import { notFound } from "next/navigation";
import MyPageSkeleton from "./MyPageSkeleton";
import MyPageMyIntroOther from "./MyPageMyIntroOther";

// const MyPageClient = dynamicImport(() => import("./MyPageClient"), {
//   ssr: false,
// });

const MyPageIntro = dynamicImport(() => import("./MyPageIntro"), {
  ssr: false,
});

const MyPageMyInfo = dynamicImport(() => import("./MyPageMyInfo"), {
  ssr: false,
});


export default async function MyPage() {
  const users = await getUserAPI();

  if (!users?.userInfo.auth_user) notFound();

  return (
    <SuspenseWrapper fallback={<MyPageSkeleton />}>
      {/* <MyPageClient user={users} /> */}
      <MyPageIntro user={users}/>
      <MyPageMyInfo user={users}/>
      <MyPageMyIntroOther user={users}/>
    </SuspenseWrapper>
  );
}
