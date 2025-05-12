export const dynamic = "force-dynamic";

import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import HomeSkeleton from "./HomeSkeleton";

const HomeClient = dynamicImport(() => import("./HomeClient"), {
  ssr: false,
});

import { getBannerAPI } from "@/app/api/home/banner";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { locationNum: string };
}) {
  const bannerItem = await getBannerAPI();

  return (
    <SuspenseWrapper fallback={<HomeSkeleton />}>
      <HomeClient bannerItem={bannerItem} searchParams={searchParams} />
    </SuspenseWrapper>
  );
}
