export const dynamic = "force-dynamic";

import { Metadata } from "next";
import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import AboutUsSkeleton from "./AboutUsSkeleton";

export const metadata: Metadata = {
  title: "BeautyLink | AboutUs",
};

const AboutUsClient = dynamicImport(() => import("./AboutUsClient"), {
  ssr: false,
});

export default function AboutUsPage() {
  return (
    <SuspenseWrapper fallback={<AboutUsSkeleton />}>
      <AboutUsClient />
    </SuspenseWrapper>
  );
}
