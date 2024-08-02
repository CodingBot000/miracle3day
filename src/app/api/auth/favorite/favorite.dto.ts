import { InfinityScrollOutputDto } from "@/types/infinite";
import { LocationDetailData } from "../../location/[id]/location.dto";

export interface GetFavoriteInputDto {
  id_hospital?: string;
}

export interface PostFavoriteInputDto {
  id_hospital: string;
  uuid: string;
}

export interface DeleteFavoriteInputDto {
  id_hospital: string;
  uuid: string;
}

export interface FavoriteItem {
  id: number;
  created_at: string;
  user_no: number;
  id_hospital: number;
  hospital: LocationDetailData;
}

export interface GetFavoriteOutputDto extends InfinityScrollOutputDto {
  favorite: FavoriteItem[];
}
