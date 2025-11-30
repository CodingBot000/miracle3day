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
      <Separator />
      {/* 병원 기본 정보 */}
      <div className="my-4">
        <h2 className="font-bold text-[0.8rem]">Hospital Info</h2>
        <div className="text-[0.8rem] leading-[1.3rem] indent-4 whitespace-pre-wrap break-keep my-4">
          <p>Hospital Name: {infoData.name}</p>
          <p>Road Address: {infoData.address_full_road}</p>
          <p>Lot Address: {infoData.address_full_jibun}</p>
          {infoData.address_detail && <p>Detail Address: {infoData.address_detail}</p>}
          {infoData.directions_to_clinic && <p>Directions: {infoData.directions_to_clinic}</p>}
        </div>
      </div>

      <Separator />

      {/* 영업시간 */}
      <div className="my-2">
        <h2 className="font-bold text-[0.8rem]">Business Hours</h2>
        <div className="max-w-md text-[0.8rem] leading-[1.3rem] indent-4 whitespace-pre-wrap break-keep my-2">
          {business_hours.map((hour, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className={"w-20"}>
                {hour.day_of_week}
              </span>
              <span className="flex-1">
                {hour.open_time && hour.close_time 
                  ? <span className={`${hour.status === 'closed' ? 'text-gray-400' : 'text-gray-500'}`}>{`${hour.open_time} - ${hour.close_time}`}</span>
                  : <span className="text-red-500">Closed</span>}
              </span>
              <span className={`text-sm ${hour.status === 'closed' ? 'text-red-500' : 'text-gray-500'}`}>
                {hour.status === 'open' ? 'Open' : 
                 hour.status === 'closed' ? 'Closed' : 'Contact'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* 시설 정보 */}
      <div className="my-4">
        <h2 className="font-bold text-[0.8rem]">Facilities</h2>
        <div className="text-[0.8rem] leading-[1.3rem] indent-4 whitespace-pre-wrap break-keep my-4">
          <div className="flex flex-wrap gap-2">
            {infoDetailData.has_private_recovery_room === 1 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">Private Recovery Room</span>
            )}
            {infoDetailData.has_parking === 1 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">Parking</span>
            )}
            {infoDetailData.has_cctv === 1 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">CCTV</span>
            )}
            {infoDetailData.has_night_counseling === 1 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">Night Consultation</span>
            )}
            {infoDetailData.has_female_doctor === 1 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">Female Doctor</span>
            )}
            {infoDetailData.has_anesthesiologist === 1 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">Anesthesiologist</span>
            )}
            {infoDetailData.specialist_count > 0 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {infoDetailData.specialist_count} Specialist(s)
              </span>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* 의사 정보 */}
      <div className="my-4">
        <h2 className="font-bold text-[0.8rem]">Doctors</h2>
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
                    {doctor.chief === 1 ? 'Representative clinic director' : 'Clinic director'}
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
