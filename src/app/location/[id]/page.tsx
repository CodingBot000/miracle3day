import { LocationMap } from "../components/map";
import { getPositionAPI } from "@/app/api/location/[id]/position";
import { Metadata, ResolvingMetadata } from "next";
import { ItemList } from "./components/itemList";
import { capitalizeWord } from "@/utils/word";

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `Location | ${capitalizeWord(params.id)}`,
    openGraph: {
      images: [...previousImages],
    },
  };
}
  
interface LocationDetailPageProps {
  params: {
    id: string;
  };
}

const LocationDetailPage = async ({
  params: { id },
}: LocationDetailPageProps) => {
  const data = await getPositionAPI({ id });

  return (
    <main>
      <LocationMap name={id.toUpperCase()} position={data.position} />
      <ItemList id={id} />
    </main>
  );
};

export default LocationDetailPage;
