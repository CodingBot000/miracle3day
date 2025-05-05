import { getHospitalInfoAPI } from "@/app/api/hospital/[id]/info";
import styles from "./styles/info.module.scss";
import * as React from "react";
import { Map } from "../../../../../components/common/map";
import { HospitalDetailInfoOutDto } from "@/app/api/hospital/[id]/info/info.dto";
import Avatar from "@/components/atoms/avatar";
import { HospitalDetailMainOutput } from "@/app/api/hospital/[id]/main/main.dto";

type TContent = { title: string; content: string };

interface InfoTabProps {
  id: string;
  hospitalData: HospitalDetailMainOutput;
}

const InfoDataList: {
  id: number;
  title: string;
  content: "desc_address" | "desc_openninghour" | "desc_facilities";
}[] = [
  {
    id: 0,
    title: "Address",
    content: "desc_address",
  },
  {
    id: 1,
    title: "Opening Hour",
    content: "desc_openninghour",
  },
  {
    id: 2,
    title: "Facilities",
    content: "desc_facilities",
  },
];

const InfoTab = async ({ id, hospitalData }: InfoTabProps) => {
  // const { data: infoData } = await getHospitalInfoAPI({ id });
  const infoData = hospitalData;
  const infoDetailData = infoData.hospital_details[0] as {
    desc_address: string;
    desc_openninghour: string;
    desc_facilities: string;
    desc_doctors_imgurls: string[];
  };

  const renderContent = ({ title, content }: TContent) => {
    return (
      <div className={styles.content_wrapper}>
        <h2 className={styles.title}>{title}</h2>

        <div className={styles.content}>{content}</div>
      </div>
    );
  };

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

      <div className={styles.content_wrapper}>
        <h2 className={styles.title}>Doctors</h2>

        <div className={styles.avatar}>
          {infoData.hospital_details.map((detailData) => (
            <Avatar
              key={detailData.id_hospital}
              src={detailData.desc_doctors_imgurls[0]}
              alt={"doctor"}
            />
          ))}
        </div>
      </div>

      <Map
        coordinates={[
          {
            title: infoData.name,
            lat: infoData.latitude,
            lng: infoData.longitude,
          },
        ]}
      />
    </>
  );
};

export default InfoTab;
