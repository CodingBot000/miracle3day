"use client";

import { useEffect, useMemo, useState } from "react";
import { ROUTE } from "@/router";
import { getHospitalBeautyAPI } from "@/app/api/home/hospital";
import { HospitalOutputDto } from "@/app/models/hospitalData.dto";
import { HospitalCard } from "@/components/molecules/card/HospitalCard";

export default function Beauty() {
  const [datas, setDatas] = useState<HospitalOutputDto["data"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHospitalBeautyAPI();
        const sanitized = (data?.data ?? []).filter(
          (item) => item && typeof item.id_uuid === "string"
        );
        setDatas(sanitized);
        console.log("landing clinics count", sanitized.length);
      } catch (error) {
        console.error("Failed to fetch featured clinics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const clinics = useMemo(() => (datas ?? []).slice(0, 4), [datas]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 px-4 py-10 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-48 animate-pulse rounded-xl border border-white/40 bg-white/40 backdrop-blur-sm"
          />
        ))}
      </div>
    );
  }

  if (!clinics || clinics.length === 0) {
    console.warn("Beauty component: No hospital data available");
    return null;
  }

  return (
    <div className="w-full px-4">
      {/* Desktop: 4 columns, Mobile: 2x2 grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {clinics.map(({ thumbnail_url, imageurls, name_en, id_uuid, location, searchkey }) => {
          const hasValidImage =
            Array.isArray(imageurls) &&
            imageurls.length > 0 &&
            typeof imageurls[0] === "string" &&
            imageurls[0].length > 0;

          const imageSrc = hasValidImage
            ? imageurls[0]
            : "/hospital/hospitalimg/hospital_default.png";

          return (
            <article key={id_uuid} className="w-full">
              <HospitalCard
                alt={name_en}
                name={name_en}
                href={ROUTE.HOSPITAL_DETAIL("") + id_uuid}
                src={thumbnail_url ? thumbnail_url : "/hospital/hospitalimg/hospital_default.png"}
                searchKey={searchkey}
                locationNum={
                  typeof location === "string"
                    ? location
                    : typeof location === "number"
                      ? String(location)
                      : undefined
                }
              />
            </article>
          );
        })}
      </div>
    </div>
  );
}
