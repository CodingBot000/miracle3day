import { Map, TCoordinatesType } from "@/components/common/Map";
import PageHeader from "@/components/molecules/header/PageHeader";


interface LocationMapProps {
  position: TCoordinatesType[];
  name: string;
}

export const LocationMap = ({ position, name }: LocationMapProps) => {
  return (
    <>
      <PageHeader name={name} />
      <div className="flex mx-6">
        <Map coordinates={position} />
      </div>
    </>
  );
};
