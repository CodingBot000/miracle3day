import { EventDetailData } from "@/models/eventDetailData.dto";
import { HospitalData } from "@/models/hospitalData.dto";
import { SurgeryInfo } from "@/models/surgeryInfo.dto";
import {
  InfinityScrollInputDto,
  InfinityScrollOutputDto,
} from "@/types/infinite";

export interface AllEventInputDto extends InfinityScrollInputDto {}

export interface AllEventOutputDto extends InfinityScrollOutputDto {
  data: EventDetailData[];
}
