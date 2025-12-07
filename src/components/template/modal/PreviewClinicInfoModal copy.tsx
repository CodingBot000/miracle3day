// 'use client';

// import React, { useState, useEffect } from 'react';
// import { X, MapPin, Phone, Mail, Clock, Camera, Users, Star, Globe, MessageSquare, Edit } from 'lucide-react';
// import Image from 'next/image';
// import { api } from '@/lib/api-client';
// import { 
//   HospitalData, 
//   HospitalDetailData, 
//   BusinessHourData, 
//   DoctorData
// } from '@/models/admin/hospital';
// import DoctorCard from '../admin/DoctorCard';
// import { TreatmentSelectedOptionInfo } from '../admin/TreatmentSelectedOptionInfo';
// import { useTreatmentCategories } from '@/hooks/useTreatmentCategories';
// import Divider from '../admin/Divider';
// import { findRegionByKey, REGIONS } from '@/app/contents/location';
// import { Card, CardContent } from '../ui/card';
// import { getTreatmentsFilePath } from '@/constants/paths';
// import { STORAGE_IMAGES } from '@/constants/tables';

// interface PreviewClinicInfoModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   id_uuid_hospital: string;
//   onStepChange?: (step: number) => void;
//   currentStep?: number;
// }

// // 치료 정보를 위한 인터페이스 (실제 DB 구조에 맞게)
// interface TreatmentData {
//   id_uuid: string;
//   id_uuid_hospital: string;
//   id_uuid_treatment: string | null;
//   option_value: string;
//   price: number;
//   discount_price: number;
//   price_expose: number;
//   etc: string;
// }

// interface CombinedHospitalData extends HospitalData, Partial<HospitalDetailData> {
//   business_hours?: BusinessHourData[];
//   doctors?: DoctorData[];
//   treatments?: TreatmentData[];
//   treatmentDetails?: any[];
//   feedback?: string;
//   contacts?: any[];
//   excelFileName?: string;
//   treatmentSelection?: {
//     skinTreatmentIds: string[];
//     plasticTreatmentIds: string[];
//     deviceIds: string[];
//   };
//   supportTreatmentFeedback?: string;
// }

// const PreviewClinicInfoModal: React.FC<PreviewClinicInfoModalProps> = ({
//   isOpen,
//   onClose,
//   id_uuid_hospital,
//   onStepChange,
//   currentStep = 5,
// }) => {
//   const addressFields = [
//     { label: '도로명', key: 'address_full_road' },
//     { label: '도로명(영문)', key: 'address_full_road_en' },
//     { label: '지번', key: 'address_full_jibun' },
//     { label: '지번(영문)', key: 'address_full_jibun_en' },
//     { label: '시도', key: 'address_si' },
//     { label: '시도(영문)', key: 'address_si_en' },
//     { label: '시군구', key: 'address_gu' },
//     { label: '시군구(영문)', key: 'address_gu_en' },
//     { label: '동명', key: 'address_dong' },
//     { label: '동명(영문)', key: 'address_dong_en' },
//     { label: '건물명', key: 'building_name' },
//     { label: '건물명(영문)', key: 'building_name_en' },
//     { label: '상세주소', key: 'address_detail' },
//     { label: '상세주소(영문)', key: 'address_detail_en' },
//     { label: '찾아오는 방법', key: 'directions_to_clinic' },
//     { label: '찾아오는 방법(영문)', key: 'directions_to_clinic_en' },
//     { label: '우편번호', key: 'zipcode' },

//   ];

//   const [hospitalData, setHospitalData] = useState<CombinedHospitalData | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   // 치료 카테고리 데이터 가져오기
//   const { data: categories } = useTreatmentCategories();

//   useEffect(() => {
//     if (isOpen && id_uuid_hospital) {
//       loadHospitalData();
//     }
//   }, [isOpen, id_uuid_hospital]);

//   const loadHospitalData = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       // Use single consolidated API call instead of 9 separate queries
//       const result = await api.hospital.getPreview(id_uuid_hospital);

//       if (!result.success || !result.data) {
//         throw new Error(result.error || 'Failed to fetch hospital data');
//       }

//       const nestedData = result.data.hospital;

//       // ✅ Nested 구조를 Flat 구조로 변환
//       const combinedData: CombinedHospitalData = {
//         // hospital 정보
//         ...nestedData.hospital,
//         // hospitalDetail 정보
//         ...nestedData.hospitalDetail,
//         // 나머지 top-level 정보
//         business_hours: nestedData.businessHours || [],
//         doctors: nestedData.doctors || [],
//         treatments: nestedData.treatments || [],
//         treatmentDetails: nestedData.treatmentDetails || [],
//         feedback: nestedData.feedback || '',
//         contacts: nestedData.contacts || [],
//         excelFileName: nestedData.excelFileName || '',
//         treatmentSelection: nestedData.treatmentSelection,
//         supportTreatmentFeedback: nestedData.supportTreatmentFeedback || '',
//       };

