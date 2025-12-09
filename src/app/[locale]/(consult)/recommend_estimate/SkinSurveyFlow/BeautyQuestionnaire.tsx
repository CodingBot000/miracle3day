import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '../PageHeader';
import PreviewReport from './questionnaire/PreviewReport';
import { questions } from '@/app/[locale]/(consult)/recommend_estimate/estimate/form-definition_questions';
import { steps } from '@/app/[locale]/(consult)/recommend_estimate/estimate/form-definition_steps';
import { recommendTreatments } from './questionnaire/questionScript/matching/index';
import { useLocale } from 'next-intl';
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

import { log } from '@/utils/logger';
import { validateStepData, getValidationMessage } from '../validCheckForm';
import SkinTypeStep from './questionnaire/SkinTypeStep';
import SkinConcernsStep from './questionnaire/SkinConcernsStep';
import TreatmentGoalsStep from './questionnaire/TreatmentGoalsStep';
import VisitPathStep from './questionnaire/VisitPathStep';
import DemographicsBasic from './questionnaire/DemographicsBasic';
import TreatmentExpBeforeStep from './questionnaire/TreatmentExpBefore';
import PrioriotyFactorStep from './questionnaire/PrioriotyFactorStep';
import PreferencesStep from './questionnaire/PreferencesStep';
import HealthConditionStep from './questionnaire/HealthConditionStep';
import BudgetStep from './questionnaire/BudgetStep';
import { StepData } from '../../models/recommend_estimate.dto';



interface StepComponentProps {
  data: StepData;
  onDataChange: (data: StepData) => void;
  onSkip?: () => void; // Skip 기능을 위한 optional prop
}

const RESULT_STORAGE_KEY = 'recommendation_result';
const FORM_DATA_STORAGE_KEY = 'recommendation_form_data';

const BeautyQuestionnaire: React.FC = () => {
  const router = useRouter();
  const locale = useLocale();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, StepData>>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isValideSendForm, setIsValideSendForm] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
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

  // useMemo로 현재 스텝 컴포넌트를 메모이제이션
  const CurrentStepComponent = React.useMemo(() => {
    const curStepId = steps[currentStep].id;

    switch (curStepId) {
      case SKIN_TYPE:
        return SkinTypeStep as React.ComponentType<StepComponentProps>;
      case SKIN_CONCERNS:
        return SkinConcernsStep as React.ComponentType<StepComponentProps>;
      case TREATMENT_GOALS:
        return TreatmentGoalsStep as React.ComponentType<StepComponentProps>;
      case BUDGET:
        return BudgetStep as React.ComponentType<StepComponentProps>;
      case HEALTH_CONDITIONS:
        return HealthConditionStep as React.ComponentType<StepComponentProps>;
      case PREFERENCES:
        return PreferencesStep as React.ComponentType<StepComponentProps>;
      case PRIORITYFACTORS:
        return PrioriotyFactorStep as React.ComponentType<StepComponentProps>;
      case TREATMENT_EXPERIENCE_BEFORE:
        return TreatmentExpBeforeStep as React.ComponentType<StepComponentProps>;
      case DEMOGRAPHICS_BASIC:
        return DemographicsBasic as React.ComponentType<StepComponentProps>;
      case VISIT_PATHS:
        return VisitPathStep as React.ComponentType<StepComponentProps>;
      default:
        throw new Error(`Unknown step: ${curStepId}`);
    }
  }, [currentStep]);

  // 네비게이션 중일 때 흰 화면 표시
  if (isNavigating) {
    return (
      <div className="fixed inset-0 bg-white z-50" />
    );
  }

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
            {getLocalizedText(steps[currentStep].title, locale)}
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
            {getLocalizedText(steps[currentStep].subtitle, locale)}
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
                  onClick={handlePrevious}

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
            ) : currentStep === steps.length - 1 ? (
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
                
              <Button onClick={handleSubmit} 
                className="w-full h-12 px-4 rounded-lg text-white flex items-center justify-center"
                style={{ backgroundColor: '#FB718F' }}
              >
                Submit
              </Button>
              </>
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
        onNavigateStart={() => setIsNavigating(true)}
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
            const demographicsBasicData = allStepData.demographicsBasic || {};

            log.debug("=== Extracted Data ===");
            log.debug("skinConcernsData:", skinConcernsData);
            log.debug("treatmentAreasData:", treatmentAreasData);
            log.debug("priorityOrderData:", priorityOrderData);
            log.debug("budget:", allStepData.budget);
            log.debug("goals:", allStepData.goals);
            log.debug("pastTreatmentsData:", pastTreatmentsData);
            log.debug("healthConditionsData:", healthConditionsData);
            log.debug("demographicsBasicData:", demographicsBasicData);

            // Map skinConcerns to include tier information
            const skinConcerns = skinConcernsData.map((concernId: string) => {
              const concernDef = questions.skinConcerns.find(c => c.id === concernId);
              return {
                id: concernId as any,
                tier: concernDef?.tier as 1 | 2 | 3 | 4 | undefined,
              };
            });

            // ageGroup, gender는 demographicsBasic에서 우선 가져오고, 없으면 userInfo에서 가져옴 (레거시 호환)
            const algorithmInput = {
              skinTypeId: allStepData.skinType || "combination",
              ageGroup: demographicsBasicData.age_group || userInfoData.ageRange,
              gender: demographicsBasicData.gender || userInfoData.gender,
              ethnicity: demographicsBasicData.ethnic_background,
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

            // sessionStorage에 결과 저장
            sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(output));
            sessionStorage.setItem(FORM_DATA_STORAGE_KEY, JSON.stringify(formData));

            // 결과 페이지로 이동 (replace로 설문 페이지를 히스토리에서 제거)
            router.replace('/recommend_estimate/SkinSurveyFlow/recommendation/result');
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
    </div>
  );
};

export default BeautyQuestionnaire;
