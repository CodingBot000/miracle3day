"use client";

import { HospitalData } from "@/app/models/hospitalData.dto";
import { ROUTE } from "@/router";
import Link from "next/link";

interface HospitalListCardProps {
  hospital: HospitalData;
  showCategories?: boolean;
  showTreatmentInfo?: boolean;
}

const HospitalListCard = ({ hospital, showCategories = false, showTreatmentInfo = false }: HospitalListCardProps) => {
  const categories = [
    { label: "Laser toning", bgColor: "#F5F5F7" },
    { label: "acne scar", bgColor: "#F5F5F7" },
    { label: "treatment", bgColor: "#F5F5F7" },
    { label: "IT", bgColor: "#F5F5F7" }
  ];

  return (
    <Link href={ROUTE.HOSPITAL_DETAIL(hospital.id_uuid)} className="block">
      <div className="space-y-4 md:space-y-6">
        {/* Hospital Card */}
        <div className="flex items-start gap-4 md:gap-6">
          {/* Hospital Image - Responsive: 160x160 (mobile) to 350x350 (desktop) */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-50 md:h-50 lg:w-55 lg:h-55 xl:w-60 xl:h-60 bg-gray-200 rounded-lg flex-shrink-0">
            {hospital.imageurls?.[0] && (
              <img
                src={hospital.imageurls[0]}
                alt={hospital.name}
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>

          {/* Hospital Info */}
          <div className="flex-1 space-y-2 md:space-y-4">
            <div className="space-y-2 md:space-y-4">
              <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-normal text-black leading-tight">
                {hospital.name}
              </h3>
              <p className="text-sm md:text-base lg:text-lg text-gray-500">
                {hospital.location}
              </p>
              {showTreatmentInfo && (
                <p className="text-sm md:text-base lg:text-lg text-gray-500">
                  Laser toning, acne scar treatment
                </p>
              )}
              <p className="text-sm md:text-base lg:text-lg text-gray-500">
                ★4.8 (120+ reviews)
              </p>
            </div>
          </div>
        </div>

        {/* Categories (only show for first item) */}
        {showCategories && (
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((category, index) => (
              <span
                key={index}
                className="px-2 py-1.5 md:px-3 md:py-2 rounded-md text-xs md:text-sm text-gray-500"
                style={{ backgroundColor: category.bgColor }}
              >
                {category.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default HospitalListCard;