//       log.info('Hospital preview data loaded (flattened):', combinedData);

//       setHospitalData(combinedData);
//     } catch (err) {
//       console.error('Hospital data load failed:', err);
//       setError('Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDayOfWeek = (day: string) => {
//     // 이미 대문자 축약형인 경우 그대로 반환
//     if (['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].includes(day)) {
//       return day;
//     }
    
//     // 소문자 전체 형태를 대문자 축약형으로 변환
//     const days = {
//       'monday': 'MON',
//       'tuesday': 'TUE', 
//       'wednesday': 'WED',
//       'thursday': 'THU',
//       'friday': 'FRI',
//       'saturday': 'SAT',
//       'sunday': 'SUN'
//     };
//     return days[day as keyof typeof days] || day;
//   };

//   // 요일 순서 정렬을 위한 함수
//   const getDayOrder = (day: string) => {
//     const dayOrder = {
//       'MON': 1,
//       'TUE': 2,
//       'WED': 3,
//       'THU': 4,
//       'FRI': 5,
//       'SAT': 6,
//       'SUN': 7,
//       // 기존 소문자 형태도 지원
//       'monday': 1,
//       'tuesday': 2,
//       'wednesday': 3,
//       'thursday': 4,
//       'friday': 5,
//       'saturday': 6,
//       'sunday': 7
//     };
//     return dayOrder[day as keyof typeof dayOrder] || 8;
//   };

//   const formatTime = (time: string) => {
//     if (!time) return '';
//     return time.substring(0, 5); // HH:MM 형식으로 변환
//   };

//   const handleMoveStep = (step: number) => {
//     // PageHeader의 handleStepClick과 동일한 로직
//     log.info(`handleMoveStep  step:${step}, currentStep:${currentStep}`);
//     if (step < currentStep) {
//       log.info('handleMoveStep step:', step);
//       if (onStepChange) {
//         onStepChange(step);
//         onClose(); // 모달을 닫고 해당 스텝으로 이동
//       } else {
//         log.info('onStepChange가 전달되지 않았습니다. Step으로 이동할 수 없습니다.');
//         // onStepChange가 없을 때는 모달만 닫기
//         onClose();
//       }
//     } else {
//       log.info('현재 단계이거나 진행되지 않은 단계입니다.');
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-enforcer-skip>
//       <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
//         {/* 헤더 */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-200">
//           <h2 className="text-2xl font-bold text-gray-800">병원 정보 미리보기</h2>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         {/* 내용 */}
//         <div className="flex-1 overflow-y-auto p-6">
//           {loading && (
//             <div className="flex items-center justify-center h-64">
//               <div className="text-lg text-gray-600">데이터를 불러오는 중...</div>
//             </div>
//           )}

//           {error && (
//             <div className="flex items-center justify-center h-64">
//               <div className="text-lg text-red-600">{error}</div>
//             </div>
//           )}

