import { FavoriteItem } from "@/app/api/auth/favorite/favorite.dto";

export interface HospitalDetailMainInputDto {
  id: string;
}

export interface HospitalDetails {
 
  tel: string;
  blog: string;
  ticktok: string;
  youtube: string;
  facebook: string;
  homepage: string;
  snapchat: string;
  instagram: string;
  kakaotalk: string;
  map: string;
 
  desc_address: string;
  desc_openninghour: string;
  desc_facilities: string;
  desc_doctors_imgurls: string[];
  id_hospital: number;
  etc: string;
}

export interface HospitalDetailMainOutput {
  imageurls: string[];
  name: string;
  latitude: number;
  longitude: number;
  hospital_details: HospitalDetails[];
  favorite: FavoriteItem[];
}