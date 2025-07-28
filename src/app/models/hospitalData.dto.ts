export interface HospitalData {
    // name: string;
    // imageurls: string[];
    // id_unique: string;
    // id_uuid: string;
    // location: string   
    id: number;
    created_at: string; // ISO 날짜 문자열
    name: string;
    searchkey: string;
    latitude: number;
    longitude: number;
    imageurls: string[]; // 이미지 URL 배열
    id_surgeries: string[]; // 수술 ID 배열
    id_unique: number;
    id_uuid: string;
    location: string;
    
  }

  export interface HospitalDetailInfoInputDto {
    id: string;
  }
 
  export interface HospitalInfo {
    created_at: string;
    name: string;
    searchkey: string;
    latitude: number;
    longitude: number;
    imageurls: string[];
    id_surgeries: number;
    id_unique: number;
    location: string;
    id: number;
    show: number;
    search_key: string;
    id_uuid: string;
    address_full_road: string;
    address_full_road_en: string;
    address_full_jibun: string;
    address_full_jibun_en: string;
    address_si: string;
    address_si_en: string;
    address_gu: string;
    address_gu_en: string;
    address_dong: string;
    address_dong_en: string;
    zipcode: string;
    address_detail: string;
    address_detail_en: string;
    directions_to_clinic: string;
    directions_to_clinic_en: string;
    id_uuid_admin: string,
    thumbnail_url: string,
    hospital_details: HospitalDetailInfo;
  }
  // export interface HospitalInfo {
  //   id_unique: number;
  //   name: string;
  //   latitude: number;
  //   longitude: number;
  //   hospital_details: HospitalDetailInfo;
  // }
  
  // export interface HospitalDetailInfo {
  //   map: string;
  //   tel: string;
  //   desc_address: string;
  //   desc_openninghour: string;
  //   desc_facilities: string;
  //   desc_doctors_imgurls: string[];
  //   id_hospital: number;
  //   etc: string;
  // }
  
  
           
  export interface HospitalDetailInfo {
    id: number;
    created_at: string;
    tel: string;
    map: string;
    id_hospital: number;
    etc: string;
    id_uuid_hospital: string;
    has_private_recovery_room: number;
    has_parking: number;
    has_cctv: number;
    has_night_counseling: number;
    has_female_doctor: number;
    has_anesthesiologist: number;
    specialist_count: number;
    email: string;
    kakao_talk: string;
    line: string;
    we_chat: string;
    whats_app: string;
    telegram: string;
    facebook_messenger: string;
    instagram: string;
    tiktok: string;
    youtube: string;
    other_channel: string;
    sns_content_agreement: number;
    available_language: string[];
    introuction: string;
    introuction_en: string;

  }
  export interface HospitalDetailInfoOutDto {
    data: HospitalInfo;
  }

  
  export interface HospitalOutputDto {
    data: HospitalData[];
  }
  
  export interface HospitalByLocationInputDto {
    locationNum: string;
  }

export interface BusinessHourData {
    day_of_week: string;
    open_time: string | null;
    close_time: string | null;
    status: 'open' | 'closed' | 'ask';
  }
  
  export interface DoctorData {
    name: string;
    bio: string;
    image_url: string;
    chief: number;
  }
  
  export type HospitalAddress = {
    address_full_road: string;
    address_full_road_en?: string;
    address_full_jibun: string;
    address_full_jibun_en?: string;
    address_si: string;
    address_si_en?: string;
    address_gu: string;
    address_gu_en?: string;
    address_dong: string;
    address_dong_en?: string;
    zipcode: string;
    latitude?: number;
    longitude?: number;
    address_detail?: string;
    address_detail_en?: string;
    directions_to_clinic?: string;
    directions_to_clinic_en?: string;
  }; 