//           {hospitalData && (
//             <div className="space-y-8">
//               {/* Step 1: 기본 정보 */}
//               <div className="bg-blue-50 p-6 rounded-lg">
//                 <h3 className="text-xl font-semibold mb-4 text-blue-800 flex items-center justify-between">
//                   <div className="flex items-center">
//                     <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm mr-3">Step 1</span>
//                     기본 정보
//                   </div>
//                   <button
//                     onClick={() => handleMoveStep(1)}
//                     className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
//                       1 < currentStep
//                         ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                     disabled={1 >= currentStep}
//                     title={1 < currentStep ? 'Step 1 편집하기' : '현재 단계이거나 진행되지 않은 단계입니다'}
//                   >
//                     <Edit className="w-4 h-4 mr-1" />
//                     편집
//                   </button>
//                 </h3>
//                 <div className="space-y-4">
//                   {/* 병원 기본 정보 */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-3">
//                       <div className="flex items-center">
//                         <strong className="w-20 text-gray-700">병원명:</strong>
//                         <span className="text-lg font-medium mr-2">{hospitalData.name || '입력되지 않음'}</span> | 
//                         <span className="text-lg font-medium ml-2">{hospitalData.name_en || '입력되지 않음'}</span>
//                       </div>
//                       <div className="flex items-center">
//                         <Mail className="w-4 h-4 mr-2 text-gray-500" />
//                         <strong className="w-16 text-gray-700">이메일:</strong>
//                         <span>{hospitalData.email || '입력되지 않음'}</span>
//                       </div>
//                       <div className="flex items-center">
//                         <Phone className="w-4 h-4 mr-2 text-gray-500" />
//                         <strong className="w-16 text-gray-700">전화:</strong>
//                         <span>{hospitalData.tel || '입력되지 않음'}</span>
//                       </div>
//                     </div>
//                     <div className="space-y-3">
//                       <div className="flex items-center">
//                         <MapPin className="w-4 h-4 mr-2 text-gray-500" />
//                         <strong className="w-16 text-gray-700">지역:</strong>
//                         <span>{findRegionByKey(REGIONS, parseInt(hospitalData.location, 10))?.label || '입력되지 않음'}</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* 병원 소개 */}
//                   <div className="border-t pt-4">
//                     <h4 className="font-medium mb-3 text-gray-800">병원 소개 (국문)</h4>
//                     <div className="p-4 bg-gray-50 rounded-lg border">
//                       {hospitalData.introduction && hospitalData.introduction.trim() !== '' ? (
//                         <div className="text-sm text-gray-700 whitespace-pre-wrap">
//                           {hospitalData.introduction}
//                         </div>
//                       ) : (
//                         <div className="text-sm text-gray-500 italic">
//                           병원 소개가 입력되지 않았습니다.
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="border-t pt-4">
//                     <h4 className="font-medium mb-3 text-gray-800">병원 소개 (영문)</h4>
//                     <div className="p-4 bg-gray-50 rounded-lg border">
//                       {hospitalData.introduction_en && hospitalData.introduction_en.trim() !== '' ? (
//                         <div className="text-sm text-gray-700 whitespace-pre-wrap">
//                           {hospitalData.introduction_en}
//                         </div>
//                       ) : (
//                         <div className="text-sm text-gray-500 italic">
//                           병원 소개 (영문)가 입력되지 않았습니다.
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* 주소 정보 */}
//                   <div>
//                   <Card className="w-full bg-gray-50 rounded-xl shadow-sm">
//                       <CardContent className="py-4 px-6 space-y-4">
//                         {hospitalData ? (
//                           <>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
//                               {addressFields.map(({ label, key }) => {
//                                 const value = hospitalData?.[key as keyof typeof hospitalData];
//                                 const displayValue = typeof value === 'object' ? '-' : (value || '-');
//                                 return (
//                                   <div key={key}>
//                                     <span className="flex">
//                                       <div className="text-sm font-semibold text-gray-800">{label} :</div>
//                                       <div className="text-sm text-gray-600">
//                                         {displayValue}
//                                       </div>
//                                     </span>
//                                   </div>
//                                 );
//                               })}
//                             </div>
                            
//                             {/* 좌표 정보 */}
//                             {hospitalData?.latitude && hospitalData?.longitude && (
//                               <span className="flex">
//                                 <div className="text-sm font-semibold text-gray-800 mr-2">좌표:</div>
//                                 <div className="text-sm text-gray-600">위도: {hospitalData.latitude} / 경도: {hospitalData.longitude}</div>
//                               </span>
//                             )}
//                           </>
//                         ) : (
//                           <div className="text-sm text-gray-500">주소 정보를 불러올 수 없습니다.</div>
//                         )}
//                       </CardContent>
//                     </Card>
//                   </div>
//                 </div>

// <Divider />

//                 {/* SNS 정보 */}
//                 <div>
//                   <h4 className="font-medium mb-2 flex items-center">
//                     <MessageSquare className="w-4 h-4 mr-2" />
//                     SNS 및 연락처
//                   </h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     {hospitalData.kakao_talk && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <strong className="w-24 text-gray-700">카카오톡:</strong>
//                         <span>{hospitalData.kakao_talk}</span>
//                       </div>
//                     )}
//                     {hospitalData.line && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <strong className="w-24 text-gray-700">라인:</strong>
//                         <span>{hospitalData.line}</span>
//                       </div>
//                     )}
//                     {hospitalData.we_chat && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <strong className="w-24 text-gray-700">위챗:</strong>
//                         <span>{hospitalData.we_chat}</span>
//                       </div>
//                     )}
//                     {hospitalData.whats_app && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <strong className="w-24 text-gray-700">왓츠앱:</strong>
//                         <span>{hospitalData.whats_app}</span>
//                       </div>
//                     )}
//                     {hospitalData.telegram && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <strong className="w-24 text-gray-700">텔레그램:</strong>
//                         <span>{hospitalData.telegram}</span>
//                       </div>
//                     )}
//                     {hospitalData.facebook_messenger && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <strong className="w-24 text-gray-700">페이스북:</strong>
//                         <span>{hospitalData.facebook_messenger}</span>
//                       </div>
//                     )}
//                     {hospitalData.instagram && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <strong className="w-24 text-gray-700">인스타그램:</strong>
//                         <span>{hospitalData.instagram}</span>
//                       </div>
//                     )}
//                     {hospitalData.tiktok && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <strong className="w-24 text-gray-700">틱톡:</strong>
//                         <span>{hospitalData.tiktok}</span>
//                       </div>
//                     )}
//                     {hospitalData.youtube && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <strong className="w-24 text-gray-700">유튜브:</strong>
//                         <span>{hospitalData.youtube}</span>
//                       </div>
//                     )}
//                     {hospitalData.other_channel && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <strong className="w-24 text-gray-700">기타:</strong>
//                         <span>{hospitalData.other_channel}</span>
//                       </div>
//                     )}
//                   </div>
                  
