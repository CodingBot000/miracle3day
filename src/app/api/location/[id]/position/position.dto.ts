import { TCoordinatesType } from "@/components/common/MapComponent";

export interface PositionInputDto {
  id: string;
}

export interface PositionOutputDto {
  position: TCoordinatesType[];
}
