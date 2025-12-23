export interface ReservationInputDto {
    date?: string;
    time?: string;
 
  id_uuid?: string;
  id_user?: string;
  id_uuid_hospital: string;
  name: string;
  english_name?: string;
  passport_name?: string;
  nationality?: string;
  gender?: 'male' | 'female' | 'other';
  birth_date?: string;
  email?: string;
  phone: string;
  phone_korea?: string;
  preferred_date: string;
  preferred_time: string;
  visitor_count?: number;
  reservation_headcount?: number;
  treatment_experience?: string;
  area_to_improve?: string;
  consultation_request?: string;
  additional_info?: string;
  preferred_languages?: string[];
  status_code?: number;
  created_at?: string;
}

export interface ReservationOutputDto {
  data: ReservationInputDto[];
}

export interface ReservationResponseDto {
  data: ReservationInputDto | null;
  status: number;
  statusText: string;
}
