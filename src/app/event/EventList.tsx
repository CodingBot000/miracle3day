"use client";

import { EventCard } from "@/components/molecules/card";
import { InfinityItemList } from "@/components/template/InfinityItemList";
import { ROUTE } from "@/router";
import { daysYMDFormat } from "@/utils/days";
import { getAllEventAPI } from "@/app/api/event";

import styles from "./event.module.scss";
import { ProductCard } from "@/components/molecules/card/ProductCard";

const EventList  = () => {
  return (
    <div className="w-full max-w-[1024px] mx-auto px-4">
    <InfinityItemList
      grid="4"
      fetchFn={getAllEventAPI}
      queryKey={"event_all"}
      className="mx-4"
    >
      {(item) =>
        item.data.map(
          ({ description, imageurls, name, id_unique, date_from, date_to, price, review_count, scrap_count, rating, badges }) => {
            return (
              // <EventCard
              //   key={id_unique}
              //   href={ROUTE.EVENT_DETAIL("") + id_unique}
              //   src={imageurls && imageurls[0]}
              //   title={name}
              //   dateFrom={date_from}
              //   dateTo={date_to}
              //   desc={description}
              //   alt={name}
              //   price={price}
              // />
              <ProductCard
                key={id_unique}
                href={ROUTE.EVENT_DETAIL("") + id_unique}
                src={imageurls && imageurls[0]}
                productName={name}
                dateFrom={date_from}
                dateTo={date_to}
                desc={description}
                alt={name}
                price={price}
                reviewCount={review_count}
                scrapCount={scrap_count}
                rating={rating}
                badges={badges}
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
