'use client';

import { DoctorData } from "@/app/models/hospitalData.dto";
import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface HospitalDoctorListProps {
  doctors: DoctorData[];
}

const HospitalDoctorList = ({ doctors }: HospitalDoctorListProps) => {
  const { language } = useLanguage();
  const [expandedDoctors, setExpandedDoctors] = useState<Set<number>>(new Set());

  const toggleBio = (index: number) => {
    const newExpanded = new Set(expandedDoctors);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDoctors(newExpanded);
  };

  return (
    <div className="px-4 py-8 border-b-8 border-gray-50">
      <h2 className="text-lg font-semibold text-black mb-4 leading-[26.6px]">
        {language === 'ko' ? '의사 목록' : 'Doctor list'}
      </h2>

      <div className="space-y-6">
        {doctors.map((doctor, index) => {
          const doctorName = language === 'ko' ? doctor.name : doctor.name_en;
          const doctorBio = language === 'ko' ? doctor.bio : doctor.bio_en;
          const hasBio = doctorBio && doctorBio.trim() !== '';

          return (
            <div key={index} className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={doctor.image_url || "/placeholder-doctor.jpg"}
                  alt={doctorName}
                  width={58}
                  height={58}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold text-black leading-[22.4px]">
                  {doctor.chief === 1 && (
                    <span className="text-blue-600 mr-2">👑</span>
                  )}
                  {doctorName}
                </h3>

                {/* Bio toggle button - only show if bio exists */}
                {hasBio && (
                  <div className="space-y-2">
                    <button
                      onClick={() => toggleBio(index)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      {language === 'ko' ? '약력 보기' : 'View Biography'}
                      <svg
                        className={`w-4 h-4 transition-transform ${expandedDoctors.has(index) ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Bio content - only show when expanded */}
                    {expandedDoctors.has(index) && (
                      <div className="text-sm text-gray-500 leading-[14px] whitespace-pre-line">
                        {doctorBio}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
      </div>
    </div>
  );
};

export default HospitalDoctorList;
