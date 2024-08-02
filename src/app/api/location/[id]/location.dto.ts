import {
  InfinityScrollInputDto,
  InfinityScrollOutputDto,
} from "@/types/infinite";

export interface LocationDetailInputDto extends InfinityScrollInputDto {
  id?: string;
}

export interface LocationDetailData {
  id_unique: string;
  imageurls: string[];
  name: string;
}

export interface LocationDetailOutputDto extends InfinityScrollOutputDto {
  data: LocationDetailData[];
}
