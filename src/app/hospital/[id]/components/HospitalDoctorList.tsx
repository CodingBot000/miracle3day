import { DoctorData } from "@/app/models/hospitalData.dto";
import Image from "next/image";

interface HospitalDoctorListProps {
  doctors: DoctorData[];
}

const HospitalDoctorList = ({ doctors }: HospitalDoctorListProps) => {
  return (
    <div className="px-4 py-8 border-b-8 border-gray-50">
      <h2 className="text-lg font-semibold text-black mb-4 leading-[26.6px]">
        Doctor list
      </h2>
      
      <div className="space-y-6">
        {doctors.map((doctor, index) => (
          <div key={index} className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={doctor.image_url || "/placeholder-doctor.jpg"}
                alt={doctor.name_en}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </div>
            
            <div className="flex-1 space-y-2">
              <h3 className="text-base font-medium text-black leading-[22.4px]">
                {doctor.chief === 1 && (
                  <span className="text-blue-600 mr-2">👑</span>
                )}
                {doctor.name_en}
              </h3>
              <div className="space-y-0">
                {doctor.bio && (
                  <p className="text-sm text-gray-500 leading-[14px]">
                    {doctor.bio_en}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Example doctors if no doctors data */}
        {doctors.length === 0 && (
          <>
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <h3 className="text-base font-medium text-black leading-[22.4px]">
                  Dr. Daniel Park, MD
                </h3>
                <p className="text-sm text-gray-500 leading-[14px]">
                  Board-certified dermatologist
                </p>
                <p className="text-sm text-gray-500 leading-[14px]">
                  Laser, scar & pigment care
                </p>
                <p className="text-sm text-gray-500 leading-[14px]">
                  12+ years clinical experience
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <h3 className="text-base font-semibold text-black leading-[22.4px]">
                  의사 1
                </h3>
                <p className="text-sm text-gray-500 leading-[14px]">
                  Filler & Botox specialist
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <h3 className="text-base font-semibold text-black leading-[22.4px]">
                  의사 1
                </h3>
                <p className="text-sm text-gray-500 leading-[14px]">
                  Natural, subtle results
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HospitalDoctorList;
