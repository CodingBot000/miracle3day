// import { LocationMap } from "../components/map";
import { getPositionAPI } from "@/app/api/location/[id]/position";
import { Metadata, ResolvingMetadata } from "next";
// import { ItemList } from "./components/itemList";
import { capitalizeWord } from "@/utils/word";

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `Procedure | ${capitalizeWord(params.id)}`,
    openGraph: {
      images: [...previousImages],
    },
  };
}
  
interface ProcedureDetailPageProps {
  params: {
    id: string;
  };
}

const ProcedureDetailPage = async ({
  params: { id },
}: ProcedureDetailPageProps) => {
//   const data = await getPositionAPI({ id });

  return (
    <main>
        <p>{id}</p>
      {/* <LocationMap name={id.toUpperCase()} position={data.position} />
      <ItemList /> */}
    </main>
  );
};

export default ProcedureDetailPage;
