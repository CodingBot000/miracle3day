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
