'use client';

import { DoctorData } from "@/app/models/hospitalData.dto";
import { useCookieLanguage } from "@/hooks/useCookieLanguage";
import DoctorCard from "./DoctorCard";

interface HospitalDoctorListProps {
  doctors: DoctorData[];
}

const HospitalDoctorList = ({ doctors }: HospitalDoctorListProps) => {
  const { language } = useCookieLanguage();

  return (
    <div className="px-4 py-8 border-b-8 border-gray-50">
      <h2 className="text-lg font-semibold text-black mb-4 leading-[26.6px]">
        {language === 'ko' ? '의사 목록' : 'Doctor list'}
      </h2>

      {/* Responsive grid: 2 columns on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {doctors.map((doctor, index) => (
          <DoctorCard
            key={index}
            doctor={doctor}
            language={language}
          />
        ))}
      </div>
    </div>
  );
};

export default HospitalDoctorList;
