// import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { ChevronLeft } from 'lucide-react';
// import { recommendTreatments, RecommendationOutput } from './questionScript/matchingDiagnosis';
// import { log } from '@/utils/logger';
// import { getExchangeRateInfo, updateExchangeRate, type ExchangeRateData } from '@/utils/exchangeRateManager';

// interface DiagnosisRecommendProps {
//   formData: Record<string, any>;
//   onComplete: () => void;
// }

// const DiagnosisRecommend: React.FC<DiagnosisRecommendProps> = ({ formData, onComplete }) => {
//   const ERROR_MSG = "We apologize for the inconvenience. Our team is working to resolve the issue quickly to ensure the best experience. Please try again shortly.";
//   const EMPTY_RESULT = "Based on your responses, we couldn't identify specific treatments at this time. This could be due to your current skin condition, recent treatment history, or other factors.";

//   // 예산 관련 사유를 필터링하는 함수
//   const filterBudgetReasons = (rationale: string[]): string[] => {
//     return rationale.filter(reason => 
//       !reason.includes('budget-friendly substitution') && 
//       !reason.includes('→ budget-friendly substitution')
//     ).map(reason => 
//       // 연속된 "→ budget-friendly substitution" 패턴 제거
//       reason.replace(/\s*→\s*budget-friendly substitution/g, '')
//     ).filter(reason => reason.trim() !== '');
//   };

//   // 추천 시술 카드 배경색 배열 (폰트 가독성을 위해 밝은 색상 사용)
//   const bgColors = [
//     'bg-yellow-100',     // 노란색 계열
//     'bg-blue-100',       // 파란색 계열
//     'bg-pink-100',       // 분홍색 계열
//     'bg-green-100',      // 초록색 계열
//     'bg-purple-100',     // 보라색 계열
//     'bg-indigo-100',     // 남색 계열
//     'bg-red-100',        // 빨간색 계열
//     'bg-orange-100',     // 주황색 계열
//     'bg-teal-100',       // 청록색 계열
//     'bg-cyan-100',       // 하늘색 계열
//     'bg-lime-100',       // 라임색 계열
//     'bg-emerald-100',    // 에메랄드 계열
//     'bg-sky-100',        // 하늘색 계열
//     'bg-violet-100',     // 바이올렛 계열
//     'bg-fuchsia-100',    // 자홍색 계열
//     'bg-rose-100',       // 장미색 계열
//     'bg-amber-100',      // 앰버색 계열
//     'bg-slate-100',      // 슬레이트 계열
//     'bg-gray-100',       // 회색 계열
//     'bg-zinc-100',       // 아연색 계열
//     'bg-neutral-100',    // 중성색 계열
//     'bg-stone-100',      // 돌색 계열
//     'bg-yellow-50',      // 더 밝은 노란색
//     'bg-blue-50',        // 더 밝은 파란색
//     'bg-pink-50',        // 더 밝은 분홍색
//     'bg-green-50',       // 더 밝은 초록색
//     'bg-purple-50',      // 더 밝은 보라색
//     'bg-indigo-50',      // 더 밝은 남색
//     'bg-red-50',         // 더 밝은 빨간색
//     'bg-orange-50',      // 더 밝은 주황색
//     'bg-teal-50',        // 더 밝은 청록색
//     'bg-cyan-50',        // 더 밝은 하늘색
//     'bg-lime-50',        // 더 밝은 라임색
//     'bg-emerald-50',     // 더 밝은 에메랄드
//     'bg-sky-50',         // 더 밝은 하늘색
//     'bg-violet-50',      // 더 밝은 바이올렛
//     'bg-fuchsia-50',     // 더 밝은 자홍색
//     'bg-rose-50',        // 더 밝은 장미색
//     'bg-amber-50',       // 더 밝은 앰버색
//     'bg-yellow-200',     // 조금 더 진한 노란색
//     'bg-blue-200',       // 조금 더 진한 파란색
//     'bg-pink-200',       // 조금 더 진한 분홍색
//     'bg-green-200',      // 조금 더 진한 초록색
//     'bg-purple-200',     // 조금 더 진한 보라색
//     'bg-indigo-200',     // 조금 더 진한 남색
//     'bg-red-200',        // 조금 더 진한 빨간색
//     'bg-orange-200',     // 조금 더 진한 주황색
//     'bg-teal-200',       // 조금 더 진한 청록색
//     'bg-cyan-200',       // 조금 더 진한 하늘색
//   ];