//                   {hospitalData.sns_content_agreement === 1 && (
//                     <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded">
//                       <span className="text-green-800 font-medium">✓ SNS 콘텐츠 사용 동의</span>
//                     </div>
//                   )}
                  
//                   {hospitalData.sns_content_agreement === 0 && (
//                     <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
//                       <div className="flex items-start">
//                         <span className="text-yellow-800 font-medium">✗ SNS 콘텐츠 사용 동의하지 않음</span>
//                       </div>
//                       <div className="text-sm text-yellow-700 mt-1">
                    

//                     (동의해 주신다면 귀하의 병원을 홍보하는데 더욱 효과적입니다. 동의는 추후 철회 가능합니다)
//                       </div>
//                     </div>
//                   )}
                  
//                   {(hospitalData.sns_content_agreement === null || hospitalData.sns_content_agreement === undefined) && (
//                     <div className="mt-3 p-3 bg-gray-100 border border-gray-300 rounded">
//                       <span className="text-gray-700 font-medium">SNS 콘텐츠 사용 동의 여부: 입력되지 않음</span>
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="bg-green-50 p-6 rounded-lg">
//                   <h3 className="text-xl font-semibold mb-4 text-green-800 flex items-center justify-between">
//                     <div className="flex items-center">
//                       <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm mr-3">Step 2</span>
//                       영업 등을 위한 추가 연락처 정보 
//                     </div>
//                     <button
//                       onClick={() => handleMoveStep(2)}
//                       className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
//                         2 < currentStep
//                           ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
//                           : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                       }`}
//                       disabled={2 >= currentStep}
//                       title={2 < currentStep ? 'Step 2 편집하기' : '현재 단계이거나 진행되지 않은 단계입니다'}
//                     >
//                       <Edit className="w-4 h-4 mr-1" />
//                       편집
//                     </button>
//                   </h3>
               
//                 {hospitalData.contacts && hospitalData.contacts.length > 0 && (
//                   <div className="mt-4">
//                     <h4 className="font-medium mb-2 flex items-center">
//                       <Phone className="w-4 h-4 mr-2" />
//                       연락처 정보
//                     </h4>
//                     <div className="space-y-3">
//                       {/* 진료문의 전화번호 */}
//                       {hospitalData.contacts.filter(contact => contact.type === 'consultation_phone').length > 0 && (
//                         <div className="flex items-center p-2 bg-white rounded border">
//                           <strong className="w-28 text-gray-700">진료문의:</strong>
//                           <span>{hospitalData.contacts.find(contact => contact.type === 'consultation_phone')?.value}</span>
                         
//                         </div>
//                       )}
                      
//                       {/* 상담 관리자 번호 */}
//                       {hospitalData.contacts.filter(contact => contact.type === 'consult_manager_phone').length > 0 && (
//                         <div className="p-2 bg-white rounded border">
//                           <strong className="text-gray-700 mb-2 block">상담 관리자 번호:</strong>
//                           <div className="space-y-1">
//                             {hospitalData.contacts
//                               .filter(contact => contact.type === 'consult_manager_phone')
//                               .sort((a, b) => a.sequence - b.sequence)
//                               .map((contact, index) => (
//                                 <div key={index} className="flex items-center ml-4">
//                                   <span className="text-sm text-gray-600 mr-2">{index + 1}.</span>
//                                   <span className="text-sm">{contact.value}</span>
//                                 </div>
//                               ))}
//                           </div>
//                         </div>
//                       )}
                      
//                       {/* SMS 발신 번호 */}
//                       {hospitalData.contacts.find(contact => contact.type === 'sms_phone') && (
//                         <div className="flex items-center p-2 bg-white rounded border">
//                           <strong className="w-28 text-gray-700">SMS 발신:</strong>
//                           <span>{hospitalData.contacts.find(contact => contact.type === 'sms_phone')?.value}</span>
//                         </div>
//                       )}
                      
