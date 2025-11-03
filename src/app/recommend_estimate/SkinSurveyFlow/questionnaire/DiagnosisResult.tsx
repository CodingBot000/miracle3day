// import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { recommendTreatments, RecommendationOutput } from './questionScript/matchingDiagnosis';
// import { log } from '@/utils/logger';

// interface DiagnosisResultProps {
//   formData: Record<string, any>;
//   onComplete: () => void;
// }

// const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ formData, onComplete }) => {
//   const ERROR_MSG = "We apologize for the inconvenience. Our team is working to resolve the issue quickly to ensure the best experience. Please try again shortly.";
//   const EMPTY_RESULT = "Based on your responses, we couldn't identify specific treatments at this time. This could be due to your current skin condition, recent treatment history, or other factors.";
//   const router = useRouter();
//   const [recommendationResult, setRecommendationResult] = useState<RecommendationOutput | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   const handleNext = () => {
//     // router.replace('/estimate/SkinSurveyFlow/questionnaire/complete');
//     router.replace('https://mimotok.com/hospital-list');
//   };

//   useEffect(() => {
//     log.debug("MATCHING LOG: DiagnosisResult 시작");
//     log.debug("MATCHING LOG: 전달받은 formData:", formData);
    
//     if (formData) {
//       const startTime = Date.now();
//       let algorithmCompleted = false;
//       let algorithmResult: RecommendationOutput | null = null;
      
//       try {
//         // Map formData to recommendation algorithm parameters
//         const skinConcerns = formData.skinConcerns?.concerns?.map((concern: string) => ({ id: concern })) || [];
        
//         // Add subOptions for concerns that have them
//         if (formData.skinConcerns?.moreConcerns) {
//           skinConcerns.push({ id: "other", subOptions: [formData.skinConcerns.moreConcerns] });
//         }

//         const treatmentAreas = formData.treatmentAreas?.treatmentAreas || [];
//         if (formData.treatmentAreas?.otherAreas) {
//           treatmentAreas.push(formData.treatmentAreas.otherAreas);
//         }

//         // Map age range to age group
//         const ageRangeMap: Record<string, any> = {
//           "10s": "teens",
//           "20s": "20s",
//           "30s": "30s", 
//           "40s": "40s",
//           "50s": "50s",
//           "60s": "60s",
//           "70s": "70_plus"
//         };

//         const algorithmInput = {
//           skinTypeId: formData.skinType || "combination",
//           ageGroup: ageRangeMap[formData.userInfo?.ageRange] || undefined,
//           gender: formData.userInfo?.gender || undefined,
//           skinConcerns: skinConcerns,
//           treatmentGoals: formData.goals || [],
//           treatmentAreas: treatmentAreas,
//           budgetRangeId: formData.budget || "1000-5000", 
//           priorityId: formData.priorityOrder?.priorityOrder?.[0] || "effectiveness",
//           pastTreatments: formData.pastTreatments?.pastTreatments || ["none"],
//           medicalConditions: formData.healthConditions?.healthConditions || ["none"],
//         };

//         // log.debug("MATCHING LOG: 알고리즘에 전달할 입력:", algorithmInput);
//         // log.debug("MATCHING LOG: recommendTreatments 함수 호출 직전");
        
//         const result = recommendTreatments(algorithmInput);
        
//         // log.debug("MATCHING LOG: recommendTreatments 함수 호출 완료");
//         // log.debug("MATCHING LOG: 알고리즘 결과:", result);
        
//         algorithmResult = result;
//         algorithmCompleted = true;
        
//         const elapsedTime = Date.now() - startTime;
        
//         if (elapsedTime >= 3000) {
//           // 3초 이상 걸렸으면 바로 결과 표시
//           // log.debug("MATCHING LOG: 알고리즘이 3초 이상 걸림 - 즉시 결과 표시");
//           setRecommendationResult(result);
//           setIsLoading(false);
//         } else {
//           // 3초 미만이면 나머지 시간동안 로딩 유지
//           const remainingTime = 3000 - elapsedTime;
//           // log.debug(`MATCHING LOG: 알고리즘 완료 (${elapsedTime}ms) - ${remainingTime}ms 후 결과 표시`);
          
//           setTimeout(() => {
//             setRecommendationResult(result);
//             setIsLoading(false);
//             // log.debug("MATCHING LOG: 3초 경과 - 결과 표시");
//           }, remainingTime);
//         }
        
//       } catch (error) {
//         console.error('MATCHING LOG: algorithm error:', error);
//         setError(ERROR_MSG);
        
//         // 에러 발생시에도 3초 기준 적용
//         const elapsedTime = Date.now() - startTime;
//         if (elapsedTime >= 3000) {
//           setIsLoading(false);
//         } else {
//           const remainingTime = 3000 - elapsedTime;
//           setTimeout(() => {
//             setIsLoading(false);
//           }, remainingTime);
//         }
//       }
//     } else {
//       // log.debug("MATCHING LOG: formData가 없음");
//       setIsLoading(false);
//     }
//   }, [formData]);

//   return (
//     <div className="max-w-md mx-auto p-6 space-y-8">
//       {/* Header */}
//       <div className="text-center">
//         <h1 className="text-2xl font-light text-pink-400 mb-8">
//           MimoTok
//         </h1>
//       </div>

//       {/* Main Content */}
//       <div className="space-y-8">
//         {/* Title */}
//         <div className="text-center space-y-2">
//           <h2 className="text-2xl font-bold text-gray-900">
//             Your Diagnosis Results
//           </h2>
//           <p className="text-xl text-gray-900">
//             Based on your skin analysis
//           </p>
//         </div>

//         {/* Diagnosis Card */}
//         <div className="flex justify-center">
//           <Image
//             src="/estimate/diagnosis_goal.svg"
//             alt="Diagnosis Goal"
//             width={240}
//             height={240}
//           />
//         </div>

