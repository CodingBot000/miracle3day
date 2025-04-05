import Link from "next/link";
import ThumbnailImg from "@/components/molecules/img/thumbnail";
import { getHospitalLocationAPI } from "../../../api/home/hospital";
import { ROUTE } from "@/router";

const LocationHospital = async ({ locationNum }: { locationNum: string }) => {
  const { data } = await getHospitalLocationAPI({ locationNum });

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 mx-4 md:grid-cols-3 md:gap-6 md:mx-auto md:max-w-[1024px]">
      {data.map(({ imageurls, name, id_unique }) => (
        <article key={id_unique} className="md:w-full md:px-2">
          <Link href={ROUTE.HOSPITAL_DETAIL("") + id_unique}>
            <ThumbnailImg src={imageurls[0]} alt={name} />
          </Link>
        </article>
      ))}
    </div>
  );
};

export default LocationHospital;
