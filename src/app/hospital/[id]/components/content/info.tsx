import * as React from "react";
import { HospitalDetailMainOutput } from "@/app/api/hospital/[id]/main/main.dto";
import { NoData } from "@/components/template/NoData";
import { MapComponent } from "@/components/common/MapComponent";
import Character from "@/components/common/Character";
import { Separator } from "@/components/ui/separator";

type TContent = { title: string; content: string };

interface InfoTabProps {
  hospitalData: HospitalDetailMainOutput;
}

const InfoDataList = [
  { id: 0, title: "Address", content: "desc_address" },
  { id: 1, title: "Opening Hour", content: "desc_openninghour" },
  { id: 2, title: "Facilities", content: "desc_facilities" },
] as const;

const InfoTab = async ({ hospitalData }: InfoTabProps) => {
  const infoData = hospitalData.hospital_info;
  const infoDetailData = hospitalData.hospital_details;
  const infoDoctors = hospitalData.doctors;
  const business_hours = hospitalData.business_hours;
  const treatments = hospitalData.treatments;

  const renderContent = ({ title, content }: TContent) => (
    <div className="my-4">
      <h2 className="font-bold text-[0.8rem]">{title}</h2>
      <div className="text-[0.8rem] leading-[1.3rem] indent-4 whitespace-pre-wrap break-keep my-4">
        {content}
      </div>
    </div>
  );

  if (!infoData.name) {
    return <NoData label="No info data found" />;
  }

  return (
    <>
      {/* 병원 기본 정보 */}
      <div className="my-4">
        <h2 className="font-bold text-[0.8rem]">병원 정보</h2>
        <div className="text-[0.8rem] leading-[1.3rem] indent-4 whitespace-pre-wrap break-keep my-4">
          <p>병원명: {infoData.name}</p>
          <p>도로명 주소: {infoData.address_full_road}</p>
          <p>지번 주소: {infoData.address_full_jibun}</p>
          {infoData.address_detail && <p>상세 주소: {infoData.address_detail}</p>}
          {infoData.directions_to_clinic && <p>찾아오는 길: {infoData.directions_to_clinic}</p>}
        </div>
      </div>

      <Separator />

      {/* 영업시간 */}
      <div className="my-4">
        <h2 className="font-bold text-[0.8rem]">영업시간</h2>
        <div className="text-[0.8rem] leading-[1.3rem] indent-4 whitespace-pre-wrap break-keep my-4">
          {business_hours.map((hour, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="w-20">{hour.day_of_week}</span>
              <span className="flex-1">
                {hour.open_time && hour.close_time 
                  ? `${hour.open_time} - ${hour.close_time}`
                  : '휴진'}
              </span>
              <span className="text-sm text-gray-500">
                {hour.status === 'open' ? '진료중' : 
                 hour.status === 'closed' ? '휴진' : '문의'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* 시설 정보 */}
      <div className="my-4">
        <h2 className="font-bold text-[0.8rem]">시설 정보</h2>
        <div className="text-[0.8rem] leading-[1.3rem] indent-4 whitespace-pre-wrap break-keep my-4">
          <div className="flex flex-wrap gap-2">
            {infoDetailData.has_private_recovery_room === 1 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">개인 회복실</span>
            )}
            {infoDetailData.has_parking === 1 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">주차장</span>
            )}
            {infoDetailData.has_cctv === 1 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">CCTV</span>
            )}
            {infoDetailData.has_night_counseling === 1 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">야간 상담</span>
            )}
            {infoDetailData.has_female_doctor === 1 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">여성 의사</span>
            )}
            {infoDetailData.has_anesthesiologist === 1 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">마취 전문의</span>
            )}
            {infoDetailData.specialist_count > 0 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                전문의 {infoDetailData.specialist_count}명
              </span>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* 의사 정보 */}
      <div className="my-4">
        <h2 className="font-bold text-[0.8rem]">의료진</h2>
        <div className="my-4 space-y-4">
          {infoDoctors.map((doctor, index) => (
            <div key={index} className="flex gap-4">
              <Character
                src={doctor.image_url}
                alt="doctor"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-[0.8rem] font-medium">{doctor.name}</h4>
                  <span className="text-[0.7rem] text-gray-500">
                    {doctor.chief === 1 ? '대표원장' : '의사'}
                  </span>
                </div>
                <p className="text-[0.7rem] text-gray-600">{doctor.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MapComponent
        coordinates={[
          {
            latitude: infoData.latitude,
            longitude: infoData.longitude,
          },
        ]}
        // name={infoData.name}
        // address={infoData.address_full_road}
        // markers={[
        //   {
        //     position: {
        //       lat: infoData.latitude,
        //       lng: infoData.longitude,
        //     },
        //     content: infoData.name,
        //   },
        // ]}
      />
    </>
  );
};

export default InfoTab;
