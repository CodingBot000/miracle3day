import Link from "next/link";

import styles from "./home.module.scss";

import { Chip } from "@/components/atoms/chip";
import { location } from "@/constants";
import { ROUTE } from "@/router";
import { getBannerAPI } from "@/app/api/home/banner";

import Beauty from "./components/beauty";

import LocationHospital from "./components/location";
import { Banner } from "@/components/organism/layout/banner";
import { clsx } from "clsx";

export default async function Home({
  searchParams: { locationNum },
}: {
  searchParams: { locationNum: string };
}) {
  const bannerItem = await getBannerAPI();

  const renderLocalChip = () => {
    return (
      <>
      <div className={styles.location_wrapper}>
        {location.map((name, i) => {
          const selectChipStyle =
            (locationNum === undefined && i === 0) || +locationNum === i;

          return (
            <Link
              className={clsx({
                [styles.select_chip]: selectChipStyle,
              })}
              key={name}
              href={`/home?locationNum=${i}`}
              scroll={false}
            >
              <Chip>{name}</Chip>
            </Link>
          );
        })}
        
      </div>
      <br />
      <div className={styles.align_right}>
        <Link
            href={ROUTE.LOCATION_DETAIL("") + location[+locationNum || 0]}
            scroll={true}
          >
            {/* <Chip>{"See All"}</Chip> */}
            See All
          </Link>
          </div>
          <br />
      </>
    );
  };

  return (
    <main>
      <Banner bannerItem={bannerItem.data} />

      <section className={styles.section}>
        {/* Beauty */}
        <div className={styles.text_wrapper}>
          <h2 className={styles.title}>New Beauty</h2>
          <p>Make Attraction</p>
        </div>

        <Beauty />
      </section>

      {/* LocationHospital */}
      <section className={styles.section}>
        <div className={styles.text_wrapper}>
          <h2 className={styles.title}>Hospitals</h2>
          <p>Choose the region u want</p>
        </div>
        {renderLocalChip()}
        <LocationHospital locationNum={locationNum} />
      </section>
    </main>
  );
}
