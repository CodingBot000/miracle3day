export type SNSChannelData = {
  default: string;
  en?: string;
  ja?: string;
  'zh-TW'?: string;
  'zh-CN'?: string;
  ko?: string;
} | null;

export interface FullHospital {
  id: number;
  id_uuid: string;
  name: string;
  name_en: string;
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
  bname: string;
  bname_en: string;
  building_name: string;
  building_name_en: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  address_detail: string;
  address_detail_en: string;
  directions_to_clinic: string;
  directions_to_clinic_en: string;
  location: string;
  imageurls: string[];
  thumbnail_url: string | null;
  created_at: string;
  searchkey: string;
  id_unique: string;
  id_surgeries: string[]; // 수술 ID 배열
  show: boolean;
  search_key: string;
  id_uuid_admin: string;
  favorite_count: number;
}

// 목록 전용
export interface HospitalData {
  created_at: string;
  name: string;
  name_en: string;
  searchkey: string | null;
  latitude: number;
  longitude: number;
  thumbnail_url: string | null;
  imageurls: string[];
  id_surgeries: string[] | null;
  id_unique: number;
  id_uuid: string;
  location: string;
  address_full_road_en: string;
  address_full_jibun_en: string;
  show: boolean;
}


// 상세 전용
export type HospitalDetail = Pick<
  FullHospital,
  | 'id_uuid'
  | 'name'
  | 'name_en'
  | 'address_full_road'
  | 'address_full_jibun'
  | 'address_si'
  | 'address_gu'
  | 'address_dong'
  | 'address_full_road_en'
  // ... 필요한 상세 필드 추가
>;
// export interface HospitalData {
//     // name: string;
//     // imageurls: string[];
//     // id_unique: string;
//     // id_uuid: string;
//     // location: string   
//     id: number;
//     created_at: string; // ISO 날짜 문자열
//     name: string;
//     name_en: string;
//     searchkey: string;
//     latitude: number;
//     longitude: number;
//     imageurls: string[]; // 이미지 URL 배열
    // id_surgeries: string[]; // 수술 ID 배열
    // id_unique: number;
    // id_uuid: string;
    // location: string;
    
//   }

  export interface HospitalDetailInfoInputDto {
    id: string;
  }
 
  export type HospitalInfo = Pick<
  FullHospital,
  | 'created_at'
  | 'name'
  | 'name_en'
  | 'searchkey'
  | 'latitude'
  | 'longitude'
  | 'imageurls'
  | 'id_surgeries'
  | 'id_unique'
  | 'location'
  | 'id'
  | 'show'
  | 'search_key'
  | 'id_uuid'
  | 'address_full_road'
  | 'address_full_road_en'
  | 'address_full_jibun'
  | 'address_full_jibun_en'
  | 'address_si'
  | 'address_si_en'
  | 'address_gu'
  | 'address_gu_en'
  | 'address_dong'
  | 'address_dong_en'
  | 'zipcode'
  | 'address_detail'
  | 'address_detail_en'
  | 'directions_to_clinic'
  | 'directions_to_clinic_en'
  | 'id_uuid_admin'
  | 'thumbnail_url'
  | 'favorite_count'
>  & {
  hospital_details: HospitalDetailInfo;
};

  // export interface HospitalInfo {
  //   created_at: string;
  //   name: string;
  //   name_en: string;
  //   searchkey: string;
  //   latitude: number;
  //   longitude: number;
  //   imageurls: string[];
  //   id_surgeries: number;
  //   id_unique: number;
  //   location: string;
  //   id: number;
  //   show: number;
  //   search_key: string;
  //   id_uuid: string;
  //   address_full_road: string;
  //   address_full_road_en: string;
  //   address_full_jibun: string;
  //   address_full_jibun_en: string;
  //   address_si: string;
  //   address_si_en: string;
  //   address_gu: string;
  //   address_gu_en: string;
  //   address_dong: string;
  //   address_dong_en: string;
  //   zipcode: string;
  //   address_detail: string;
  //   address_detail_en: string;
  //   directions_to_clinic: string;
  //   directions_to_clinic_en: string;
  //   id_uuid_admin: string,
  //   thumbnail_url: string,
  //   hospital_details: HospitalDetailInfo;
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
    kakao_talk: SNSChannelData;
    line: SNSChannelData;
    we_chat: SNSChannelData;
    whats_app: SNSChannelData;
    telegram: SNSChannelData;
    facebook_messenger: SNSChannelData;
    instagram: SNSChannelData;
    tiktok: SNSChannelData;
    youtube: SNSChannelData;
    other_channel: string;
    sns_content_agreement: number;
    available_languages: string[];
    introduction: string;
    introduction_en: string;

  }
  export interface HospitalDetailInfoOutDto {
    data: HospitalInfo;
  }

  
  export interface HospitalOutputDto {
    data: HospitalData[];
    total: number;
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
    name_en: string;
    bio: string;
    bio_en: string;
    image_url: string;
    chief: number;
    display_order: number;
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
