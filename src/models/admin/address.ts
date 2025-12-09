/**
 * Hospital address structure
 * Used to store complete address information for clinics
 */
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
  bname: string;
  bname_en?: string;
  building_name: string;
  building_name_en?: string;
  zipcode: string;
  latitude?: number;
  longitude?: number;
  address_detail?: string;
  address_detail_en?: string;
  directions_to_clinic?: string;
  directions_to_clinic_en?: string;
};

/**
 * Daum Postcode API response data structure
 * Used when receiving address data from Daum address search API
 */
export type DaumAddressData = {
  address: string;
  addressEnglish: string;
  addressType: string;
  roadAddress: string;
  roadAddressEnglish: string;
  jibunAddress: string;
  jibunAddressEnglish: string;
  sido: string;
  sidoEnglish: string;
  sigungu: string;
  sigunguEnglish: string;
  bname: string;
  bnameEnglish: string;
  buildingName: string;
  buildingNameEnglish: string;
  zonecode: string;
}; 