//                       {/* 이벤트 관리자 번호 */}
//                       {hospitalData.contacts.find(contact => contact.type === 'event_manager_phone') && (
//                         <div className="flex items-center p-2 bg-white rounded border">
//                           <strong className="w-28 text-gray-700">이벤트 관리자:</strong>
//                           <span>{hospitalData.contacts.find(contact => contact.type === 'event_manager_phone')?.value}</span>
//                         </div>
//                       )}
                      
//                       {/* 마케팅 이메일 */}
//                       {hospitalData.contacts.filter(contact => contact.type === 'marketing_email').length > 0 && (
//                         <div className="p-2 bg-white rounded border">
//                           <strong className="text-gray-700 mb-2 block">마케팅 이메일:</strong>
//                           <div className="space-y-1">
//                             {hospitalData.contacts
//                               .filter(contact => contact.type === 'marketing_email')
//                               .sort((a, b) => a.sequence - b.sequence)
//                               .map((contact, index) => (
//                                 <div key={index} className="flex items-center ml-4">
//                                   <span className="text-sm text-gray-600 mr-2">{index + 1}.</span>
//                                   <span className="text-sm">{contact.value}</span>
//                                 </div>
//                               ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//               </div>
//               {/* Step 3 */}
//               <div className="bg-green-50 p-6 rounded-lg">
//                 <h3 className="text-xl font-semibold mb-4 text-green-800 flex items-center justify-between">
//                   <div className="flex items-center">
//                     <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm mr-3">Step 3</span>
//                     운영 시간 및 부가 정보
//                   </div>
//                   <button
//                     onClick={() => handleMoveStep(3)}
//                     className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
//                       3 < currentStep
//                         ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                     disabled={3 >= currentStep}
//                     title={3 < currentStep ? 'Step 3 편집하기' : '현재 단계이거나 진행되지 않은 단계입니다'}
//                   >
//                     <Edit className="w-4 h-4 mr-1" />
//                     편집
//                   </button>
//                 </h3>
                
//                 {/* 운영 시간 */}
//                 <div className="mb-6">
//                   <h4 className="font-medium mb-3 text-gray-800">운영 시간</h4>
//                   <div className="space-y-1">
//                     {(() => {
//                       log.info('=== 운영시간 정렬 디버깅 START ===');
//                       log.info('원본 business_hours:', hospitalData.business_hours);
                      
//                       const sorted = hospitalData.business_hours
//                         ?.sort((a, b) => {
//                           const orderA = getDayOrder(a.day_of_week);
//                           const orderB = getDayOrder(b.day_of_week);
//                           log.info(`${a.day_of_week} (${orderA}) vs ${b.day_of_week} (${orderB})`);
//                           return orderA - orderB;
//                         });
                      
//                       log.info('정렬된 business_hours:', sorted);
//                       log.info('=== 운영시간 정렬 디버깅 END ===');
                      
//                       return sorted?.map((hour, index) => (
//                         <div key={index} className="flex items-center p-2 bg-white rounded border">
//                           <Clock className="w-4 h-4 mr-2 text-gray-500" />
//                           <span className="font-medium w-12 text-sm">{formatDayOfWeek(hour.day_of_week)}</span>
//                           <span className="mx-3 text-gray-400">|</span>
//                           {hour.status === 'closed' ? (
//                             <span className="text-red-600 font-medium text-sm">휴무</span>
//                           ) : hour.status === 'ask' ? (
//                             <span className="text-orange-600 font-medium text-sm">진료시간 문의필요</span>
//                           ) : hour.status === 'open' && hour.open_time && hour.close_time ? (
//                             <div className="flex items-center">
//                               <span className="text-gray-700 text-sm mr-2">
//                                 {formatTime(hour.open_time)} - {formatTime(hour.close_time)}
//                               </span>
//                               <span className="text-green-600 font-medium text-sm">영업</span>
//                             </div>
//                           ) : (
//                             <span className="text-gray-500 text-sm">시간 정보 없음</span>
//                           )}
//                         </div>
//                       ));
//                     })()}
//                   </div>
//                 </div>

