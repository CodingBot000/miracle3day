export const dynamic = "force-dynamic";

import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import MyPageSkeleton from "./FavoriteSkeleton";

const FavoriteClient = dynamicImport(() => import("./FavoriteClient"), {
  ssr: false,
});

export default function MyPage() {
  return (
    <SuspenseWrapper fallback={<MyPageSkeleton />}>
      <FavoriteClient />
    </SuspenseWrapper>
  );
}
