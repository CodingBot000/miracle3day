
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
import { getHospitalInfoAPI } from "@/app/api/hospital/[id]/info";
import HospitalDetailContent from "./components/content";
import dynamic from "next/dynamic";
import HospitalScrollWrapper from "./hospital-scroll-wrapper";

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

// const InfoTab = dynamic(() => import("./components/tab/info"));
// const EventTab = dynamic(() => import("./components/tab/event"));
// const ReviewTab = dynamic(() => import("./components/tab/review"));


const HospitalDetailPage = async ({
  params,
  searchParams,
}: HospitalDetailPageProps) => {
  if (params.id === "undefined") redirect("/");

  console.log("API 호출 전 params.id:", params.id);
  const data = await getHospitalMainAPI({ id: params?.id });
  // const infoData = await getHospitalInfoAPI({ id: params?.id });
  console.log("API 호출 후 전체 데이터:", data);
  console.log("hospital_details 데이터:", data.hospital_details);
  
  // hospital_details의 첫 번째 요소를 사용
  const hospitalDetails = data.hospital_details[0] || {};
  console.log("hospital_details 구조:", {
    tel: hospitalDetails.tel,
    homepage: hospitalDetails.homepage,
    kakaotalk: hospitalDetails.kakaotalk,
    blog: hospitalDetails.blog,
    ticktok: hospitalDetails.ticktok,
  });
  const currentTab = searchParams.tab || "event";


  const getFloatList = Object.entries(hospitalDetails).reduce<
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
          <HospitalScrollWrapper hospitalData={data} />;
          <Floating float={getFloatList} />
        </div>
      </div>
    </main>
  );
};

export default HospitalDetailPage;