//                 {/* 부가 정보 */}
//                 <div>
//                   <h4 className="font-medium mb-3 text-gray-800">부가 정보</h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     {hospitalData.has_private_recovery_room && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <span className="text-green-600 mr-2">✓</span>
//                         <span>개인 회복실</span>
//                       </div>
//                     )}
//                     {hospitalData.has_parking && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <span className="text-green-600 mr-2">✓</span>
//                         <span>주차 가능</span>
//                       </div>
//                     )}
//                     {hospitalData.has_cctv && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <span className="text-green-600 mr-2">✓</span>
//                         <span>CCTV 설치</span>
//                       </div>
//                     )}
//                     {hospitalData.has_night_counseling && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <span className="text-green-600 mr-2">✓</span>
//                         <span>야간 상담 가능</span>
//                       </div>
//                     )}
//                     {hospitalData.has_female_doctor && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <span className="text-green-600 mr-2">✓</span>
//                         <span>여의사 진료</span>
//                       </div>
//                     )}
//                     {hospitalData.has_anesthesiologist && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <span className="text-green-600 mr-2">✓</span>
//                         <span>마취과 전문의</span>
//                       </div>
//                     )}
//                     {hospitalData.specialist_count && hospitalData.specialist_count > 0 && (
//                       <div className="flex items-center p-2 bg-white rounded border">
//                         <span className="text-blue-600 mr-2">👨‍⚕️</span>
//                         <span>전문의 {hospitalData.specialist_count}명</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Step 3: 이미지 및 의사 정보 */}
//               <div className="bg-purple-50 p-6 rounded-lg">
//                 <h3 className="text-xl font-semibold mb-4 text-purple-800 flex items-center justify-between">
//                   <div className="flex items-center">
//                     <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm mr-3">Step 4</span>
//                     병원 썸네일 이미지, 병원 상세 이미지 및 의사 정보
//                   </div>
//                   <button
//                     onClick={() => handleMoveStep(4)}
//                     className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
//                       4 < currentStep
//                         ? 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                     disabled={4 >= currentStep}
//                     title={4 < currentStep ? 'Step 4 편집하기' : '현재 단계이거나 진행되지 않은 단계입니다'}
//                   >
//                     <Edit className="w-4 h-4 mr-1" />
//                     편집
//                   </button>
//                 </h3>
                
