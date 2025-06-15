"use client";

import { getLocationDetailAPI } from "@/app/api/location/[id]";
import { HospitalCard } from "@/components/molecules/card";
import { InfinityItemList } from "@/components/template/InfinityItemList";
import { ROUTE } from "@/router";

import styles from "./item-list.module.scss";

export const ItemList = ({ id }: { id: string }) => {
  return (
    <InfinityItemList
      className={styles.grid}
      fetchFn={getLocationDetailAPI}
      id={id}
      queryKey={"surgeries_reviews"}
    >
      {(item) => {
        return (
          <>
            {item.data.map(({ id_unique, imageurls, name, id_uuid }) => {
              return (
                <HospitalCard
                  key={id_uuid}
                  src={imageurls[0]}
                  alt={name}
                  name={name}
                  href={ROUTE.HOSPITAL_DETAIL("") + id_uuid}
                />
              );
            })}
          </>
        );
      }}
    </InfinityItemList>
  );
};
