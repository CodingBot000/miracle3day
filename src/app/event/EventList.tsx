"use client";

import { EventCard } from "@/components/molecules/card";
import { InfinityItemList } from "@/components/template/InfinityItem";
import { ROUTE } from "@/router";
import { daysYMDFormat } from "@/utils/days";
import { getAllEventAPI } from "@/app/api/event";

import styles from "./event.module.scss";

const EventList  = () => {
  return (
    <div className="w-full max-w-[1024px] mx-auto px-4">
    <InfinityItemList
      grid="4"
      fetchFn={getAllEventAPI}
      queryKey={"event_all"}
      className={styles.wrapper}
    >
      {(item) =>
        item.data.map(
          ({ description, imageurls, name, id_unique, date_from, date_to, price }) => {
            return (
              <EventCard
                key={id_unique}
                href={ROUTE.EVENT_DETAIL("") + id_unique}
                src={imageurls && imageurls[0]}
                title={name}
                dateFrom={date_from}
                dateTo={date_to}
                desc={description}
                alt={name}
                price={price}
              />
            );
          }
        )
      }
    </InfinityItemList>
    </div>
  );
};

export default EventList;
