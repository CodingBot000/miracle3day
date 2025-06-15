"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getHospitalLocationAPI } from "@/app/api/home/hospital";
import { HospitalCard } from "@/components/molecules/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTE } from "@/router";
import { LocationEnum, LOCATIONS } from "@/constants";
import { styles } from "../style/homeStyleSet.tailwind";

export default function LocationHospitalClient() {
    const [locationParam, setLocationParam] = useState<LocationEnum | null>(null);
    const [data, setData] = useState<any[] | null>(null);
    const searchParams = useSearchParams();
  
    //  useSearchParams는  useEffect 안에서 실행
    useEffect(() => {
      const param = searchParams.get("locationNum");
      if (param && LOCATIONS.includes(param as LocationEnum)) {
        setLocationParam(param as LocationEnum);
      } else {
        setLocationParam(LocationEnum.Apgujung);
      }
    }, [searchParams]);
  
    useEffect(() => {
      if (!locationParam) return;
      const fetch = async () => {
        const res = await getHospitalLocationAPI({ locationNum: locationParam });
        setData(res.data);
      };
      fetch();
    }, [locationParam]);
  
    if (locationParam === null) {
      return (
        <div className="text-center my-10">
          <Skeleton className="w-full h-[200px] rounded-md" />
        </div>
      );
    }
  

  return (
    <div className={styles.hospitalCardGridStyle}>
      {data
        ? data.map(({ imageurls, name, id_unique, id_uuid }) => (
            <article key={id_uuid} className="w-full px-2">
              <HospitalCard
                alt={name}
                name={name}
                href={ROUTE.HOSPITAL_DETAIL("") + id_uuid}
                src={imageurls[0]}
                locationNum={locationParam}
              />
            </article>
          ))
        : Array.from({ length: 6 }).map((_, index) => (
            <article key={index} className="w-full px-2">
              <Skeleton className="w-full h-[200px] rounded-md" />
            </article>
          ))}
    </div>
  );
}
