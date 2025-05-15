export const dynamic = "force-dynamic";

import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import { getUserAPI } from "@/app/api/auth/getUser";
import { notFound } from "next/navigation";
import MyPageSkeleton from "./MyPageSkeleton";

const MyPageClient = dynamicImport(() => import("./MyPageClient"), {
  ssr: false,
});

export default async function MyPage() {
  const users = await getUserAPI();

  if (!users) notFound();

  return (
    <SuspenseWrapper fallback={<MyPageSkeleton />}>
      <MyPageClient user={users.user} />
    </SuspenseWrapper>
  );
}
