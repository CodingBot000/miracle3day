import React from 'react';
import { Card, CardContent } from '../ui/card';
import { HospitalData } from '@/models/admin/hospital';

interface AddressPreviewCardProps {
  hospitalData: HospitalData | null;
}

const AddressPreviewCard: React.FC<AddressPreviewCardProps> = ({ hospitalData }) => {
  const addressFields = [
    { label: '도로명', key: 'address_full_road' },
    { label: '도로명(영문)', key: 'address_full_road_en' },
    { label: '지번', key: 'address_full_jibun' },
    { label: '지번(영문)', key: 'address_full_jibun_en' },
    { label: '시/도', key: 'address_si' },
    { label: '시/도(영문)', key: 'address_si_en' },
    { label: '시/군/구', key: 'address_gu' },
    { label: '시/군/구(영문)', key: 'address_gu_en' },
    { label: '동/면/읍', key: 'address_dong' },
    { label: '동/면/읍(영문)', key: 'address_dong_en' },
    { label: '우편번호', key: 'zipcode' },
    { label: '상세주소', key: 'address_detail' },
    { label: '상세주소(영문)', key: 'address_detail_en' },
    { label: '찾아오는 방법', key: 'directions_to_clinic' },
    { label: '찾아오는 방법(영문)', key: 'directions_to_clinic_en' },
  ];

  return (
    <Card className="w-full bg-gray-50 rounded-xl shadow-sm">
      <CardContent className="py-4 px-6 space-y-4">
        {hospitalData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {addressFields.map(({ label, key }) => (
                <div key={key}>
                  <span className="flex">
                    <div className="text-sm font-semibold text-gray-800">{label} :</div>
                    <div className="text-sm text-gray-600">
                      {hospitalData[key as keyof HospitalData] || '-'}
                    </div>
                  </span>
                </div>
              ))}
            </div>
            
            {/* 좌표 정보 */}
            {hospitalData.latitude && hospitalData.longitude && (
              <span className="flex">
                <div className="text-sm font-semibold text-gray-800 mr-2">좌표:</div>
                <div className="text-sm text-gray-600">위도: {hospitalData.latitude} / 경도: {hospitalData.longitude}</div>
              </span>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-500">주소 정보를 불러올 수 없습니다.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressPreviewCard; 