import { EventDetailData } from "@/app/models/eventDetailData.dto";
import { HospitalData } from "@/app/models/hospitalData.dto";
import { SurgeryInfo } from "@/app/models/surgeryInfo.dto";
import {
  InfinityScrollInputDto,
  InfinityScrollOutputDto,
} from "@/types/infinite";

export interface AllEventInputDto extends InfinityScrollInputDto {}

export interface AllEventOutputDto extends InfinityScrollOutputDto {
  data: EventDetailData[];
}
