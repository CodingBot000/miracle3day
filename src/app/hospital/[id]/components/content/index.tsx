'use client';

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import HospitalDetailPageTab from "../tab/HospitalDetailPageTab";
import { HospitalDetailMainOutput } from "@/app/api/hospital/[id]/main/main.dto";
import ReservationClient from "./ReservationClient";
import { ROUTE } from "@/router";
import { useRouter } from "next/navigation";

const InfoTab = dynamic(() => import("./info"));
// const EventTab = dynamic(() => import("./event"));
const EventTab = dynamic(() => import("./HospitalEventWrapper"));
const ReviewTab = dynamic(() => import("./ReviewWrapper"));

interface DetailPageTabProps {
    hospitalData: HospitalDetailMainOutput;
}

export default function HospitalDetailContent({ hospitalData } : DetailPageTabProps) {
  const router = useRouter();

  const tabRefs = {
    event: useRef<HTMLDivElement>(null),
    review: useRef<HTMLDivElement>(null),
    info: useRef<HTMLDivElement>(null),
  };
  const id_uuid_hospital = hospitalData.hospital_info.id_uuid;
  // 하단 예약 정보 바 상태
  const [reservationInfo, setReservationInfo] = useState<{date: string, time: string} | null>(null);
  const [showBottomBar, setShowBottomBar] = useState(false);

  // 예약 정보 받는 콜백
  const handleReservation = (date: string, time: string) => {
    setReservationInfo({ date, time });
    setShowBottomBar(true);
  };

  // 하단바 닫기
  const handleCloseBottomBar = () => setShowBottomBar(false);
  const handleReservationClick = () => {
    router.push(ROUTE.RESERVATION(id_uuid_hospital));
  };
  return (
    <>
        {/* /* PageHeader의 실제 높이 : min-height: 55px padding: 12px 24px (상하 12px) */ }
        <div className="sticky top-[4.9375rem] z-[11] bg-white">
          <HospitalDetailPageTab tabRefs={tabRefs} />
        </div>
        <div className="mt-12" ref={tabRefs.event}><EventTab id={id_uuid_hospital} /></div>
        <div className="mt-12" ref={tabRefs.review}><ReviewTab id={id_uuid_hospital} /></div>
        <div className="mt-12" ref={tabRefs.review}>
          <ReservationClient id={id_uuid_hospital} onReservation={handleReservation} />
        </div>
        <div className="mt-12" ref={tabRefs.info}><InfoTab hospitalData={hospitalData} /></div>

        {/* 하단 예약 정보 바 */}
        <div
          className={`fixed left-0 right-0 bottom-0 z-[10000] flex justify-center pointer-events-none select-none
            transition-transform duration-500 ${showBottomBar ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ willChange: 'transform' }}
        >
          {reservationInfo && (
            <div className="w-full max-w-2xl mx-auto bg-white shadow-xl rounded-t-xl flex items-center px-6 py-4 mb-0 pointer-events-auto select-auto border-t border-gray-200 relative">
              <div className="flex-1 text-base font-medium text-gray-800">
                {reservationInfo.date} {reservationInfo.time}
              </div>
              <button 
              className="ml-4 px-6 py-2 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition"
              onClick={handleReservationClick}
              >
                RESERVE
                </button>
              <button
                className="ml-2 text-gray-400 hover:text-gray-700 text-2xl font-bold absolute right-4 top-1/2 -translate-y-1/2"
                onClick={handleCloseBottomBar}
                aria-label="Close reservation bar"
              >
                ×
              </button>
            </div>
          )}
        </div>
    </>
  );
}
