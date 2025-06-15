

import HospitalInfoTab from "./components/tab/HospitalInfoTab";

import { getHospitalMainAPI } from "../../api/hospital/[id]/main";
import FloatingMenu, { FloatItem } from "./components/FloatingMenu";
import { redirect } from "next/navigation";
import PageHeader from "@/components/molecules/PageHeader";
import { FavoriteButton } from "@/components/atoms/favorite/FavoriteButton";

import { HospitalInfoBanner } from "./components/HospitalInfoBanner";

import ScrollTop from "@/components/atoms/ScrollTop";
import { Metadata, ResolvingMetadata } from "next";
import { capitalizeWord } from "@/utils/word";
import { getHospitalInfoAPI } from "@/app/api/hospital/[id]/info";
import HospitalDetailContent from "./components/content";
import dynamic from "next/dynamic";
// import HospitalScrollWrapper from "./hospital-scroll-wrapper";

type Props = {
  params: { id: string };
  searchParams: { tab: string };
};

interface HospitalDetailPageProps extends Props {}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  console.log(`HospitalDetailPage generateMetadata  params:${params} params.id: ${params?.id}  searchParams:${searchParams}`);

  const data = await getHospitalMainAPI({ id: params?.id });
  console.log("qq generateMetadata data", data);
  console.log("qq generateMetadata data.hospital_info", data.hospital_info);
  console.log("qq generateMetadata data.hospital_info.imageurls", data.hospital_info.imageurls);
  console.log("qq generateMetadata data.hospital_info.name", data.hospital_info.name);
  const previousImages = (await parent).openGraph?.images || [];
  // console.log("qq qq getHospitalMainAPI data.imageurls:", data.imageurls);
  // console.log("qq qq getHospitalMainAPI params?.id:", params?.id);
  return {
    title: `${data.hospital_info.name} | ${capitalizeWord(searchParams.tab)}`,
    openGraph: {
      images: [...data.hospital_info.imageurls  || [], ...previousImages],
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
  const hospitalId = params?.id;
  console.log(`HospitalDetailPage async params:${params} params.id: ${params?.id}  searchParams:${searchParams}`);

  if (hospitalId === "undefined") redirect("/");

  
  const data = await getHospitalMainAPI({ id: hospitalId });
  // const infoData = await getHospitalInfoAPI({ id: params?.id });
  // console.log("API 호출 후 전체 데이터:", data);
  // console.log("hospital_details 데이터:", data.hospital_details);
  
  // hospital_details의 첫 번째 요소를 사용
  const hospitalDetails = data.hospital_details || {};
  // console.log("hospital_details 구조:", {
  //   tel: hospitalDetails.tel,
  //   homepage: hospitalDetails.homepage,
  //   kakaotalk: hospitalDetails.kakaotalk,
  //   blog: hospitalDetails.blog,
  //   ticktok: hospitalDetails.ticktok,
  // });
  const currentTab = searchParams.tab || "event";


  const getFloatList = Object.entries(hospitalDetails).reduce<
    FloatItem[]
  >((acc, [key, value]) => {
    if (typeof value === "string" && Boolean(value)) {
      acc.push({ name: key, href: value });
    }

    return acc;
  }, []);
  console.log("qq data", data);
  console.log("qq data.hospital_info", data.hospital_info);
  console.log("qq data.hospital_info.imageurls", data.hospital_info.imageurls);
  console.log("qq data.hospital_info.name", data.hospital_info.name);
  const isFavorite = data?.favorite?.length > 0;
  // console.log("HospitalDetailPage hospitalId:", hospitalId);
  return (
    <main>
      <ScrollTop />
      <PageHeader name={data.hospital_info.name}>
        <FavoriteButton isFavorite={isFavorite} />
      </PageHeader>
      <div>
        <HospitalInfoBanner imageurls={data.hospital_info.imageurls} />
        <div className="max-w-[1024px] mx-auto px-6 mt-4">
          <HospitalDetailContent hospitalId={hospitalId} hospitalData={data} />;
          <FloatingMenu float={getFloatList} />
        </div>
      </div>
    </main>
  );
};

export default HospitalDetailPage;
