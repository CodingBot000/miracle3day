import React, { isValidElement, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Heart, Star, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/app/(consult)/pre_consultation_intake_form/PageHeader';
import PreviewReport from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/PreviewReport';
import RecommendationResult from '@/app/(consult)/recommend_estimate/SkinSurveyFlow/recommendation/RecommendationResult';
import { RecommendationOutput } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/types';
import { recommendTreatments } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching';
import { preConsultationSteps, questions } from '@/content/pre_consultation_intake/form-definition_pre_consultation';


import {
  USER_INFO,
   BUDGET,
    HEALTH_CONDITIONS,
     PREFERENCES,
     PRIORITYFACTORS,
     SKIN_CONCERNS,
      SKIN_TYPE,
      TREATMENT_EXPERIENCE_BEFORE,
      TREATMENT_GOALS,
       UPLOAD_PHOTO
      } from '@/constants/pre_consult_steps';
import { isValidEmail } from '@/utils/validators';
import { CountryCode, CountryInputDto } from '@/app/models/country-code.dto';
import { MessengerInput } from '@/components/atoms/input/InputMessengerFields';
import { log } from '@/utils/logger';


interface UserInfo {
  firstName: string;
  lastName: string;
  ageRange: string;
  gender: string;
  email: string;
  koreanPhoneNumber: number;
  country: string;
  messengers: MessengerInput[];
}



interface SkinConcerns {
  concerns: string[];
  moreConcerns?: string;
}

interface TreatmentAreas {
  treatmentAreas: string[];
  otherAreas?: string;
}

interface PriorityOrder {
  priorityOrder: string[];
  isPriorityConfirmed?: boolean;
}

interface PastTreatments {
  pastTreatments: string[];
  sideEffects?: string;
  additionalNotes?: string;
}

interface VisitPath {
  visitPath: string;
  otherPath?: string;
}

interface UploadImage {
  uploadedImage?: string; // base64 이미지 데이터
  imageFile?: File; // 실제 파일 객체
  imageFileName?: string; // 파일명
}

interface HealthConditions {
  healthConditions: string[];
  otherConditions?: string;
}

interface StepData {
  ageRange?: string;
  skinType?: string;
  skinConcerns?: SkinConcerns; 
  userInfo?: UserInfo;

  treatmentAreas?: TreatmentAreas;
  priorityOrder?: PriorityOrder;
  pastTreatments?: PastTreatments;
  budget?: string;
  goals?: string[];
  
  visitPath?: VisitPath;
  uploadImage?: UploadImage;
  healthConditions?: HealthConditions;
 
  timeframe?: string;  
}

// 각 스텝별 필수 선택 항목 검증 함수
const validateStepData = (stepId: string, data: StepData): boolean => {
  log.debug('validateStepData validateStepData stepId:', stepId);
  switch (stepId) {
    // case AGE_RANGE:
    //   return !!(
    //     data.ageRange
    //   );
    case SKIN_TYPE:
      return !!(
        data.skinType
      );
    case SKIN_CONCERNS:
      // 피부 타입과 피부 고민 모두 필수 선택
      const skinConcerns = data.skinConcerns;
      return !!(
        // data.skinType && // 피부 타입 선택 필수
        skinConcerns?.concerns && 
        skinConcerns.concerns.length > 0 // 피부 고민 1개 이상 선택 필수
      );
    
    case BUDGET:
      return !!(
        data.budget  // 예산 범위 선택 필수
      );
    case PREFERENCES:
      const treatmentAreas = data.treatmentAreas;
      return !!(
        treatmentAreas?.treatmentAreas && 
        treatmentAreas.treatmentAreas.length > 0  // 관리 부위 1개 이상 선택 필수
      );
    
      case PRIORITYFACTORS:
      
      const priorityOrder = data.priorityOrder;
      return !!(
        priorityOrder?.priorityOrder &&
        priorityOrder.priorityOrder.length > 0 && // 우선순위 확정 필수
        priorityOrder?.isPriorityConfirmed // 우선순위 확정 필수
      );
    

    case TREATMENT_GOALS:
      
      // log.debug(`treatment-goals  data.goals:${data.goals}  data.goals.length:${data.goals?.length} data.timeframe:${data.timeframe} pastTreatments:${pastTreatments?.pastTreatments}`);
      return !!(
        data.goals && 
        data.goals.length > 0
      );
    case TREATMENT_EXPERIENCE_BEFORE:
      const pastTreatments = data.pastTreatments;
      // log.debug(`treatment-goals  data.goals:${data.goals}  data.goals.length:${data.goals?.length} data.timeframe:${data.timeframe} pastTreatments:${pastTreatments?.pastTreatments}`);
      return !!(
        pastTreatments?.pastTreatments // 이전 치료 경험 선택 필수 (없는 경우도 빈 배열로 저장)
      );
    
    case HEALTH_CONDITIONS:
      return !!(data.healthConditions?.healthConditions && data.healthConditions.healthConditions.length > 0); // 건강 상태 선택 필수
    
    // case VISIT_PATHS:
    //   return !!data.visitPath?.visitPath; // 방문 경로 선택 필수
    
    // case USER_INFO:
      
    //   const userInfo = data.userInfo;
    //   if (!userInfo) return false;
      
    //   // Check if there's at least one messenger with a non-empty value
    //   const hasValidMessenger = userInfo.messengers && 
    //     userInfo.messengers.length > 0 && 
    //     userInfo.messengers.some((messenger: any) => messenger && messenger.value && messenger.value.trim() !== '');
      
    //   return !!(
    //     userInfo.firstName && 
    //     userInfo.lastName &&
    //     userInfo.ageRange &&
    //     userInfo.gender &&
    //     userInfo.email &&
    //     isValidEmail(userInfo.email) && 
    //     hasValidMessenger
    //   );
    case UPLOAD_PHOTO:
      // 파일이 업로드되었는지 확인
      return !!(
        data.uploadImage?.uploadedImage || data.uploadImage?.imageFile
      );
    default:
      return true;
  }
};

// 각 스텝별 필수 선택 항목 메시지
const getValidationMessage = (stepId: string): string => {
  switch (stepId) {
    // case AGE_RANGE:
    //   return 'Please select your age range.';
    case SKIN_TYPE:
      return 'Please select your skin type.';
    case SKIN_CONCERNS:
      return 'Please select concerns.';
    case BUDGET:
      return 'Please choose your budget range.';
    case PREFERENCES:
      return 'Please choose your treatment areas.';
    case PRIORITYFACTORS:
      return 'Please set your priorities.';
    case TREATMENT_GOALS:
      return 'Please select your treatment goals.';
    case TREATMENT_EXPERIENCE_BEFORE:
      return 'Please indicate any previous treatment history.';
    case HEALTH_CONDITIONS:
      return 'Please select your current health conditions.';
    // case VISIT_PATHS:
    //   return 'Please select how you found us.';
    // case USER_INFO:
    //   return 'Please fill in your name, age, gender, email address, and at least one messenger contact.';
    case UPLOAD_PHOTO:
      return 'Please post a picture to diagnose your skin.';
    default:
      return 'Please complete all required fields.';
  }
};

interface StepComponentProps {
  data: StepData;
  onDataChange: (data: StepData) => void;
  onSkip?: () => void; // Skip 기능을 위한 optional prop
}

const PreConsultationIntakeForm: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, StepData>>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isValideSendForm, setIsValideSendForm] = useState(false);
  const [recommendationOutput, setRecommendationOutput] = useState<RecommendationOutput | null>(null);
  const { toast } = useToast();

  // 현재 스텝의 유효성을 실시간으로 확인
  const isCurrentStepValid = () => {
    const currentStepData = formData[preConsultationSteps[currentStep].id] || {};
    return validateStepData(preConsultationSteps[currentStep].id, currentStepData);
  };

  const handleNext = () => {
    const currentStepData = formData[preConsultationSteps[currentStep].id] || {};
    
    log.debug('handleNext - currentStep:', currentStep);
    log.debug('handleNext - currentStepData:', currentStepData);
    log.debug('handleNext - validation result:', validateStepData(preConsultationSteps[currentStep].id, currentStepData));
    
    if (!validateStepData(preConsultationSteps[currentStep].id, currentStepData)) {
      setIsValideSendForm(false);
      toast({
        variant: "destructive",
        title: "Please make a required selection",
        description: getValidationMessage(preConsultationSteps[currentStep].id),
      
      }); 
      return;
    }

    if (currentStep < preConsultationSteps.length - 1) {
      log.debug('handleNext - moving to next step:', currentStep + 1);
      setCurrentStep(currentStep + 1);
      // 스크롤을 즉시 최상단으로 이동
      window.scrollTo(0, 0);
    }
  };

  const handleSkip = () => {
    // 0단계(이미지 업로드)에서만 Skip 버튼이 표시되므로
    // 이미지 없이 다음 단계로 이동
    if (currentStep === 0) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // 스크롤을 즉시 최상단으로 이동
      window.scrollTo(0, 0);
    } else {
      // 루트로 이동 (뒤로가기 히스토리에서 제거)
      router.replace('/');
    }
  };

  const handleStepData = (stepId: string, data: StepData) => {
    setFormData(prev => ({
      ...prev,
      [stepId]: data
    }));
  };

  const handleSubmit = () => {
    const currentStepData = formData[preConsultationSteps[currentStep].id] || {};
    log.debug('currentStepData', currentStepData);
    if (!validateStepData(preConsultationSteps[currentStep].id, currentStepData)) {
      setIsValideSendForm(false);
      // log.debug('validateStepData currentStepData::', currentStepData);
      // log.debug('validateStepData currentStep::', currentStep);
      // log.debug('validateStepData preConsultationSteps[currentStep].id::', preConsultationSteps[currentStep].id);
      // log.debug('validateStepData launch toast message: ', getValidationMessage(preConsultationSteps[currentStep].id));
      toast({
        variant: "destructive",
        title: "Please make a required selection",
        description: getValidationMessage(preConsultationSteps[currentStep].id),
      });
      return;
    }

    setIsPreviewOpen(true);
    setIsValideSendForm(true);
  
    // log.debug('Questionnaire completed:', formData);
  };

  const CurrentStepComponent = preConsultationSteps[currentStep].component as React.ComponentType<StepComponentProps>;

  return (
    // <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
    <div className="min-h-screen">
      
      {/* Header */}
      <PageHeader 
        currentStep={currentStep} 
        totalSteps={preConsultationSteps.length} 
        // onBack={currentStep > 0 ? handlePrevious : undefined}
        onBack={handlePrevious}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-32 ">
        <div className="mb-8">
          {/* {currentStep + 1 < steps.length ? (
          <h2 
            className="mb-3"
            style={{
              fontFamily: 'Pretendard Variable',
              fontWeight: 600,
              fontSize: '20px',
              lineHeight: '100%',
              color: '#111827'
            }}
            translate="no"
          >
            <span>{currentStep + 1}</span> / <span>{steps.length - 1}</span>
          </h2>
        ) : (
         <h2 
            className="mb-3"
            style={{
              fontFamily: 'Pretendard Variable',
              fontWeight: 500,
              fontSize: '20px',
              lineHeight: '140%',
              color: '#111827'
            }}
            translate="no"
          >
            Completion
          </h2>
         )} */}
          
          <h2 
            className="mb-3"
            style={{
              fontFamily: 'Pretendard Variable',
              fontWeight: 500,
              fontSize: '20px',
              lineHeight: '140%',
              color: '#111827'
            }}
          >
            {preConsultationSteps[currentStep].title}
          </h2>
          <p 
            className="max-w-2xl"
            style={{
              fontFamily: 'Pretendard Variable',
              fontWeight: 500,
              fontSize: '16px',
              lineHeight: '140%',
              color: '#888B93'
            }}
          >
            {preConsultationSteps[currentStep].subtitle}
          </p>
        </div>

        {/* <Card className="bg-white/70 backdrop-blur-sm border-rose-100 shadow-xl shadow-rose-100/20 animate-scale-in"> */}
        {/* <Card className="bg-white backdrop-blur-sm shadow-xl animate-scale-in"> */}
          {/* <div className="p-6 md:p-8"> */}
          <div>
            <CurrentStepComponent
              data={formData[preConsultationSteps[currentStep].id] || {}}
              onDataChange={(data: StepData) => handleStepData(preConsultationSteps[currentStep].id, data)}
              onSkip={currentStep === 0 ? handleSkip : undefined}
            />
          </div>
        {/* </Card> */}
      </div>

      {/* Navigation - Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md  shadow-lg">
        <div className="max-w-[768px] mx-auto px-4 sm:px-6 md:px-8 py-4">
          <div className="flex items-center gap-3">
            {currentStep === 0 ? (
              <>
            
              <Button 
                  onClick={(e) => {
                    log.debug('Next Button clicked!', e);
                    handleNext();
                  }}
                  disabled={!isCurrentStepValid()}
                  translate="no" 
                  className={`
                    flex-1 h-12 px-4 rounded-lg
                    flex items-center justify-center
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-1
                    transition-colors duration-150
                    ${!isCurrentStepValid() 
                      ? 'bg-[#E4E5E7] text-[#9E9E9E] cursor-not-allowed' 
                      : 'bg-[#FB718F] text-white hover:bg-[#F65E7D] active:bg-[#E95373]'
                    }
                  `}
                >
                  <span translate="no">Next</span>
                </Button>
              </>
            ) : currentStep === preConsultationSteps.length - 1 ? (
              <Button onClick={handleSubmit} 
                className="w-full h-12 px-4 rounded-lg text-white flex items-center justify-center"
                style={{ backgroundColor: '#FB718F' }}
              >
                Submit
              </Button>
            ) : (
              <>
                <Button
                  onClick={handlePrevious}
                  // className="w-25 h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-500 flex items-center justify-center"
                  // style={{ 
                  //   borderColor: '#E4E5E7',
                  //   color: '#777777',
                  //   fontFamily: 'Pretendard Variable',
                  //   fontWeight: 600,
                  //   fontSize: '16px',
                  //   lineHeight: '140%'
                  // }}
                  className="
                    h-12 px-4 rounded-lg
                    border bg-white text-[#777777] border-[#E4E5E7]
                    hover:bg-[#F7F7F8] hover:border-[#DADCE0] hover:text-[#555555]
                    active:bg-[#F1F2F4] active:border-[#C9CCD1] active:text-[#444444]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-1
                    transition-colors duration-150
                    flex items-center justify-center
                  "
                >
                  Previous
                </Button>
                <Button 
                  onClick={(e) => {
                    log.debug('Next Button clicked!', e);
                    handleNext();
                  }}
                  disabled={!isCurrentStepValid()}
                  translate="no" 
                  className={`
                    flex-1 h-12 px-4 rounded-lg
                    flex items-center justify-center
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-1
                    transition-colors duration-150
                    ${!isCurrentStepValid() 
                      ? 'bg-[#E4E5E7] text-[#9E9E9E] cursor-not-allowed' 
                      : 'bg-[#FB718F] text-white hover:bg-[#F65E7D] active:bg-[#E95373]'
                    }
                  `}
                >
                  <span translate="no">Next</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preview Floating Button */}
      {/* <div className="fixed inset-x-0 top-[calc(64px+12px)] z-50 pointer-events-none">
        <div className="relative mx-auto max-w-[768px] px-4">
          <Button
            onClick={() => setIsPreviewOpen(true)}
            className="
              absolute right-4 top-0
              bg-white hover:bg-rose-50 text-rose-500
              border border-rose-200 shadow-lg
              rounded-full p-4
              pointer-events-auto
            "
          >
            <FileText className="w-6 h-6" />
          </Button>
        </div>
      </div> */}
      
      
      {/* Preview Dialog */}
      <PreviewReport
        open={isPreviewOpen}
        showSendFormButton={isValideSendForm}
        onOpenChange={setIsPreviewOpen}
        formData={formData}
        onSubmissionComplete={(allStepData) => {
          setIsPreviewOpen(false);

          // Generate recommendations
          try {
            log.debug("=== Form Data for Recommendations ===");
            log.debug(allStepData);

            // Extract nested data structures
            const skinConcernsData = allStepData.skinConcerns?.concerns || [];
            const treatmentAreasData = allStepData.treatmentAreas?.treatmentAreas || [];
            const priorityOrderData = allStepData.priorityOrder?.priorityOrder || [];
            const pastTreatmentsData = allStepData.pastTreatments?.pastTreatments || ["none"];
            const healthConditionsData = allStepData.healthConditions?.healthConditions || ["none"];
            const userInfoData = allStepData.userInfo || {};

            log.debug("=== Extracted Data ===");
            log.debug("skinConcernsData:", skinConcernsData);
            log.debug("treatmentAreasData:", treatmentAreasData);
            log.debug("priorityOrderData:", priorityOrderData);
            log.debug("budget:", allStepData.budget);
            log.debug("goals:", allStepData.goals);
            log.debug("pastTreatmentsData:", pastTreatmentsData);
            log.debug("healthConditionsData:", healthConditionsData);

            // Map skinConcerns to include tier information
            const skinConcerns = skinConcernsData.map((concernId: string) => {
              const concernDef = questions.skinConcerns.find(c => c.id === concernId);
              return {
                id: concernId as any,
                tier: concernDef?.tier as 1 | 2 | 3 | 4 | undefined,
              };
            });

            const algorithmInput = {
              skinTypeId: allStepData.skinType || "combination",
              ageGroup: userInfoData.ageRange,
              gender: userInfoData.gender,
              skinConcerns: skinConcerns,
              treatmentGoals: allStepData.goals || [],
              treatmentAreas: treatmentAreasData,
              budgetRangeId: allStepData.budget || "1000-5000",
              priorityId: priorityOrderData[0] || "effectiveness",
              pastTreatments: pastTreatmentsData,
              medicalConditions: healthConditionsData,
            };

            log.debug("=== Algorithm Input ===");
            log.debug(algorithmInput);

            const output = recommendTreatments(algorithmInput);

            log.debug("=== Recommendation Output ===");
            log.debug("Recommendations count:", output.recommendations.length);
            log.debug("Total KRW:", output.totalPriceKRW);
            log.debug("Total USD:", output.totalPriceUSD);
            log.debug("Recommendations:", output.recommendations);
            log.debug("Excluded:", output.excluded);
            log.debug("Full output:", output);

            setRecommendationOutput(output);
          } catch (error) {
            log.error("Failed to generate recommendations:", error);
            toast({
              variant: "destructive",
              title: "Error generating recommendations",
              description: "Please try again",
            });
          }
        }}
      />

      {/* Recommendation Result Screen */}
      {recommendationOutput && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <RecommendationResult
            output={recommendationOutput}
            formData={formData}
            onFindClinics={() => {
              // Navigate to clinics page or show clinics
              // router.push('/clinics');
              // window.location.href = 'https://www.mimotok.cloud/hospital';
              window.open('https://www.mimotok.cloud/hospital', '_blank', 'noopener,noreferrer');
            }}
            onConsult={() => {
              // Open external consultation page in a new tab
              window.open('https://www.mimotok.cloud/hospital', '_blank', 'noopener,noreferrer');
            }}
          />
        </div>
      )}

      {/* Decorative Elements */}
      {/* <div className="fixed top-20 right-10 opacity-20 pointer-events-none">
        <Star className="w-8 h-8 text-rose-300 animate-pulse" />
      </div>
      <div className="fixed bottom-20 left-10 opacity-20 pointer-events-none">
        <Heart className="w-6 h-6 text-pink-300 animate-pulse" />
      </div> */}
    </div>
  );
};

export default PreConsultationIntakeForm;
