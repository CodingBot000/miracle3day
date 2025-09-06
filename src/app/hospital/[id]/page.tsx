import { getHospitalMainAPI } from "../../api/hospital/[id]/main";
import { redirect } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import { capitalizeWord } from "@/utils/word";
import ScrollTop from "@/components/atoms/ScrollTop";
import HospitalDetailNewDesign from "./components/HospitalDetailNewDesign";

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
  const previousImages = (await parent).openGraph?.images || [];
  
  return {
    title: `${data.hospital_info.name} | Hospital Detail`,
    openGraph: {
      images: [...data.hospital_info.imageurls  || [], ...previousImages],
    },
  };
}

const HospitalDetailPage = async ({
  params,
  searchParams,
}: HospitalDetailPageProps) => {
  const id_uuid_hospital = params?.id;
  console.log(`HospitalDetailPage async params:${params} params.id: ${params?.id}  searchParams:${searchParams}`);

  if (id_uuid_hospital === "undefined") redirect("/");

  const data = await getHospitalMainAPI({ id: id_uuid_hospital });
  
  return (
    <main className="min-h-screen bg-white">
      <ScrollTop />
      <HospitalDetailNewDesign hospitalData={data} />
    </main>
  );
};

export default HospitalDetailPage;
