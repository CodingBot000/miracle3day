import { TCoordinatesType } from "@/components/common/Map";

export interface PositionInputDto {
  id: string;
}

export interface PositionOutputDto {
  position: TCoordinatesType[];
}
