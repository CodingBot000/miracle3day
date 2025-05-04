export interface HospitalBeautyData {
  name: string;
  imageurls: string[];
  id_unique: string;
  location: string   
}

export interface HospitalBeautyOutputDto {
  data: HospitalBeautyData[];
}
