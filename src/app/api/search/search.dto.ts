// export interface SearchItem {
//   id: number;
//   id_unique: number;
//   created_at: Date;
//   name: string;
//   imageurls: string[];
//   location: string;
//   id_surgeries: string[];

// import { EventDetailData } from "../event/[id]/event.dto";
import { EventDetailData } from "@/models/eventDetailData.dto";
import { HospitalData } from "@/models/hospitalData.dto";
// import { ReviewData } from "../hospital/[id]/review/review";
import { ReviewData } from "@/models/reviewData.dto";
 
// }
export interface SearchItem {
  hospitals: HospitalData[];
  events: EventDetailData[];
  reviews: ReviewData[];
}


export interface SearchOutputDto {
  data: SearchItem;
}
