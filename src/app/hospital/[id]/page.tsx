import React from "react";

import styles from "./hospital-detail..module.scss";
import HospitalTab from "./components/tab";

import { getHospitalMainAPI } from "../../api/hospital/[id]/main";
import Floating, { FloatItem } from "./components/floating";
import { redirect } from "next/navigation";
import PageHeader from "@/components/molecules/header/page-header";
import { HospitalFavoriteIcon } from "@/components/atoms/favorite";

import { HospitalThumbnail } from "./components/thumbnail";

import ScrollTop from "@/components/atoms/scrollTop";
import { Metadata, ResolvingMetadata } from "next";
import { capitalizeWord } from "@/utils/word";

type Props = {
  params: { id: string };
  searchParams: { tab: string };
};

interface HospitalDetailPageProps extends Props {}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const data = await getHospitalMainAPI({ id: params?.id });

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${data.name} | ${capitalizeWord(searchParams.tab)}`,
    openGraph: {
      images: [...data.imageurls, ...previousImages],
    },
  };
}

const HospitalDetailPage = async ({
  params,
  searchParams,
}: HospitalDetailPageProps) => {
  if (params.id === "undefined") redirect("/");

  const data = await getHospitalMainAPI({ id: params?.id });

  const getFloatList = Object.entries(data.hospital_details).reduce<
    FloatItem[]
  >((acc, [key, value]) => {
    if (typeof value === "string" && Boolean(value)) {
      acc.push({ name: key, href: value });
    }

    return acc;
  }, []);

  const isFavorite = data?.favorite?.length > 0;

  return (
    <main>
      <ScrollTop />
      <PageHeader name={data.name}>
        <HospitalFavoriteIcon isFavorite={isFavorite} />
      </PageHeader>
      <div>
        <HospitalThumbnail imageurls={data.imageurls} />
        <div className={styles.main}>
        {/* tab */}
        <HospitalTab currentTab={searchParams.tab} id={params.id} />

        {/* floating */}
        <Floating float={getFloatList} />
        </div>
      </div>
    </main>
  );
};

export default HospitalDetailPage;
