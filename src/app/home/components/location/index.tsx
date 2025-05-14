import { styles } from "@/app/home/style/homeStyleSet.tailwind";
import Link from "next/link";
import ThumbnailImg from "@/components/molecules/img/thumbnail";
import { getHospitalLocationAPI } from "../../../api/home/hospital";
import { ROUTE } from "@/router";
import { Skeleton } from "@/components/ui/skeleton";
import { HospitalCard } from "@/components/molecules/card";
import { LocationEnum } from "@/constants";

const LocationHospital = async ({ locationNum }: { locationNum?: string }) => {
  const { data } = await getHospitalLocationAPI({ locationNum: locationNum ?? LocationEnum.Apgujung });
  console.log('LocationHospital locationNum:', locationNum);
  return (
    <div className={styles.hospitalCardGridStyle}>
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
