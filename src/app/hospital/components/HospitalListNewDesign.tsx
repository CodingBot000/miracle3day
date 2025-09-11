"use client";

import { HospitalData } from "@/app/models/hospitalData.dto";
import { LocationEnum } from "@/constants";
import { useRouter } from "next/navigation";
import HospitalListCard from "./HospitalListCard";
import { ROUTE } from "@/router";

interface HospitalListNewDesignProps {
  initialData: HospitalData[];
  initialLocation: LocationEnum;
}

const HospitalListNewDesign = ({ initialData }: HospitalListNewDesignProps) => {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white min-h-screen">
      {/* Header with back button */}
      <div className="flex items-center h-14 px-4 md:px-6 lg:px-8 border-b border-gray-100 relative">
        <button 
          onClick={handleBackClick}
          className="flex items-center justify-center w-6 h-6 mr-3"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.0711 5L8 12.0711L15.0711 19.1421" stroke="#1C1C1C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <p className="text-sm md:text-base text-gray-700 font-medium">
          Awsome Korean Premium Clinics For You
        </p>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 lg:px-8 py-8 border-b-8 border-gray-50">
        <div className="space-y-6">
          {/* Title */}
          {/* <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-black leading-[26.6px]">
            Clinic List
          </h1> */}
          <h1 className="text-sm md:text-base text-gray-500 leading-[26.6px]">
            Korean dermatology clinics with services for international patients
          </h1>

          {/* Clinic List */}
          <div className="space-y-8 md:space-y-12">
            {initialData.map((hospital, index) => (
              <HospitalListCard 
                key={hospital.id_uuid} 
                hospital={hospital}
                 href={ROUTE.HOSPITAL_DETAIL("") + hospital.id_uuid}
                showCategories={index === 0} 
              />
            ))}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalListNewDesign;
