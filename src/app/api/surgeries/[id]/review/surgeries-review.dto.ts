import { TCoordinatesType } from "@/components/common/map";
import {
  InfinityScrollInputDto,
  InfinityScrollOutputDto,
} from "@/types/infinite";

export interface SurgeriesReviewInputDto extends InfinityScrollInputDto {
  id?: string;
}

export interface SurgeriesReviewData {
  id: number;
  created_at: string; // ISO 날짜 문자열
  id_event: number;
  id_hospital: number;
  id_surgeries: number[];
  reviewimageurls: string[];
  description: string;
  id_unique: number;
  user_no: number | null;
}

export interface SurgeriesReviewOutputDto extends InfinityScrollOutputDto {
  data: SurgeriesReviewData[];
  position: TCoordinatesType[];
}
