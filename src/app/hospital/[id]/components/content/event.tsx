"use client";

import React, { useEffect, useState } from "react";

import { EventCard } from "@/components/molecules/card";
import { ROUTE } from "@/router";
import { getHospitalEventAPI } from "@/app/api/hospital/[id]/event";
import { InfinityItemList } from "@/components/template/InfinityItem";
import { daysYMDFormat } from "@/utils/days";
import { HospitalDetailEventOutDto } from "@/app/api/hospital/[id]/event/event.dto";
import { NoData } from "@/components/template/noData";


const HospitalEvent = ({ id }: { id: string }) => {
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
    return <NoData label="No events found"/>;
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {events.map(
        ({ description, imageurls, name, id_unique, date_from, date_to, price }) => (
          <div key={id_unique}>
            <EventCard
              layout="responsive"
              href={ROUTE.EVENT_DETAIL("") + id_unique}
              src={imageurls?.[0]}
              title={name}
              date={`${daysYMDFormat(date_from)} ~ ${daysYMDFormat(date_to)}`}
              price={price}
              desc={description}
              alt={name}
            />
          </div>
        )
      )}
    </div>
  );
};

export default HospitalEvent;


// const HospitalEvent = () => {
//   return (
//     <InfinityItemList
//       grid="2"
//       fetchFn={getHospitalEventAPI}
//       queryKey={"hospital_event"}
//     >
//       {(item) =>
//         item.data.map(
//           ({ description, imageurls, name, id_unique, date_from, date_to }) => {
//             return (
//               <EventCard
//                 key={id_unique}
//                 href={ROUTE.EVENT_DETAIL("") + id_unique}
//                 src={imageurls && imageurls[0]}
//                 title={name}
//                 date={`${daysYMDFormat(date_from)} ~ ${daysYMDFormat(date_to)}`}
//                 desc={description}
//                 alt={name}
//               />
//             );
//           }
//         )
//       }
//     </InfinityItemList>
//   );
// };

// export default HospitalEvent;