//                 {/* 썸네일 이미지 */}
//                 {hospitalData.thumbnail_url && (
//                   <div className="mb-6">
//                     <h4 className="font-medium mb-2 flex items-center">
//                       <Camera className="w-4 h-4 mr-2" />
//                       썸네일 이미지 (타 병원들과 함께 리스트로 나오는 이미지입니다 )
//                     </h4>
//                     <div className="w-64 h-40 relative rounded-lg overflow-hidden border">
//                       <Image
//                         src={hospitalData.thumbnail_url}
//                         alt="병원 썸네일"
//                         fill
//                         className="object-cover"
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {/* 병원 이미지들 */}
//                 {hospitalData.imageurls && hospitalData.imageurls.length > 0 && (
//                   <div className="mb-6">
//                     <h4 className="font-medium mb-2 flex items-center">
//                       <Camera className="w-4 h-4 mr-2" />
//                       병원 이미지 ({hospitalData.imageurls.length}개) -  나열된 순서대로 보여집니다.
//                     </h4>
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                       {hospitalData.imageurls.map((url, index) => (
//                         <div key={index} className="aspect-video relative rounded-lg overflow-hidden border">
//                           <Image
//                             src={url}
//                             alt={`병원 이미지 ${index + 1}`}
//                             fill
//                             className="object-cover"
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* 의사 정보 */}
//                 {hospitalData.doctors && hospitalData.doctors.length > 0 && (
//                   <div>
//                     <h4 className="font-medium mb-2 flex items-center">
//                       <Users className="w-4 h-4 mr-2" />
//                       의사 정보 ({hospitalData.doctors.length}명)
//                     </h4>
//                     <div className="flex flex-wrap gap-4">
//                       {hospitalData.doctors.map((doctor, index) => (
//                         <DoctorCard
//                           key={index}
//                           doctor={{
//                             id: (doctor as any).id_uuid || `doctor-${index}`,
//                             name: doctor.name,
//                             bio: doctor.bio,
//                             imagePreview: Array.isArray(doctor.image_url) ? doctor.image_url[0] : doctor.image_url,
//                             isChief: doctor.chief === 1
//                           }}
//                           mode='preview'
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Step 5: 치료 정보 */}
//               {(hospitalData.treatments && hospitalData.treatments.length > 0) || hospitalData.excelFileName ? (
//                 <div className="bg-green-50 p-6 rounded-lg">
//                   <h3 className="text-xl font-semibold mb-4 text-green-800 flex items-center justify-between">
//                     <div className="flex items-center">
//                       <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm mr-3">Step 6</span>
//                       치료 정보
//                     </div>
//                     <button
//                       onClick={() => handleMoveStep(5)}
//                       className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
//                         5 < currentStep
//                           ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
//                           : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                       }`}
//                       disabled={5 >= currentStep}
//                       title={5 < currentStep ? 'Step 5 편집하기' : '현재 단계이거나 진행되지 않은 단계입니다'}
//                     >
//                       <Edit className="w-4 h-4 mr-1" />
//                       편집
//                     </button>
//                   </h3>

//                   {/* 엑셀 파일 표시 */}
//                   {hospitalData.excelFileName && (
//                     <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
//                       <h4 className="font-medium mb-2 text-blue-800 flex items-center">
//                         📊 업로드된 시술정보 엑셀 파일
//                       </h4>
//                       <div className="flex items-center text-blue-700">
//                         <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
//                           {hospitalData.excelFileName}
//                         </span>
//                       </div>
//                     </div>
//                   )}
                  
//                   {/* TreatmentSelectedOptionInfo 컴포넌트 사용 (직접 입력한 시술 정보가 있는 경우) */}
//                   {hospitalData.treatments && hospitalData.treatments.length > 0 && (
//                     <div>
//                       {hospitalData.excelFileName && (
//                         <h4 className="font-medium mb-2 text-green-800">직접 입력한 시술 정보</h4>
//                       )}
//                       <TreatmentSelectedOptionInfo
//                         selectedKeys={(() => {
//                           // treatmentDetails의 code를 사용하여 selectedKeys 생성
//                           if (!hospitalData.treatmentDetails || !categories) return [];
//                           const codes = hospitalData.treatmentDetails.map(detail => detail.code);
//                           log.info('Treatment codes:', codes);
//                           return [...Array.from(new Set(codes))].filter(code => !!code);
//                         })()}
//                         productOptions={(() => {
//                           // treatments와 treatmentDetails를 매칭하여 productOptions 생성
//                           if (!hospitalData.treatments || !hospitalData.treatmentDetails) return [];
                          
//                           return hospitalData.treatments.map((treatment) => {
//                             // UUID로 treatmentDetails에서 해당 치료 정보 찾기
//                             const treatmentDetail = hospitalData.treatmentDetails?.find(
//                               detail => detail.id_uuid === treatment.id_uuid_treatment
//                             );
                            
//                             return {
//                               id: treatment.id_uuid,
//                               treatmentKey: treatmentDetail?.code || '',
//                               value1: treatment.option_value && treatment.option_value.trim() !== '' 
//                                 ? (isNaN(parseInt(treatment.option_value)) ? 0 : parseInt(treatment.option_value))
//                                 : 0,
//                               value2: treatment.price || 0
//                             };
//                           });
//                         })()}
//                         etc={hospitalData.treatments
//                           .filter(treatment => treatment.etc && treatment.etc.trim() !== '')
//                           .map(treatment => treatment.etc)
//                           .join('\n')
//                         }
//                         categories={categories || []}
//                         showTitle={false}
//                         className="bg-white"
//                       />
//                     </div>
//                   )}
                  
//                   {/* 시술 정보가 아무것도 없는 경우 */}
//                   {!hospitalData.excelFileName && (!hospitalData.treatments || hospitalData.treatments.length === 0) && (
//                     <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//                       <div className="text-sm text-gray-500 italic text-center">
//                         등록된 시술 정보가 없습니다.
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="bg-gray-50 p-6 rounded-lg">
//                   <h3 className="text-xl font-semibold mb-4 text-gray-600 flex items-center justify-between">
//                     <div className="flex items-center">
//                       <span className="bg-gray-400 text-white px-3 py-1 rounded-full text-sm mr-3">Step 6</span>
//                       치료 정보
//                     </div>
//                     <button
//                       onClick={() => handleMoveStep(5)}
//                       className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
//                         5 < currentStep
//                           ? 'bg-gray-600 text-white hover:bg-gray-700 cursor-pointer'
//                           : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                       }`}
//                       disabled={5 >= currentStep}
//                       title={5 < currentStep ? 'Step 5 편집하기' : '현재 단계이거나 진행되지 않은 단계입니다'}
//                     >
//                       <Edit className="w-4 h-4 mr-1" />
//                       편집
//                     </button>
//                   </h3>
//                   <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
//                     <div className="text-sm text-gray-500 italic text-center">
//                       등록된 시술 정보가 없습니다.
//                     </div>
//                   </div>
//                 </div>
//               )}
//              {/* Step 6:  제공가능 시술 및 장비정보 , 관련피드백 정보 조회 */ }
//               {hospitalData.treatmentSelection && (
//                 <div className="bg-indigo-50 p-6 rounded-lg mb-6">
//                   <h3 className="text-xl font-semibold mb-4 text-indigo-800 flex items-center justify-between">
//                     <div className="flex items-center">
//                       <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm mr-3">Step 6</span>
//                       제공 가능 시술 및 장비 정보
//                     </div>
//                     <button
//                       onClick={() => handleMoveStep(6)}
//                       className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
//                         6 < currentStep
//                           ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
//                           : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                       }`}
//                       disabled={6 >= currentStep}
//                       title={6 < currentStep ? 'Step 6 편집하기' : '현재 단계이거나 진행되지 않은 단계입니다'}
//                     >
//                       <Edit className="w-4 h-4 mr-1" />
//                       편집
//                     </button>
//                   </h3>

//                   {/* 피부 시술 */}
//                   {hospitalData.treatmentSelection.skinTreatmentIds.length > 0 && (
//                     <div className="mb-4">
//                       <h4 className="font-medium mb-2 text-blue-700">피부 시술</h4>
//                       <div className="flex flex-wrap gap-2">
//                         {hospitalData.treatmentSelection.skinTreatmentIds.map((id, index) => (
//                           <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
//                             {id}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* 성형 시술 */}
//                   {hospitalData.treatmentSelection.plasticTreatmentIds.length > 0 && (
//                     <div className="mb-4">
//                       <h4 className="font-medium mb-2 text-purple-700">성형 시술</h4>
//                       <div className="flex flex-wrap gap-2">
//                         {hospitalData.treatmentSelection.plasticTreatmentIds.map((id, index) => (
//                           <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
//                             {id}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* 보유 장비 */}
//                   {hospitalData.treatmentSelection.deviceIds.length > 0 && (
//                     <div className="mb-4">
//                       <h4 className="font-medium mb-2 text-green-700">보유 장비</h4>
//                       <div className="flex flex-wrap gap-2">
//                         {hospitalData.treatmentSelection.deviceIds.map((id, index) => (
//                           <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
//                             {id}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* 피드백 정보 */}
//                   {hospitalData.supportTreatmentFeedback && (
//                     <div>
//                       <h4 className="font-medium mb-2 flex items-center">
//                         <MessageSquare className="w-4 h-4 mr-2" />
//                         제공 시술 관련 피드백
//                       </h4>
//                       <div className="p-4 bg-white rounded-lg border border-gray-200">
//                         <div className="text-sm text-gray-700 whitespace-pre-wrap">
//                           {hospitalData.supportTreatmentFeedback}
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* 데이터가 없는 경우 */}
//                   {hospitalData.treatmentSelection.skinTreatmentIds.length === 0 &&
//                    hospitalData.treatmentSelection.plasticTreatmentIds.length === 0 &&
//                    hospitalData.treatmentSelection.deviceIds.length === 0 && (
//                     <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//                       <div className="text-sm text-gray-500 italic">
//                         선택된 시술 및 장비 정보가 없습니다.
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Step 7: 사용가능 언어 및 피드백 정보  */}
//               <div className="bg-pink-50 p-6 rounded-lg">
//                 <h3 className="text-xl font-semibold mb-4 text-pink-800 flex items-center justify-between">
//                   <div className="flex items-center">
//                     <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-sm mr-3">Step 7</span>
//                     사용 가능 언어 및 피드백 정보
//                   </div>
//                   <button
//                     onClick={() => handleMoveStep(6)}
//                     className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
//                       6 < currentStep
//                         ? 'bg-pink-600 text-white hover:bg-pink-700 cursor-pointer'
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                     disabled={6 >= currentStep}
//                     title={6 < currentStep ? 'Step 6 편집하기' : '현재 단계이거나 진행되지 않은 단계입니다'}
//                   >
//                     <Edit className="w-4 h-4 mr-1" />
//                     편집
//                   </button>
//                 </h3>
                
