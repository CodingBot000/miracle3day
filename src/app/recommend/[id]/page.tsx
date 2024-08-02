import { capitalizeWord } from "@/utils/word";
import { ResolvingMetadata, Metadata } from "next";
import { RecommendTab } from "./tab";
import { getSurgeriesEventAPI } from "@/app/api/surgeries/[id]/event";
import { getSurgeriesHospitalAPI } from "@/app/api/surgeries/[id]/hospital";
import { getSurgeriesReviewAPI } from "@/app/api/surgeries/[id]/review";

interface Props {
  params: { id: string };
  searchParams: { tab: string };
}

export async function generateMetadata(
  { searchParams, params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const event = await getSurgeriesEventAPI({ id: params.id, pageParam: 0 });
  const reviews = await getSurgeriesReviewAPI({ id: params.id, pageParam: 0 });
  const hospital = await getSurgeriesHospitalAPI({
    id: params.id,
    pageParam: 0,
  });

  const defaultImg =
    "https://tqyarvckzieoraneohvv.supabase.co/storage/v1/object/public/images/hospitalimg/hospital1.png";

  const ogImage: Record<string, Metadata> = {
    event: {
      description: event.data[0]?.description || "Event",
      openGraph: {
        images: event.data[0]?.imageurls[0] || defaultImg,
      },
    },
    reviews: {
      description: reviews.data[0]?.description || "Reviews",
      openGraph: {
        images: reviews.data[0].reviewimageurls[0] || defaultImg,
      },
    },
    hospital: {
      description: hospital.data[0]?.name || "Hospital",
      openGraph: {
        images: hospital.data[0].imageurls[0] || defaultImg,
      },
    },
  };

  return {
    title: `Recommend | ${capitalizeWord(searchParams.tab)}`,
    ...ogImage[searchParams.tab],
  };
}

const RecommendDetailPage = ({ searchParams }: Props) => {
  const currentTab = searchParams.tab;

  return (
    <main>
      <RecommendTab currentTab={currentTab} />
    </main>
  );
};

export default RecommendDetailPage;