//         {/* Diagnosis algorithm result */}
//         {isLoading ? (
//           <div className="text-center">
//             <p className="text-gray-500">Analyzing your responses...</p>
//           </div>
//         ) : error ? (
//           <Card className="p-6 bg-red-50 border-red-200">
//             <div className="text-center">
//               <h4 className="text-lg font-medium text-red-700 mb-4">⚠️ Analysis Error</h4>
//               <p className="text-sm text-red-600">{error}</p>
//             </div>
//           </Card>
//         ) : recommendationResult ? (
//           <div className="space-y-6">
//             <div className="text-center">
//               <h3 className="text-xl font-semibold text-gray-900 mb-4">
//                 Your Personalized Treatment Recommendations
//               </h3>
//             </div>
            
//             {/* Recommended Treatments */}
//             {recommendationResult.recommendations.length > 0 ? (
//               <Card className="p-6">
//                 <h4 className="text-lg font-medium text-gray-900 mb-4">💊 Recommended Treatments</h4>
//                 <div className="space-y-3">
//                   {recommendationResult.recommendations.map((treatment) => (
//                     <div key={treatment.key} className="flex justify-between items-start border-b border-gray-100 pb-3 last:border-b-0">
//                       <div className="flex-1">
//                         <h5 className="font-medium text-gray-900 capitalize">{treatment.label}</h5>
//                         <p className="text-sm text-gray-600">{treatment.rationale.join(', ')}</p>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-semibold text-gray-900">${treatment.priceUSD.toLocaleString()}</p>
//                         <p className="text-xs text-gray-500">₩{treatment.priceKRW.toLocaleString()}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="mt-4 pt-4 border-t border-gray-200">
//                   <div className="flex justify-between items-center">
//                     <span className="text-lg font-semibold text-gray-900">Total Cost:</span>
//                     <div className="text-right">
//                       <p className="text-xl font-bold text-pink-600">${recommendationResult.totalPriceUSD.toLocaleString()}</p>
//                       <p className="text-sm text-gray-500">₩{recommendationResult.totalPriceKRW.toLocaleString()}</p>
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             ) : (
//               <Card className="p-6 bg-yellow-50 border-yellow-200">
//                 <h4 className="text-lg font-medium text-yellow-700 mb-2">⚠️ No Specific Treatments Recommended</h4>
//                 <p className="text-sm text-yellow-700">
//                   {EMPTY_RESULT}
//                 </p>
//               </Card>
//             )}

//             {/* Excluded Treatments */}
//             {recommendationResult.excluded.length > 0 && (
//               <Card className="p-6 bg-gray-50">
//                 <h4 className="text-lg font-medium text-gray-700 mb-4">❌ Excluded Treatments</h4>
//                 <div className="space-y-2">
//                   {recommendationResult.excluded.map((excluded) => (
//                     <div key={excluded.key} className="flex justify-between items-center">
//                       <span className="font-medium text-gray-700 capitalize">{excluded.label}</span>
//                       <span className="text-sm text-gray-600">{excluded.reason}</span>
//                     </div>
//                   ))}
//                 </div>
//               </Card>
//             )}

//             {/* Treatment Substitutions */}
//             {recommendationResult.substitutions.length > 0 && (
//               <Card className="p-6 bg-blue-50">
//                 <h4 className="text-lg font-medium text-blue-700 mb-4">🔄 Treatment Substitutions</h4>
//                 <div className="space-y-2">
//                   {recommendationResult.substitutions.map((sub, index) => (
//                     <div key={index} className="text-sm">
//                       <span className="font-medium capitalize">{sub.from}</span>
//                       <span className="text-gray-600"> → </span>
//                       <span className="font-medium capitalize">{sub.to}</span>
//                       <span className="text-gray-600"> ({sub.reason})</span>
//                     </div>
//                   ))}
//                 </div>
//               </Card>
//             )}

//             {/* Important Notes */}
//             {recommendationResult.notes.length > 0 && (
//               <Card className="p-6 bg-yellow-50 border-yellow-200">
//                 <h4 className="text-lg font-medium text-yellow-700 mb-4">📝 Important Notes</h4>
//                 <div className="space-y-2">
//                   {recommendationResult.notes.map((note, index) => (
//                     <p key={index} className="text-sm text-yellow-700">
//                       • {note}
//                     </p>
//                   ))}
//                 </div>
//               </Card>
//             )}

//             {/* Upgrade Suggestions */}
//             {recommendationResult.upgradeSuggestions.length > 0 && (
//               <Card className="p-6 bg-green-50 border-green-200">
//                 <h4 className="text-lg font-medium text-green-700 mb-4">💡 Upgrade Suggestions</h4>
//                 <div className="space-y-2">
//                   {recommendationResult.upgradeSuggestions.map((suggestion, index) => (
//                     <p key={index} className="text-sm text-green-700">
//                       • {suggestion}
//                     </p>
//                   ))}
//                 </div>
//               </Card>
//             )}
//           </div>
//         ) : (
//           <Card className="p-6 bg-blue-50 border-blue-200">
//             <div className="text-center">
//               <h4 className="text-lg font-medium text-blue-700 mb-4">🔍 No Match Found</h4>
//               <p className="text-sm text-blue-600">
//                 We couldn't find the perfect treatment match with the current criteria. 
//                 Share a bit more detail, and we'll provide a more refined, personalized recommendation.
//               </p>
//             </div>
//           </Card>
//         )}
//       </div>

//       {/* Next Button */}
//       <div className="pt-8">
//         <Button 
//           onClick={handleNext}
//           className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-lg h-12 text-base font-medium"
//         >
//           Continue
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default DiagnosisResult;