"use client";

import { getLocationDetailAPI } from "@/app/api/location/[id]";
import { HospitalCard } from "@/components/molecules/card";
import { InfinityItemList } from "@/components/template/InfinityItem";
import { ROUTE } from "@/router";

import styles from "./item-list.module.scss";

export const ItemList = () => {
  return (
    <InfinityItemList
      className={styles.grid}
      fetchFn={getLocationDetailAPI}
      queryKey={"surgeries_reviews"}
    >
      {(item) => {
        return (
          <>
            {item.data.map(({ id_unique, imageurls, name }) => {
              return (
                <HospitalCard
                  key={id_unique}
                  src={imageurls[0]}
                  alt={name}
                  name={name}
                  href={ROUTE.HOSPITAL_DETAIL("") + id_unique}
                />
              );
            })}
          </>
        );
      }}
    </InfinityItemList>
  );
};
