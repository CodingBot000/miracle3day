"use client";

import { useRouter } from "next/navigation";
import { ROUTE } from "@/router";

interface HospitalConsultationButtonProps {
  hospitalId: string;
}

const HospitalConsultationButton = ({ hospitalId }: HospitalConsultationButtonProps) => {
  const router = useRouter();

  const handleConsultationClick = () => {
    router.push(ROUTE.RESERVATION(hospitalId));
  };

  return (
    <div className="fixed left-0 right-0 bottom-0 flex justify-center px-4 py-0 bg-white">
      <div className="w-full max-w-[360px] h-20 flex items-center px-4">
        <button
          onClick={handleConsultationClick}
          className="w-full h-12 bg-[#FB718F] text-white rounded-lg font-semibold text-base leading-[22.4px] hover:bg-[#f5648a] transition-colors"
        >
          Schedule a Consultation
        </button>
      </div>
    </div>
  );
};

export default HospitalConsultationButton;
