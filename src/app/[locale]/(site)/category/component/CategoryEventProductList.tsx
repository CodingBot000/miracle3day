
"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/molecules/card/ProductCard";
// import { AllEventData, AllEventOutputDto } from "@/app/api/event/event.dto";
// TODO: 아래 함수는 실제 API로 대체
// import { getEventByCategoryAPI } from "@/app/api/event/[...slug]"; // param1~4로 호출하는 함수 필요
// import { EventData, EventDataListOutputDto } from "../api/event/[...slug]/event.dto";
import { NoData } from "@/components/template/NoData";
import { getAllEventAPI } from "@/app/api/event";
import { getHospitalEventAPI } from "@/app/api/hospital/[id]/event";
import { HospitalDetailEventOutDto } from "@/app/api/hospital/[id]/event/event.dto";

interface Props {
  main: string; // skin | surgery
  depth1: string; // 1뎁스
  depth2: string; // 2뎁스
  depth3: string; // 3뎁스
  index: string; // 3뎁스 인덱스
}


// export default function CategoryEventProductList({
//   params,
//   searchParams
// }: {
//   params: { main: string; depth1: string; depth2: string; depth3: string; index: string };
//   searchParams: { [key: string]: string | string[] | undefined };
// }) {
export default function CategoryEventProductList({ main, depth1, depth2, depth3, index }: Props) {
  const [loading, setLoading] = useState(true);
  // const [list, setList] = useState<EventData[]>([]);
  const [list, setList] = useState<HospitalDetailEventOutDto["data"]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    setLoading(true);
    setError(null);

    getHospitalEventAPI({ id: index, pageParam: 0 })
      .then((res: HospitalDetailEventOutDto) => {
        setList(res.data || []);
        setLoading(false);
      })
      .catch(e => {
        setError("데이터를 불러오지 못했습니다.");
        setLoading(false);
      });
  }, [index]);


  if (loading) return <div className="text-center text-sm py-8">Loading...</div>;
  if (error) return <div className="text-center text-red-400 py-8">{error}</div>;
  if (!list.length) return <NoData />;

  return (
    <div className="
     w-full max-w-5xl mx-auto px-2
      grid
      grid-cols-[repeat(auto-fit,minmax(120px,1fr))]
      gap-2
    ">
      {list.map((item) => (
        <ProductCard
          key={item.id_uuid_hospital}
          href={`/event/${item.id_uuid_hospital}`}
          src={item.imageurls && item.imageurls[0]}
          productName={item.name}
          dateFrom={item.date_from}
          dateTo={item.date_to}
          desc={item.description}
          alt={item.name}
          price={item.price}
          reviewCount={item.review_count}
          scrapCount={item.scrap_count}
          rating={item.rating}
          badges={item.badges}
        />
      ))}
    </div>
  );
}
// export const dynamic = "force-dynamic";
// export default function CategoryPage() {
//   return <div>Category Page</div>;
// }