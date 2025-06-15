import { HospitalData } from "@/app/models/hospitalData.dto";
import { SurgeryInfo } from "@/app/models/surgeryInfo.dto";

// export interface SurgeryInfo {
//   id: number;
//   created_at: string;
//   type: string;
//   name: string;
//   imageurls: string[];
//   description: string;
//   id_unique?: number;
// }

// export interface HospitalData {
//   id: number;
//   created_at: string; // ISO 날짜 문자열
//   name: string;
//   searchkey: string;
//   latitude: number;
//   longitude: number;
//   imageurls: string[]; // 이미지 URL 배열
//   id_surgeries: string[]; // 수술 ID 배열
//   id_unique: number;
//   location: string;
// }
export interface EventDataListInputDto {
  // param1: string;
  // param2: string;
  // param3: string;
  // param4: string;
  main: string;
  depth1: string;
  depth2: string;
  depth3: string;
}

export interface EventData {
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
  rating: number;
  review_count: number;
  scrap_count: number;
  badges: string[];
}

export interface EventDataListOutputDto  {
  data: EventData[];
}
