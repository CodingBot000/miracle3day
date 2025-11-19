'use client';

import { DoctorData } from "@/app/models/hospitalData.dto";
import Image from "next/image";
import { useState } from "react";

interface DoctorCardProps {
  doctor: DoctorData;
  language: string;
}

const DoctorCard = ({ doctor, language }: DoctorCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const doctorName = language === 'ko' ? doctor.name : doctor.name_en;
  const doctorBio = language === 'ko' ? doctor.bio : doctor.bio_en;
  const hasBio = doctorBio && doctorBio.trim() !== '';

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={doctor.image_url || "/placeholder-doctor.jpg"}
            alt={doctorName}
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="w-full text-center space-y-2">
          <h3 className="text-sm md:text-lg font-bold text-black leading-tight">
            {doctor.chief === 1 && (
              <span className="text-blue-600 mr-1">👑</span>
            )}
            {doctorName}
          </h3>

          {/* Bio button - only show if bio exists */}
          {hasBio && (
            <button
              onClick={openModal}
              className="text-xs md:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1 w-full"
            >
              {language === 'ko' ? '약력 보기' : 'View Biography'}
              <svg
                className="w-3 h-3 md:w-4 md:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal content */}
            <div className="p-8">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={doctor.image_url || "/placeholder-doctor.jpg"}
                    alt={doctorName}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-black text-center">
                  {doctor.chief === 1 && (
                    <span className="text-blue-600 mr-2">👑</span>
                  )}
                  {doctorName}
                </h2>
              </div>

              <div className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {doctorBio}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorCard;
