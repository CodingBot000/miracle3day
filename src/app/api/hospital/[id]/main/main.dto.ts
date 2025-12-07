import { FavoriteItem } from "@/app/api/auth/favorite/favorite.dto";
import { BusinessHourData, DoctorData, HospitalDetailInfo, HospitalInfo } from "@/models/hospitalData.dto";
import { TreatmentData } from "@/models/treatmentData.dto";

export interface HospitalDetailMainInputDto {
  id: string;
}

// export interface HospitalDetails {
//   id_uuid_hospital: string;
//   tel: string;
//   // blog: string;
//   // ticktok: string;
//   // youtube: string;
//   // facebook: string;
//   // homepage: string;
//   // snapchat: string;
//   // instagram: string;
//   // kakaotalk: string;
//   map: string;
 
//   // desc_address: string;
//   // desc_openninghour: string;
//   // desc_facilities: string;
//   // desc_doctors_imgurls: string[];
//   id_hospital: number;
//   etc: string;
// }

export interface HospitalDetailMainOutput {
  // imageurls: string[];
  // name: string;
  // latitude: number;
  // longitude: number;
  hospital_info: HospitalInfo;
  hospital_details: HospitalDetailInfo;
  doctors: DoctorData[];
  favorite: FavoriteItem[];
  business_hours: BusinessHourData[];
  treatments: TreatmentData[];
}