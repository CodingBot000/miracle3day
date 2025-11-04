'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// import { recommendTreatments, RecommendationOutput } from '../questionScript/matchingDiagnosis';
import { recommendTreatments, RecommendationOutput } from '../questionScript/matching/index';
import { log } from '@/utils/logger';

export default function CompleteStep() {
  const router = useRouter();
  const [recommendationResult, setRecommendationResult] = useState<RecommendationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleNext = () => {
      // router.replace('/'); // 항상 루트("/")로 이동
      router.replace('https://mimotok.cloud/hospital');
  };

  useEffect(() => {
    log.debug("MATCHING LOG: Complete 페이지 useEffect 시작");
    // Get form data from localStorage
    const savedFormData = localStorage.getItem('skinSurveyFormData');
    log.debug("MATCHING LOG: localStorage에서 가져온 데이터:", savedFormData);
    
    if (savedFormData) {
      try {
        const formData = JSON.parse(savedFormData);
        log.debug("MATCHING LOG: 파싱된 formData:", formData);
        
        // Map formData to recommendation algorithm parameters
        const skinConcerns = formData.skinConcerns?.concerns?.map((concern: string) => ({ id: concern })) || [];
        
        // Add subOptions for concerns that have them
        if (formData.skinConcerns?.moreConcerns) {
          skinConcerns.push({ id: "other", subOptions: [formData.skinConcerns.moreConcerns] });
        }

        const treatmentAreas = formData.treatmentAreas?.treatmentAreas || [];
        if (formData.treatmentAreas?.otherAreas) {
          treatmentAreas.push(formData.treatmentAreas.otherAreas);
        }

        // Map age range to age group
        const ageRangeMap: Record<string, any> = {
          "10s": "teens",
          "20s": "20s",
          "30s": "30s", 
          "40s": "40s",
          "50s": "50s",
          "60s": "60s",
          "70s": "70_plus"
        };

        const algorithmInput = {
          skinTypeId: formData.skinType || "combination",
          ageGroup: ageRangeMap[formData.userInfo?.ageRange] || undefined,
          gender: formData.userInfo?.gender || undefined,
          skinConcerns: skinConcerns,
          treatmentGoals: formData.goals || [],
          treatmentAreas: treatmentAreas,
          budgetRangeId: formData.budget || "1000-5000", 
          priorityId: formData.priorityOrder?.priorityOrder?.[0] || "effectiveness",
          pastTreatments: formData.pastTreatments?.pastTreatments || ["none"],
          medicalConditions: formData.healthConditions?.healthConditions || ["none"],
        };
        log.debug("MATCHING LOG: 알고리즘에 전달할 입력:", algorithmInput);
        log.debug("MATCHING LOG: recommendTreatments 함수 호출 직전");
        
        const result = recommendTreatments(algorithmInput);
        
        log.debug("MATCHING LOG: recommendTreatments 함수 호출 완료");
        log.debug("MATCHING LOG: 알고리즘 결과:", result);
        
        setRecommendationResult(result);
      } catch (error) {
        console.error('MATCHING LOG: 알고리즘 실행 중 에러:', error);
        console.error('MATCHING LOG: 에러 상세:', error);
      }
    } else {
      log.debug("MATCHING LOG: localStorage에 저장된 formData가 없음");
    }
    log.debug("MATCHING LOG: 로딩 완료 설정");
    setIsLoading(false);
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 space-y-8">
      
      <div className="mx-auto max-w-md px-4">
        {/* Header */}
        <header className="flex justify-center py-6">
            <Image
              src="/logo/logo_mimotok.svg"
              alt="logo"
              width={0}  // dummy
              height={0} // dummy
              style={{ width: "200px", height: "auto" }} // 기본값
             className="w-[200px] h-auto md:w-[300px] lg:w-[386px]"
            />
       
          {/* <div className="text-pink-500 font-bold text-2xl">
            MimoTok
          </div> */}
        </header>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            It&apos;s done!
          </h2>
          <p className="text-xl text-gray-900">
            doctor&apos;s doing the diagnosis
          </p>
        </div>

        {/* Diagnosis Card */}
        <div className="flex justify-center">
          <Image
            src="/estimate/diagnosis_goal.svg"
            alt="Diagnosis Goal"
            width={240}
            height={240}
          />
        </div>
        {/* Diagnosis algorithm result */ }


        {/* Information Text */}
        <div className="text-center space-y-4">
          <p className="text-gray-900 text-base">
            I will send the results to the contact information you filled out.
          </p>
          <p className="text-gray-500 text-sm">
            We’ll notify you as soon as your diagnostic is ready—usually within 24 hours. If diagnostic requests stack up, it can take up to 3 days.
          </p>

            {/* Highlighted Notice */}
          {/* <div className="mt-6 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 shadow-sm">
            <p className="text-rose-700 font-semibold text-sm md:text-base">
              Also, our professional skin consultation and recommendation web service will be launching soon within this month, so stay tuned!
            </p>
          </div> */}
        </div>
      </div>

      {/* Next Button */}
      <div className="pt-8">
        <Button 
          onClick={handleNext}
          className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-lg h-12 text-base font-medium"
        >
          next
        </Button>
      </div>
    </div>
  );
}