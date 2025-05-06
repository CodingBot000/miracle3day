import styles from "./location.module.css";
import Link from "next/link";
import ThumbnailImg from "@/components/molecules/img/thumbnail";
import { getHospitalLocationAPI } from "../../../api/home/hospital";
import { ROUTE } from "@/router";
import { Skeleton } from "@/components/ui/skeleton";
import { HospitalCard } from "@/components/molecules/card";

const LocationHospital = async ({ locationNum }: { locationNum?: string }) => {
  const { data } = await getHospitalLocationAPI({ locationNum: locationNum ?? "0" });

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 mx-4 md:grid-cols-3 md:gap-6 md:mx-auto md:max-w-[1024px]">
      {data ? (
        data.map(({ imageurls, name, id_unique }) => (
          <article key={id_unique} className="md:w-full md:px-2">
            <HospitalCard
              alt={name}
              name={name}
              href={ROUTE.HOSPITAL_DETAIL("") + id_unique}
              src={imageurls[0]}
              locationNum={locationNum}
            />
          </article>
        ))
      ) : (
        // 로딩 중일 때 표시할 Skeleton
        Array.from({ length: 6 }).map((_, index) => (
          <article key={index} className="md:w-full md:px-2">
            <Skeleton className="w-full h-[200px] rounded-md" />
          </article>
        ))
      )}
    </div>
  );
};

export default LocationHospital;
