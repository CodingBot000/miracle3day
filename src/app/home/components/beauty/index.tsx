import styles from "./beauty.module.css";
import Link from "next/link";
import ThumbnailImg from "@/components/molecules/img/thumbnail";
import { getHospitalBeautyAPI } from "../../../api/home/hospital";
import { ROUTE } from "@/router";
import { Skeleton } from "@/components/ui/skeleton";
import { HospitalCard } from "@/components/molecules/card";

const Beauty = async () => {
  const { data } = await getHospitalBeautyAPI();

  return (
    <div className="w-full">
  
      <div className={styles.article_wrapper}>
        {data ? (
          data.map(({ imageurls, name, id_unique, location }) => (
            <article key={id_unique}>
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
          // 로딩 중일 때 표시할 Skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <article key={index} className="w-full">
              <Skeleton className="w-full h-[200px] rounded-md" />
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Beauty;