//                 {/* 사용 가능한 언어 */}
//                 {hospitalData.available_languages && hospitalData.available_languages.length > 0 && (
//                   <div className="mb-4">
//                     <h4 className="font-medium mb-2 flex items-center">
//                       <Globe className="w-4 h-4 mr-2" />
//                       사용 가능한 언어
//                     </h4>
//                     <div className="flex flex-wrap gap-2">
//                       {hospitalData.available_languages.map((lang, index) => (
//                         <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
//                           {lang}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* 피드백 정보 */}
//                 <div>
//                   <h4 className="font-medium mb-2 flex items-center">
//                     <MessageSquare className="w-4 h-4 mr-2" />
//                     피드백 정보
//                   </h4>
//                   {hospitalData.feedback && hospitalData.feedback.trim() !== '' ? (
//                     <div className="p-4 bg-white rounded-lg border border-gray-200">
//                       <div className="text-sm text-gray-700 whitespace-pre-wrap">
//                         {hospitalData.feedback}
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//                       <div className="text-sm text-gray-500 italic">
//                         피드백 정보가 없습니다.
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* 푸터 */}
//         <div className="flex justify-end p-6 border-t border-gray-200">
//           <button
//             onClick={onClose}
//             className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
//           >
//             닫기
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PreviewClinicInfoModal;
