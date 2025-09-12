"use client";

import { HospitalDetailMainOutput } from "@/app/api/hospital/[id]/main/main.dto";
import Image from "next/image";
import { useRouter } from "next/navigation";
import HospitalContactInfo from "./HospitalContactInfo";
import HospitalLocation from "./HospitalLocation";
import HospitalDoctorList from "./HospitalDoctorList";
import HospitalAmenities from "./HospitalAmenities";
import HospitalConsultationButton from "./HospitalConsultationButton";
import HospitalBusinessHours from "./HospitalBusinessHours";
import ResponsiveImageMosaic from "@/components/template/ResponsiveImageMosaic";

interface HospitalDetailNewDesignProps {
  hospitalData: HospitalDetailMainOutput;
}

const HospitalDetailNewDesign = ({ hospitalData }: HospitalDetailNewDesignProps) => {
  const router = useRouter();
  console.log('HospitalDetailNewDesign hospitalData:', hospitalData);
  const { hospital_info, hospital_details, doctors, business_hours } = hospitalData;

  const handleBackClick = () => {
    router.back();
  };

  const handleImageClicked = () => {

  };

  return (
    <div className="max-w-container mx-auto bg-white min-h-screen relative">
      {/* Header with back button */}
      {/* <div className="flex items-center h-14 px-4 border-b border-gray-100 relative"> */}
        {/* <button 
          onClick={handleBackClick}
          className="flex items-center justify-center w-6 h-6"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.0711 5L8 12.0711L15.0711 19.1421" stroke="#1C1C1C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        
        </button>
         */}

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
          Introuduce Korean Premium Clinic
        </p>
      </div>

      {/* Hero Image */}
      {/* <div className="w-full h-[400px] relative">
        <Image
          src={hospital_info.imageurls?.[0] || "/placeholder-hospital.jpg"}
          alt={hospital_info.name}
          fill
          className="object-cover"
          priority
        />
      </div> */}
      <div className="w-full h-[400px] relative">
        <ResponsiveImageMosaic
          images ={hospital_info.imageurls}
          onOpen={handleImageClicked}
          />
        {/* <Image
          src={hospital_info.imageurls?.[0] || "/placeholder-hospital.jpg"}
          alt={hospital_info.name}
          fill
          className="object-cover"
          priority
        /> */}
      </div>

      {/* Hospital Info Section */}
      <div className="px-4 py-8 border-b-8 border-gray-50">
        <div className="space-y-6">
          {/* Hospital Name and Description */}
          <div className="space-y-2">
            <h1 className="text-2xl font-medium text-gray-900 leading-[33.6px]">
              {hospital_info.name_en}
            </h1>
            <p className="text-base text-gray-500 leading-[22.4px]">
              {hospital_details.introduction_en || "We promise visible results with a calm, comfortable experience. Board-certified doctors consult directly and treat with vetted devices and strict hygiene."}
            </p>
          </div>

          {/* Contact Information */}
          <HospitalContactInfo hospitalDetails={hospital_details} />
        </div>
      </div>

      <HospitalBusinessHours business_hours={business_hours} />
     
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
