import { DoctorData } from "@/app/models/hospitalData.dto";
import Image from "next/image";

interface HospitalLanguageSupportProps {
  doctors: DoctorData[];
}

const HospitalLanguageSupport = ({ doctors }: HospitalLanguageSupportProps) => {
  return (
    <div className="px-4 py-8 border-b-8 border-gray-50">
      <h2 className="text-lg font-semibold text-black mb-4 leading-[26.6px]">
        Languages Supported
      </h2>
      
      <div className="space-y-6">
        {doctors.map((doctor, index) => (
          <div key={index} className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={doctor.image_url || "/placeholder-doctor.jpg"}
                alt={doctor.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </div>
            
            
          </div>
        ))}
        
      </div>
    </div>
  );
};

export default HospitalLanguageSupport;
