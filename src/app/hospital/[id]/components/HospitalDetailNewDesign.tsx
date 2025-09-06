"use client";

import { HospitalDetailMainOutput } from "@/app/api/hospital/[id]/main/main.dto";
import Image from "next/image";
import { useRouter } from "next/navigation";
import HospitalContactInfo from "./HospitalContactInfo";
import HospitalLocation from "./HospitalLocation";
import HospitalDoctorList from "./HospitalDoctorList";
import HospitalAmenities from "./HospitalAmenities";
import HospitalConsultationButton from "./HospitalConsultationButton";

interface HospitalDetailNewDesignProps {
  hospitalData: HospitalDetailMainOutput;
}

const HospitalDetailNewDesign = ({ hospitalData }: HospitalDetailNewDesignProps) => {
  const router = useRouter();
  const { hospital_info, hospital_details, doctors, business_hours } = hospitalData;

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="w-full max-w-[360px] mx-auto bg-white min-h-screen relative">
      {/* Header with back button */}
      <div className="flex items-center h-14 px-4 border-b border-gray-100 relative">
        <button 
          onClick={handleBackClick}
          className="flex items-center justify-center w-6 h-6"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.0711 5L8 12.0711L15.0711 19.1421" stroke="#1C1C1C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Hero Image */}
      <div className="w-full h-[202.5px] relative">
        <Image
          src={hospital_info.imageurls?.[0] || "/placeholder-hospital.jpg"}
          alt={hospital_info.name}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Hospital Info Section */}
      <div className="px-4 py-8 border-b-8 border-gray-50">
        <div className="space-y-6">
          {/* Hospital Name and Description */}
          <div className="space-y-2">
            <h1 className="text-2xl font-medium text-gray-900 leading-[33.6px]">
              {hospital_info.name}
            </h1>
            <p className="text-base text-gray-500 leading-[22.4px]">
              {hospital_details.introuction || "We promise visible results with a calm, comfortable experience. Board-certified doctors consult directly and treat with vetted devices and strict hygiene."}
            </p>
          </div>

          {/* Contact Information */}
          <HospitalContactInfo hospitalDetails={hospital_details} />
        </div>
      </div>

      {/* Hospital Location */}
      <HospitalLocation hospitalInfo={hospital_info} />

      {/* Doctor List */}
      <HospitalDoctorList doctors={doctors} />

      {/* Hospital Amenities */}
      <HospitalAmenities hospitalDetails={hospital_details} />

      {/* Bottom Consultation Button */}
      <HospitalConsultationButton hospitalId={hospital_info.id_uuid} />
    </div>
  );
};

export default HospitalDetailNewDesign;
