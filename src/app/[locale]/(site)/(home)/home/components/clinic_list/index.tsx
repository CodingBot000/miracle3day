"use client";

import { log } from '@/utils/logger';


import { useEffect, useMemo, useState } from "react";
import { ROUTE } from "@/router";
import { getHospitalBeautyAPI } from "@/app/api/home/hospital";
import { HospitalOutputDto } from "@/models/hospitalData.dto";
import { HospitalCard } from "@/components/molecules/card/HospitalCard";

export default function ClinicListForHome() {
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
        log.debug("landing clinics count", sanitized.length);
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
      <div className="w-full px-4">
        <div className="w-full max-w-[480px] xl:max-w-none mx-auto">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="w-full animate-pulse"
              >
                {/* 이미지 영역 스켈레톤 */}
                <div className="aspect-[4/3] w-full bg-gray-200 rounded-xl mb-3" />

                {/* 텍스트 영역 스켈레톤 */}
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!clinics || clinics.length === 0) {
    console.warn("Beauty component: No hospital data available");
    return null;
  }

  return (
    <div className="w-full px-4">
      {/* Desktop: 4 columns (xl: 1024px+), Mobile: 2x2 grid with max 480px container */}
      <div className="w-full max-w-[480px] xl:max-w-none mx-auto">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {clinics.map(({ thumbnail_url, imageurls, name_en, id_uuid, location }) => {
            return (
              <article key={id_uuid} className="w-full">
                <HospitalCard
                  alt={name_en}
                  name={name_en}
                  href={ROUTE.HOSPITAL_DETAIL("") + id_uuid}
                  src={thumbnail_url ? thumbnail_url : "/hospital/hospitalimg/hospital_default.png"}
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
    </div>
  );
}
