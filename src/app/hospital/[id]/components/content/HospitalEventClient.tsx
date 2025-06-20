"use client";

import React, { useEffect, useState } from "react";
import { EventCard } from "@/components/molecules/card";
import { ROUTE } from "@/router";
import { getHospitalEventAPI } from "@/app/api/hospital/[id]/event";
import { daysYMDFormat } from "@/utils/days";
import { HospitalDetailEventOutDto } from "@/app/api/hospital/[id]/event/event.dto";
import { NoData } from "@/components/template/NoData";
import { ProductCard } from "@/components/molecules/card/ProductCard";

export default function HospitalEventClient({ id }: { id: string }) {
  const [events, setEvents] = useState<HospitalDetailEventOutDto["data"]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getHospitalEventAPI({ id, pageParam: 0 });
        setEvents(res.data);
      } catch (error) {
        console.error("Error HospitalEvent fetching events:", error);
      }
    };
    fetchEvents();
  }, [id]);

  if (!events || events.length === 0) {
    return <NoData label="No events found" />;
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
      {events.map(({ description, imageurls, name, id_unique, date_from, date_to, price, review_count, scrap_count, rating, badges }) => (
        <div key={id_unique}>

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
        </div>
      ))}
    </div>
  );
}
