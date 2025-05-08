import {
  InfinityScrollInputDto,
  InfinityScrollOutputDto,
} from "@/types/infinite";

export interface SurgeriesEventInputDto extends InfinityScrollInputDto {
  id: string;
}

export interface SurgeriesData {
  id: number;
  created_at: string;
  date_from: string;
  date_to: string;
  id_hospital: number;
  name: string;
  imageurls: string[];
  image_desc_urls: string[];
  id_surgeries: number[];
  description: string;
  id_unique: number;
  price: number[];
}

export interface SurgeriesEventOutputDto extends InfinityScrollOutputDto {
  data: SurgeriesData[];
}