//   const router = useRouter();
//   const [recommendationResult, setRecommendationResult] = useState<RecommendationOutput | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [exchangeRateInfo, setExchangeRateInfo] = useState<ExchangeRateData | null>(null);
  
//   const handleNext = () => {
//     router.replace('https://mimotok.cloud/hospital');
//     // router.replace('/estimate/SkinSurveyFlow/questionnaire/complete');
//   };

//   const handleBack = () => {
//     if (onComplete) {
//       onComplete();
//     }
//   };

//   useEffect(() => {
//     const processRecommendations = async () => {
//       // log.debug("MATCHING LOG: DiagnosisRecommend 시작");
//       // log.debug("MATCHING LOG: 전달받은 formData:", formData);
      
//       const startTime = Date.now();
//       const MINIMUM_LOADING_TIME = 3000; // 3초 최소 로딩 시간
      
//       // Update exchange rate at the beginning
//       await updateExchangeRate();
//       const currentExchangeRateInfo = getExchangeRateInfo();
//       setExchangeRateInfo(currentExchangeRateInfo);
//       log.debug("MATCHING LOG: Exchange rate info:", currentExchangeRateInfo);
      
//       if (formData) {
//         try {
//           // Map formData to recommendation algorithm parameters
//           const skinConcerns = formData.skinConcerns?.concerns?.map((concern: string) => ({ id: concern })) || [];
          
//           // Add subOptions for concerns that have them
//           if (formData.skinConcerns?.moreConcerns) {
//             skinConcerns.push({ id: "other", subOptions: [formData.skinConcerns.moreConcerns] });
//           }

//           const treatmentAreas = formData.treatmentAreas?.treatmentAreas || [];
//           if (formData.treatmentAreas?.otherAreas) {
//             treatmentAreas.push(formData.treatmentAreas.otherAreas);
//           }

//           // Map age range to age group
//           const ageRangeMap: Record<string, any> = {
//             "10s": "teens",
//             "20s": "20s",
//             "30s": "30s", 
//             "40s": "40s",
//             "50s": "50s",
//             "60s": "60s",
//             "70s": "70_plus"
//           };

//           const algorithmInput = {
//             skinTypeId: formData.skinType || "combination",
//             ageGroup: ageRangeMap[formData.userInfo?.ageRange] || undefined,
//             gender: formData.userInfo?.gender || undefined,
//             skinConcerns: skinConcerns,
//             treatmentGoals: formData.goals || [],
//             treatmentAreas: treatmentAreas,
//             budgetRangeId: formData.budget || "1000-5000", 
//             priorityId: formData.priorityOrder?.priorityOrder?.[0] || "effectiveness",
//             pastTreatments: formData.pastTreatments?.pastTreatments || ["none"],
//             medicalConditions: formData.healthConditions?.healthConditions || ["none"],
//           };

//           // log.debug("MATCHING LOG: 알고리즘에 전달할 입력:", algorithmInput);
//           // log.debug("MATCHING LOG: recommendTreatments 함수 호출 직전");
          
//           const result = recommendTreatments(algorithmInput);
          
//           // log.debug("MATCHING LOG: recommendTreatments 함수 호출 완료");
//           // log.debug("MATCHING LOG: 알고리즘 결과:", result);
          
//           // 결과 처리 완료 시간 계산
//           const elapsedTime = Date.now() - startTime;
//           const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsedTime);
          
//           // log.debug(`MATCHING LOG: 알고리즘 처리 시간: ${elapsedTime}ms, 추가 대기 시간: ${remainingTime}ms`);
          
//           // 최소 1초가 지나지 않았다면 나머지 시간만큼 더 기다림
//           if (remainingTime > 0) {
//             await new Promise(resolve => setTimeout(resolve, remainingTime));
//           }
          
//           setRecommendationResult(result);
//         } catch (error) {
//           console.error('MATCHING LOG: algorithm error:', error);
//           // console.error('MATCHING LOG: 에러 상세:', error);
//           setError(ERROR_MSG);
          
//           // 에러가 발생해도 최소 로딩 시간을 보장
//           const elapsedTime = Date.now() - startTime;
//           const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsedTime);
          
//           if (remainingTime > 0) {
//             await new Promise(resolve => setTimeout(resolve, remainingTime));
//           }
//         }
//       } else {
//         log.debug("MATCHING LOG: formData empty");
        
