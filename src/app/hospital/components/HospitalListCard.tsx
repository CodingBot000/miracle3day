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
      <div className="space-y-4">
        {/* Hospital Card */}
        <div className="flex items-start gap-4">
          {/* Hospital Image */}
          <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
            {hospital.imageurls?.[0] && (
              <img
                src={hospital.imageurls[0]}
                alt={hospital.name}
                className="w-full h-full object-cover rounded"
              />
            )}
          </div>

          {/* Hospital Info */}
          <div className="flex-1 space-y-3">
            <div className="space-y-3">
              <h3 className="text-base font-normal text-black leading-[22.4px]">
                {hospital.name}
              </h3>
              <p className="text-sm text-gray-500 leading-[14px]">
                {hospital.location}
              </p>
              {showTreatmentInfo && (
                <p className="text-sm text-gray-500 leading-[14px]">
                  aser toning, acne scar treatment
                </p>
              )}
              <p className="text-sm text-gray-500 leading-[14px]">
                ★4.8 (120+ reviews)
              </p>
            </div>
          </div>
        </div>

        {/* Categories (only show for first item) */}
        {showCategories && (
          <div className="flex items-center gap-2">
            {categories.map((category, index) => (
              <span
                key={index}
                className="px-1.5 py-1 rounded-md text-xs text-gray-500 leading-[12px]"
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
