import * as React from "react";
import { HospitalDetailMainOutput } from "@/app/api/hospital/[id]/main/main.dto";
import { NoData } from "@/components/template/NoData";
import { MapComponent } from "@/components/common/MapComponent";
import Character from "@/components/common/Character";

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
  const infoDetailData = hospitalData.hospital_details[0] as {
    desc_address: string;
    desc_openninghour: string;
    desc_facilities: string;
    desc_doctors_imgurls: string[];
  };

  const renderContent = ({ title, content }: TContent) => (
    <div className="my-4">
      <h2 className="font-bold text-[0.8rem]">{title}</h2>
      <div className="text-[0.8rem] leading-[1.3rem] indent-4 whitespace-pre-wrap break-keep my-4">
        {content}
      </div>
    </div>
  );

  if (!InfoDataList.length) {
    return <NoData label="No info data found" />;
  }

  return (
    <>
      {InfoDataList.map(({ id, title, content }) => (
        <React.Fragment key={id}>
          {renderContent({
            title,
            content: infoDetailData[content],
          })}
        </React.Fragment>
      ))}

      <div className="my-4">
        <h2 className="font-bold text-[0.8rem]">Doctors</h2>
        <div className="my-4 flex gap-2">
          {hospitalData.hospital_details.flatMap((detailData) =>
            (detailData.desc_doctors_imgurls.length > 0
              ? detailData.desc_doctors_imgurls
              : ["/default/doctor_default.png"]
            ).map((imgUrl, index) => (
              <Character
                key={`${detailData.id_hospital}-${index}`}
                src={imgUrl}
                alt="doctor"
              />
            ))
          )}
        </div>
      </div>

      <MapComponent
        coordinates={[
          {
            title: hospitalData.name,
            lat: hospitalData.latitude,
            lng: hospitalData.longitude,
          },
        ]}
      />
    </>
  );
};

export default InfoTab;
