import {
  InfinityScrollOutputDto,
  InfinityScrollInputDto,
} from "@/types/infinite";

export interface HospitalDetailEventInputDto extends InfinityScrollInputDto {
  id: string;
}

export interface HospitalDetailEventData {
  id: number;
  created_at: string;
  date_from: string;
  date_to: string;
  id_hospital: number;
  name: string;
  imageurls: string[];
  image_desc_urls: string[];
  id_surgeries: string[];
  description: string;
  id_unique: number;
  price: number[];
}

export interface HospitalDetailEventOutDto extends InfinityScrollOutputDto {
  data: HospitalDetailEventData[];
}
