import styles from "./beauty.module.css";
import Link from "next/link";
import ThumbnailImg from "@/components/molecules/img/thumbnail";
import { getHospitalBeautyAPI } from "../../../api/home/hospital";
import { ROUTE } from "@/router";

const Beauty = async () => {
  const { data } = await getHospitalBeautyAPI();

  return (
    <div className={styles.article_wrapper}>
      {data.map(({ imageurls, name, id_unique }) => (
        <article key={id_unique}>
          <Link href={ROUTE.HOSPITAL_DETAIL("") + id_unique}>
            <ThumbnailImg src={imageurls[0]} alt={name} />
          </Link>
        </article>
      ))}
    </div>
  );
};

export default Beauty;
