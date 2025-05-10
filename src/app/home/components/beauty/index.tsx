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
      <div
        className="
          grid 
          gap-4 
          mx-4 
          grid-cols-[repeat(auto-fill,minmax(150px,1fr))]
          md:grid-cols-3 
          md:gap-6 
          md:mx-auto 
          md:max-w-[1024px] 
          md:grid-rows-2 
          md:h-auto
        "
      >
        {data ? (
          data.map(({ imageurls, name, id_unique, location }) => (
            <article key={id_unique} className="w-full px-[10px]">
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
            <article key={index} className="w-full px-[10px]">
              <Skeleton className="w-full h-[200px] rounded-md" />
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Beauty;
