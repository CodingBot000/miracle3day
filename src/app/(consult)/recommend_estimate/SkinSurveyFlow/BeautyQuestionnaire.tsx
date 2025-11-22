import React, { isValidElement, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Heart, Star, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '../PageHeader';
import PreviewReport from './questionnaire/PreviewReport';
import { steps, questions } from '@/content/estimate/form-definition';
import { recommendTreatments, RecommendationOutput } from './questionnaire/questionScript/matching/index';
import RecommendationResult from '@/app/(consult)/recommend_estimate/SkinSurveyFlow/recommendation/RecommendationResult';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import { getLocalizedText } from '@/utils/i18n';

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
       UPLOAD_PHOTO,
        VISIT_PATHS, 
        AGE_RANGE,
        DEMOGRAPHICS_BASIC
      } from '@/constants/estimate_steps';
import { isValidEmail } from '@/utils/validators';
import { CountryCode, CountryInputDto } from '@/app/models/country-code.dto';
import { MessengerInput } from '@/components/atoms/input/InputMessengerFields';
import { log } from '@/utils/logger';
import { validateStepData, getValidationMessage, StepData } from '../validCheckForm';


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


interface StepComponentProps {
  data: StepData;
  onDataChange: (data: StepData) => void;
  onSkip?: () => void; // Skip 기능을 위한 optional prop
}

const BeautyQuestionnaire: React.FC = () => {
  const router = useRouter();
  const { language } = useCookieLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, StepData>>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isValideSendForm, setIsValideSendForm] = useState(false);
  const [recommendationOutput, setRecommendationOutput] = useState<RecommendationOutput | null>(null);
  const { toast } = useToast();

  // 현재 스텝의 유효성을 실시간으로 확인
  const isCurrentStepValid = () => {
    const currentStepData = formData[steps[currentStep].id] || {};
    return validateStepData(steps[currentStep].id, currentStepData);
  };

  const handleNext = () => {
    const currentStepData = formData[steps[currentStep].id] || {};
    
    log.debug('handleNext - currentStep:', currentStep);
    log.debug('handleNext - currentStepData:', currentStepData);
    log.debug('handleNext - validation result:', validateStepData(steps[currentStep].id, currentStepData));
    
    if (!validateStepData(steps[currentStep].id, currentStepData)) {
      setIsValideSendForm(false);
      toast({
        variant: "destructive",
        title: "Please make a required selection",
        description: getValidationMessage(steps[currentStep].id),
      
      }); 
      return;
    }

    if (currentStep < steps.length - 1) {
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
    const currentStepData = formData[steps[currentStep].id] || {};
    log.debug('currentStepData', currentStepData);
    if (!validateStepData(steps[currentStep].id, currentStepData)) {
      setIsValideSendForm(false);
      // log.debug('validateStepData currentStepData::', currentStepData);
      // log.debug('validateStepData currentStep::', currentStep);
      // log.debug('validateStepData steps[currentStep].id::', steps[currentStep].id);
      // log.debug('validateStepData launch toast message: ', getValidationMessage(steps[currentStep].id));
      toast({
        variant: "destructive",
        title: "Please make a required selection",
        description: getValidationMessage(steps[currentStep].id),
      });
      return;
    }

    setIsPreviewOpen(true);
    setIsValideSendForm(true);
  
    // log.debug('Questionnaire completed:', formData);
  };

  const CurrentStepComponent = steps[currentStep].component as React.ComponentType<StepComponentProps>;

  return (
    // <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
    <div className="min-h-screen">
      
      {/* Header */}
      <PageHeader 
        currentStep={currentStep} 
        totalSteps={steps.length} 
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
            {getLocalizedText(steps[currentStep].title, language)}
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
            {getLocalizedText(steps[currentStep].subtitle, language)}
          </p>
        </div>

        {/* <Card className="bg-white/70 backdrop-blur-sm border-rose-100 shadow-xl shadow-rose-100/20 animate-scale-in"> */}
        {/* <Card className="bg-white backdrop-blur-sm shadow-xl animate-scale-in"> */}
          {/* <div className="p-6 md:p-8"> */}
          <div>
            <CurrentStepComponent
              data={formData[steps[currentStep].id] || {}}
              onDataChange={(data: StepData) => handleStepData(steps[currentStep].id, data)}
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
            ) : currentStep === steps.length - 1 ? (
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

export default BeautyQuestionnaire;
