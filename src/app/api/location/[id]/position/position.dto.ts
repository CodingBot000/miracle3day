import { TCoordinatesType } from "@/components/common/map";

export interface PositionInputDto {
  id: string;
}

export interface PositionOutputDto {
  position: TCoordinatesType[];
}
