import { Map, TCoordinatesType } from "@/components/common/map";
import PageHeader from "@/components/molecules/header/page-header";

import styles from "./location-map.module.scss";

interface LocationMapProps {
  position: TCoordinatesType[];
  name: string;
}

export const LocationMap = ({ position, name }: LocationMapProps) => {
  return (
    <>
      <PageHeader name={name} />
      <div className={styles.map}>
        <Map coordinates={position} />
      </div>
    </>
  );
};
