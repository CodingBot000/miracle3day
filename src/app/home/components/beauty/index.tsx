"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/molecules/card/ProductCard";
import { getAllEventAPI } from "@/app/api/event";
import { ROUTE } from "@/router";
import type { AllEventOutputDto } from "@/app/api/event/event.dto";
import { getHospitalBeautyAPI } from "@/app/api/home/hospital";
import { HospitalBeautyOutputDto } from "@/app/api/home/hospital/beauty/hospital-beauty.dto";
import { HospitalCard } from "@/components/molecules/card/HospitalCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Beauty() {
  const [datas, setDatas] = useState<HospitalBeautyOutputDto["data"]>([]);
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
    <div className="w-full px-4 overflow-x-auto">
      <div className="flex gap-4 w-max">
      {datas ? (
          datas.map(({ imageurls, name, id_unique, location }) => (
            <article key={id_unique} className="w-full px-2 h-full">
              <HospitalCard
                alt={name}
                name={name}
                href={ROUTE.HOSPITAL_DETAIL("") + id_unique}
                src={imageurls[0]}
                locationNum={location}
              />
            </article>
          ))
        ) : (
          Array.from({ length: 6 }).map((_, index) => (
            <article key={index} className="w-full px-2">
              <Skeleton className="w-full h-[200px] rounded-md" />
            </article>
          ))
        )}
      </div>
    </div>
  );
}