//         // formData가 없어도 최소 로딩 시간을 보장
//         const elapsedTime = Date.now() - startTime;
//         const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsedTime);
        
//         if (remainingTime > 0) {
//           await new Promise(resolve => setTimeout(resolve, remainingTime));
//         }
//       }
      
//       // log.debug("MATCHING LOG: 로딩 완료 설정");
//       setIsLoading(false);
//     };

//     processRecommendations();
//   }, [formData]);

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Header with back button */}
//       <div className="flex items-center p-4">
//         <Button 
//           variant="ghost" 
//           size="icon"
//           onClick={handleBack}
//           className="h-10 w-10 rounded-full"
//         >
//           <ChevronLeft className="h-6 w-6 text-gray-700" />
//         </Button>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-md mx-auto px-6 pb-8">
//         {/* Title Section */}
//         <div className="text-center mb-12">
//           <p className="text-pink-400 text-lg font-medium mb-4">Treatment Recommendation</p>
//           <h1 className="text-2xl font-bold text-gray-900 mb-4">
//             The Best Treatments<br />
//             for Your Skin Concerns
//           </h1>
//         </div>

//         {/* Face Icon */}
//         <div className="flex justify-center mb-8">
//           <Image
//             src="/estimate/diagnosis_face_icon.svg"
//             alt="Face Icon"
//             width={200}
//             height={200}
//             className="w-48 h-48"
//           />
//         </div>

//         {/* Subtitle */}
//         <div className="text-center mb-8">
//           <p className="text-gray-500 text-base mb-2">Personalized treatments.</p>
//           <p className="text-gray-500 text-base">Book your Korean clinic consultation today</p>
//         </div>

//         {/* Loading State */}
//         {isLoading ? (
//           <div className="text-center py-8">
//             <p className="text-gray-500">Analyzing your responses...</p>
//           </div>
//         ) : error ? (
//           <Card className="p-6 bg-red-50 border-red-200 mb-8">
//             <div className="text-center">
//               <h4 className="text-lg font-medium text-red-700 mb-4">⚠️ Analysis Error</h4>
//               <p className="text-sm text-red-600">{error}</p>
//             </div>
//           </Card>
//         ) : recommendationResult ? (
//           <>
//             {/* Treatment Cards */}
//             <div className="space-y-4 mb-8">
//               {recommendationResult.recommendations.length > 0 ? (
//                 recommendationResult.recommendations.map((treatment, index) => {
//                   const bgColor = bgColors[index % bgColors.length];
                  
//                   return (
//                     <div key={treatment.key} className={`${bgColor} rounded-xl p-4 flex items-center space-x-4`}>
//                       <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center">
//                         <div className="w-6 h-6 bg-orange-600 rounded-full"></div>
//                       </div>
//                       <div className="flex-1">
//                         <h3 className="font-semibold text-gray-900 text-lg capitalize">{treatment.label}</h3>
//                         <p className="text-gray-600 text-sm">{filterBudgetReasons(treatment.rationale).join(', ')}</p>
//                       </div>
//                     </div>
//                   );
//                 })
//               ) : (
//                 <div className="bg-yellow-100 rounded-xl p-4 text-center">
//                   <p className="text-yellow-700 font-medium">⚠️ No Specific Treatments Recommended</p>
//                   <p className="text-yellow-600 text-sm mt-2">
//                     {EMPTY_RESULT}
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Additional Algorithm Results - Hidden from main UI but accessible */}
//             <div className="space-y-4 mb-8">

