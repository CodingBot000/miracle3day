import { TCoordinatesType } from "@/components/common/Map";
import {
  InfinityScrollInputDto,
  InfinityScrollOutputDto,
} from "@/types/infinite";

export interface SurgeriesHospitalInputDto extends InfinityScrollInputDto {
  id?: string;
}

export interface SurgeriesHospitalData {
  id: number;
  created_at: string; // ISO 날짜 문자열
  name: string;
  searchkey: string;
  latitude: number;
  longitude: number;
  imageurls: string[];
  id_surgeries: number[];
  id_unique: number;
  location: string;
}

export interface SurgeriesHospitalOutputDto extends InfinityScrollOutputDto {
  data: SurgeriesHospitalData[];
  position: TCoordinatesType[];
}
