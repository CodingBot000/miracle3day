"use client";

import React, { useEffect, useState } from "react";
import ReservationModal from "@/components/template/modal/ReservationModal";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";

interface ReservationClientProps {
  id: string;
  onReservation?: (date: string, time: string) => void;
}

export default function ReservationClient({ id, onReservation }: ReservationClientProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{ date: string; time: string } | null>(null);

  // 모달 오픈 시 body 스크롤 막기
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  const handleClose = () => setOpen(false);
  const handleConfirm = (date: string, time: string) => {
    setSelected({ date, time });
    setOpen(false);
    if (onReservation) onReservation(date, time);
  };

  return (
    <div>
      <div className="mb-4 text-2xl font-semibold text-gray-800">Select reservation date</div>
      <button
        className="w-full flex items-center border border-teal-400 rounded-md px-4 py-3 text-left hover:shadow focus:outline-none transition bg-white"
        onClick={() => setOpen(true)}
        type="button"
      >
        <FaRegCalendarAlt className="text-teal-400 mr-2 text-lg" />
        <span className={`flex-1 ${selected ? 'text-gray-900' : 'text-teal-400'}`}>
          {selected ? `${selected.date} ${selected.time}` : 'Please select a date.'}
        </span>
        <FiChevronRight className="text-teal-400 ml-2 text-lg" />
      </button>
      {open && (
        <ReservationModal onConfirm={handleConfirm} onClose={handleClose} />
      )}
    </div>
  );
}
