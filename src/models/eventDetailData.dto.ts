import { HospitalData } from "./hospitalData.dto";
import { SurgeryInfo } from "./surgeryInfo.dto";

export interface EventDetailData {
    hospitalData: HospitalData;
    id: number;
    created_at: string;
    date_from: string;
    date_to: string;
    id_hospital: number;
    name: string;
    imageurls: string[];
    image_desc_urls: string[];
    id_surgeries: SurgeryInfo[];
    description: string;
    id_unique: number;
    price: number[];
    search_key: string;
    rating: number;
    review_count: number;
    scrap_count: number;
    badges: string[];
    id_uuid_hospital: string;
  }

  export interface EventDetailInputDto {
    id: string;
  }
  
  export interface EventDetailOutput {
    data: EventDetailData[];
  }
