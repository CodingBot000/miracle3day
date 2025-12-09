import { BusinessHourData, DoctorData } from "@/models/hospitalData.dto";
import Image from "next/image";;

interface HospitalBusinessHoursProps {
  business_hours: BusinessHourData[];
}

const HospitalBusinessHours = ({ business_hours }: HospitalBusinessHoursProps) => {
  // Define day order for sorting
  const dayOrder: Record<string, number> = {
    'MON': 1,
    'TUE': 2,
    'WED': 3,
    'THU': 4,
    'FRI': 5,
    'SAT': 6,
    'SUN': 7
  };

  // Sort business hours by day of week
  const sortedBusinessHours = [...business_hours].sort((a, b) => {
    const orderA = dayOrder[a.day_of_week] || 999;
    const orderB = dayOrder[b.day_of_week] || 999;
    return orderA - orderB;
  });

  return (
    <div className="px-4 py-8 border-b-8 border-gray-50">
      <h2 className="text-lg font-semibold text-black mb-4 leading-[26.6px]">
        Business Hours
      </h2>

       {/* 영업시간 */}
      <div className="my-2">
        {/* <h2 className="font-bold text-[0.8rem]">Business Hours</h2> */}
        <div className="max-w-md text-[0.8rem] leading-[1.3rem] indent-4 whitespace-pre-wrap break-keep my-2">
          {sortedBusinessHours.map((hour, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className={"w-20"}>
                {hour.day_of_week}
              </span>
              <span className="flex-1">
                {hour.open_time && hour.close_time 
                  ? <span className={`${hour.status === 'closed' ? 'text-gray-400' : 'text-gray-500'}`}>{`${hour.open_time} - ${hour.close_time}`}</span>
                  : <span className="text-red-500">Closed</span>}
              </span>
              <span className={`text-sm ${hour.status === 'closed' ? 'text-red-500' : 'text-gray-500'}`}>
                {hour.status === 'open' ? 'Open' : 
                 hour.status === 'closed' ? 'Closed' : 'Contact'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HospitalBusinessHours;
