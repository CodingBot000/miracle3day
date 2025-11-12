import {
    InfinityScrollOutputDto,
    InfinityScrollInputDto,
  } from "@/types/infinite";
import { HospitalData } from "./hospitalData.dto";
import { UserInfoDto } from "../api/auth/getUser/getUser.dto";
  
  export interface HospitalDetailReviewInputDto extends InfinityScrollInputDto {
    id: string;
  }
  
  export interface ReviewData {
    id: number;
    created_at: string;
    id_event: number;
    id_hospital: number;
    id_surgeries: string[]; // Assuming the array contains strings, adjust if different
    reviewimageurls: string[]; // Assuming the array contains strings, adjust if different
    description: string;
    id_unique: number;
    user_no: number | null;
    search_key: string;
    id_uuid_hospital: string;
  }

  export interface ReviewDataWithMember {
    member: UserInfoDto | null;
    review: ReviewData;
  }

  export interface HospitalDetailReviewOutDto  extends InfinityScrollOutputDto {
    data: {
      hospitalData: HospitalData | null;
      reviewsWithMember: ReviewDataWithMember[];
    };
    nextCursor: boolean;
  }
  // export interface HospitalDetailReviewOutDto extends InfinityScrollOutputDto {
  //   data: ReviewResponseData;
  // }

  // Google Maps 리뷰 관련 DTO
  export interface ReviewDataFromGoogleMap {
    rating: number | null;
    publishTime: string | null;
    authorAttribution: {
      displayName?: string;
      photoUri?: string;
      uri?: string;
    } | null;
    sourceLanguage: string | null;
    text: {
      text: string;
      languageCode: string | null;
    };
  }

  export interface GooglePlaceReviewsResponse {
    id: string | null;
    name: string | null;
    address: string | null;
    rating: number | null;
    userRatingCount: number;
    targetLang: string;
    reviews: ReviewDataFromGoogleMap[];
  }
  