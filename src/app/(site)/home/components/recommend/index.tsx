"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/molecules/card/ProductCard";
import { getAllEventAPI } from "@/app/api/event";
import { ROUTE } from "@/router";
import type { AllEventOutputDto } from "@/app/api/event/event.dto";

export default function RecommendEventList() {
  const [events, setEvents] = useState<AllEventOutputDto["data"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEventAPI({ pageParam: 1 });
        setEvents(data.data);
      } catch (error) {
        console.error("Failed to fetch RecommendEventList :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div className="text-center py-10">Loading events...</div>;

  return (
    <div className="w-full px-4 overflow-x-auto">
      <div className="flex gap-4 w-max">
        {events.map(
          ({
            description,
            imageurls,
            name,
            id_unique,
            date_from,
            date_to,
            price,
            review_count,
            scrap_count,
            rating,
            badges,
          }) => (
            <ProductCard
              key={id_unique}
              href={ROUTE.EVENT_DETAIL("") + id_unique}
              src={imageurls?.[0]}
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
          )
        )}
      </div>
    </div>
  );
}
