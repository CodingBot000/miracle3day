
import { MapComponent, TCoordinatesType } from "@/components/common/MapComponent";
import PageHeader from "@/components/molecules/PageHeader";

interface LocationMapProps {
  position: TCoordinatesType[];
  name: string;
}

export const LocationMap = ({ position, name }: LocationMapProps) => {
  return (
    <>
      <PageHeader name={name} />
      <div className="flex mx-6">
        <MapComponent coordinates={position} />
      </div>
    </>
  );
};