//               {/* Excluded Treatments */}
//               {recommendationResult.excluded.length > 0 && (
//                 <Card className="p-4 bg-gray-50">
//                   <h4 className="text-sm font-medium text-gray-700 mb-3">❌ Excluded Treatments</h4>
//                   <div className="space-y-2">
//                     {recommendationResult.excluded.map((excluded) => (
//                       <div key={excluded.key} className="flex justify-between items-center text-xs">
//                         <span className="font-medium text-gray-700 capitalize">{excluded.label}</span>
//                         <span className="text-gray-600">{excluded.reason}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {/* Treatment Substitutions */}
//               {recommendationResult.substitutions.length > 0 && (
//                 <Card className="p-4 bg-blue-50">
//                   <h4 className="text-sm font-medium text-blue-700 mb-3">🔄 Treatment Substitutions</h4>
//                   <div className="space-y-2">
//                     {recommendationResult.substitutions.map((sub, index) => (
//                       <div key={index} className="text-xs">
//                         <span className="font-medium capitalize">{sub.from}</span>
//                         <span className="text-gray-600"> → </span>
//                         <span className="font-medium capitalize">{sub.to}</span>
//                         <span className="text-gray-600"> ({sub.reason})</span>
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {/* Important Notes */}
//               {recommendationResult.notes.length > 0 && (
//                 <Card className="p-4 bg-yellow-50 border-yellow-200">
//                   <h4 className="text-sm font-medium text-yellow-700 mb-3">📝 Important Notes</h4>
//                   <div className="space-y-1">
//                     {recommendationResult.notes.map((note, index) => (
//                       <p key={index} className="text-xs text-yellow-700">
//                         • {note}
//                       </p>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {/* Upgrade Suggestions */}
//               {recommendationResult.upgradeSuggestions.length > 0 && (
//                 <Card className="p-4 bg-green-50 border-green-200">
//                   <h4 className="text-sm font-medium text-green-700 mb-3">💡 Upgrade Suggestions</h4>
//                   <div className="space-y-1">
//                     {recommendationResult.upgradeSuggestions.map((suggestion, index) => (
//                       <p key={index} className="text-xs text-green-700">
//                         • {suggestion}
//                       </p>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {/* Cost Information */}
//               {recommendationResult.recommendations.length > 0 && (
//                 <Card className="p-4 bg-gray-50">
//                   <h4 className="text-sm font-medium text-gray-700 mb-3">💰 Cost Information</h4>
//                   <div className="space-y-2">
//                     {recommendationResult.recommendations.map((treatment) => (
//                       <div key={treatment.key} className="flex justify-between items-center text-xs">
//                         <span className="font-medium text-gray-700 capitalize">{treatment.label}</span>
//                         <div className="text-right">
//                           <p className="font-semibold text-gray-900">${treatment.priceUSD.toLocaleString()}</p>
//                           <p className="text-gray-500">₩{treatment.priceKRW.toLocaleString()}</p>
//                         </div>
//                       </div>
//                     ))}
//                     <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
//                       <span className="font-semibold text-gray-900 text-sm">Total Cost:</span>
//                       <div className="text-right">
//                         <p className="font-bold text-pink-600">${recommendationResult.totalPriceUSD.toLocaleString()}</p>
//                         <p className="text-xs text-gray-500">₩{recommendationResult.totalPriceKRW.toLocaleString()}</p>
//                       </div>
//                     </div>
//                     {exchangeRateInfo && (
//                       <div className="pt-2 mt-2 border-t border-gray-300 text-xs text-gray-600">
//                         <div className="flex justify-between items-center">
//                           <span>Exchange Rate:</span>
//                           <span>1 KRW = {exchangeRateInfo.rate.toFixed(6)} USD</span>
//                         </div>
//                         {/* <div className="flex justify-between items-center mt-1">
//                           <span>Source:</span>
//                           <span className={exchangeRateInfo.source === 'api' ? 'text-green-600' : 'text-yellow-600'}>
//                             {exchangeRateInfo.source === 'api' ? '🟢 Live API' : '🟡 Fallback'}
//                           </span>
//                         </div> */}
//                         {/* <div className="flex justify-between items-center mt-1">
//                           <span>Updated:</span>
//                           <span>{exchangeRateInfo.lastUpdated.toLocaleString('en-US', {
//                             month: 'short', 
//                             day: 'numeric', 
//                             hour: 'numeric', 
//                             minute: '2-digit',
//                             hour12: true
//                           })}</span>
//                         </div> */}
//                       </div>
//                     )}
//                   </div>
//                 </Card>
//               )}
//             </div>
//           </>
//         ) : (
//           <Card className="p-6 bg-blue-50 border-blue-200 mb-8">
//             <div className="text-center">
//               <h4 className="text-lg font-medium text-blue-700 mb-4">🔍 No Match Found</h4>
//               <p className="text-sm text-blue-600">
//                 We couldn&apos;t find the perfect treatment match with the current criteria.
//                 Share a bit more detail, and we&apos;ll provide a more refined, personalized recommendation.
//               </p>
//             </div>
//           </Card>
//         )}

//         {/* Book Button */}
//         <div className="sticky bottom-4">
//           <Button 
//             onClick={handleNext}
//             className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-2xl h-14 text-lg font-medium"
//           >
//             Book Your Consultation
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DiagnosisRecommend;