import { getHospitalBeautyAPI } from "../../../api/home/hospital";
import { ROUTE } from "@/router";
import { Skeleton } from "@/components/ui/skeleton";
import { HospitalCard } from "@/components/molecules/card";
import { styles } from "@/app/home/style/homeStyleSet.tailwind";
const Beauty = async () => {
  const { data } = await getHospitalBeautyAPI();

  return (
    <div className="w-full">
      <div className={styles.hospitalCardGridStyle}>
        {data ? (
          data.map(({ imageurls, name, id_unique, location }) => (
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
};

export default Beauty;
