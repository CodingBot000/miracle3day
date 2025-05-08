import {
  InfinityScrollInputDto,
  InfinityScrollOutputDto,
} from "@/types/infinite";

export interface AllEventInputDto extends InfinityScrollInputDto {}

export interface SurgeryInfo {
  id: number;
  created_at: string;
  type: string;
  name: string;
  imageurls: string[];
  description: string;
  id_unique?: number;
}

export interface HospitalData {
  id: number;
  created_at: string; // ISO 날짜 문자열
  name: string;
  searchkey: string;
  latitude: number;
  longitude: number;
  imageurls: string[]; // 이미지 URL 배열
  id_surgeries: number[]; // 수술 ID 배열
  id_unique: number;
  location: string;
}

export interface AllEventData {
  id: number;
  created_at: string;
  date_from: string;
  date_to: string;
  id_hospital: HospitalData;
  name: string;
  imageurls: string[];
  image_desc_urls: string[];
  id_surgeries: SurgeryInfo[];
  description: string;
  id_unique: number;
  price: number[];
}

export interface AllEventOutputDto extends InfinityScrollOutputDto {
  data: AllEventData[];
}
