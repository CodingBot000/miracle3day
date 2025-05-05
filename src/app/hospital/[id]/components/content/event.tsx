"use client";

import React from "react";

import { EventCard } from "@/components/molecules/card";
import { ROUTE } from "@/router";
import { getHospitalEventAPI } from "@/app/api/hospital/[id]/event";
import { InfinityItemList } from "@/components/template/InfinityItem";
import { daysYMDFormat } from "@/utils/days";

const HospitalEvent = () => {
  return (
    <InfinityItemList
      grid="2"
      fetchFn={getHospitalEventAPI}
      queryKey={"hospital_event"}
    >
      {(item) =>
        item.data.map(
          ({ description, imageurls, name, id_unique, date_from, date_to }) => {
            return (
              <EventCard
                key={id_unique}
                href={ROUTE.EVENT_DETAIL("") + id_unique}
                src={imageurls && imageurls[0]}
                title={name}
                date={`${daysYMDFormat(date_from)} ~ ${daysYMDFormat(date_to)}`}
                desc={description}
                alt={name}
              />
            );
          }
        )
      }
    </InfinityItemList>
  );
};

export default HospitalEvent;
