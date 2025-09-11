import { HospitalInfo } from "@/app/models/hospitalData.dto";
import { MapComponent } from "@/components/common/MapComponent";

interface HospitalLocationProps {
  hospitalInfo: HospitalInfo;
}

const HospitalLocation = ({ hospitalInfo }: HospitalLocationProps) => {
  return (
    <div className="px-4 py-8 border-b-8 border-gray-50">
      <h2 className="text-lg font-semibold text-black mb-4 leading-[26.6px]">
        Hospital Location
      </h2>
      
      <div className="space-y-2 mb-4">
       <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-gray-800 min-w-[80px]">
            Address:
          </span>
          <span className="text-sm text-gray-800">
            {hospitalInfo.address_full_road_en}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-gray-800 min-w-[80px]">
            Jibun:
          </span>
          <span className="text-sm text-gray-800">
            {hospitalInfo.address_full_jibun_en}
          </span>
        </div>
        
        {hospitalInfo.directions_to_clinic_en && (
         <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-gray-800 min-w-[80px]">
              Directions:
          </span>
          <span className="text-sm text-gray-800">
            {hospitalInfo.directions_to_clinic_en}
          </span>
        </div>
        )}
      </div>
      
      <div className="w-full h-[328px] rounded-lg overflow-hidden">
        <MapComponent
          coordinates={[
            {
              latitude: hospitalInfo.latitude,
              longitude: hospitalInfo.longitude,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default HospitalLocation;
