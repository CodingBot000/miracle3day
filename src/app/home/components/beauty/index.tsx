"use client";

import { useEffect, useState } from "react";
import { ROUTE } from "@/router";
import { getHospitalBeautyAPI } from "@/app/api/home/hospital";
import { HospitalOutputDto } from "@/app/models/hospitalData.dto";
import { HospitalCard } from "@/components/molecules/card/HospitalCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Beauty() {
  const [datas, setDatas] = useState<HospitalOutputDto["data"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHospitalBeautyAPI();
        setDatas(data.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10">Loading New Beaties...</div>;

  return (
    <div className="w-full px-4">
      {/* Desktop: 4 columns, Mobile: 2x2 grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {datas ? (
          datas.slice(0, 4).map(({ imageurls, name, id_uuid, location }) => (
            <article key={id_uuid} className="w-full">
              <HospitalCard
                alt={name}
                name={name}
                href={ROUTE.HOSPITAL_DETAIL("") + id_uuid}
                src={imageurls[0]}
                locationNum={location}
              />
            </article>
          ))
        ) : (
          Array.from({ length: 4 }).map((_, index) => (
            <article key={index} className="w-full">
              <Skeleton className="w-full h-[280px] rounded-xl" />
            </article>
          ))
        )}
      </div>
    </div>
  );
}
