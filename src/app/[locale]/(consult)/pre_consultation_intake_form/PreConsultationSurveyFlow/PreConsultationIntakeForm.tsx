import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useConsultFormStorage } from '../../common/formStorage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/app/[locale]/(consult)/pre_consultation_intake_form/PageHeader';
import PreviewReport from '@/app/[locale]/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/PreviewReport';
import { preConsultationSteps } from '@/app/[locale]/(consult)/pre_consultation_intake_form/pre_consultation_intake/form-definition_pre_con_steps';
import { intakeForm } from '@/app/[locale]/(consult)/pre_consultation_intake_form/pre_consultation_intake/form-definition_pre_con_base';
import { useLocale } from 'next-intl';
import { getLocalizedText } from '@/utils/i18n';
import ConsultationGuidePage from './ConsultationGuidePage';


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
       VIDEO_CONSULT_SCHEDULE
      } from '@/constants/pre_consult_steps';
import { isValidEmail } from '@/utils/validators';
import { CountryCode, CountryInputDto } from '@/models/country-code.dto';
import { log } from '@/utils/logger';
import { validateStepData, getValidationMessage } from '../validCheckForm';

import SkinTypeStep from './questionnaire/SkinTypeStep';
import SkinConcernsStep from './questionnaire/SkinConcernsStep';
import TreatmentGoalsStep from './questionnaire/TreatmentGoalsStep';
// import DemographicsBasic from './questionnaire/DemographicsBasic';
import TreatmentExpBeforeStep from './questionnaire/TreatmentExpBefore';
import PrioriotyFactorStep from './questionnaire/PrioriotyFactorStep';
import PreferencesStep from './questionnaire/PreferencesStep';
import HealthConditionStep from './questionnaire/HealthConditionStep';
import BudgetStep from './questionnaire/BudgetStep';
import { StepData } from '../../models/recommend_estimate.dto';
import UserInfo from './questionnaire/UserInfoStep';
import VideoConsultScheduleStep from './questionnaire/VideoConsultScheduleStep';
import UploadImageStep from './questionnaire/UploadImageStep';

interface StepComponentProps {
  data: StepData;
  onDataChange: (data: StepData) => void;
  onSkip?: () => void; // Skip 기능을 위한 optional prop
}

const PreConsultationIntakeForm: React.FC = () => {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, StepData>>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isValideSendForm, setIsValideSendForm] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const { toast } = useToast();
  const { loadStoredData, saveData } = useConsultFormStorage('preConsult');

  // Get returnUrl from query parameter, default to home if not provided
  const returnUrl = searchParams.get('returnUrl') || `/${locale}`;

  // 컴포넌트 마운트 시 저장된 데이터 불러오기
  useEffect(() => {
    const stored = loadStoredData();
    if (stored && Object.keys(stored).length > 0) {
      setFormData(stored);
      log.debug('Loaded stored form data:', stored);
    }
    setIsInitialized(true);
  }, [loadStoredData]);

  // Browser History API - Android 뒤로가기 버튼 대응
  useEffect(() => {
    // 초기 상태 설정 (step 0)
    window.history.replaceState({ step: 0 }, '', `#step-0`);

    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.step !== undefined) {
        // 히스토리에서 step 정보가 있으면 해당 step으로 이동
        setCurrentStep(event.state.step);
        window.scrollTo(0, 0);
      } else {
        // step 정보가 없으면 (step 0에서 뒤로가기) 페이지 나가기
        router.replace(returnUrl);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router, returnUrl]);

  // formData 변경 시 자동 저장 (초기화 완료 후에만)
  useEffect(() => {
    if (isInitialized && Object.keys(formData).length > 0) {
      saveData(formData);
    }
  }, [formData, saveData, isInitialized]);

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
        title: getLocalizedText(intakeForm.pcif1, locale),
        description: getValidationMessage(preConsultationSteps[currentStep].id),

      });
      return;
    }

    if (currentStep < preConsultationSteps.length - 1) {
      const nextStep = currentStep + 1;
      log.debug('handleNext - moving to next step:', nextStep);
      setCurrentStep(nextStep);
      // 브라우저 히스토리에 상태 추가 (Android 뒤로가기 대응)
      window.history.pushState({ step: nextStep }, '', `#step-${nextStep}`);
      // 스크롤을 즉시 최상단으로 이동
      window.scrollTo(0, 0);
    }
  };

  const handleSkip = () => {
    // 0단계(이미지 업로드)에서만 Skip 버튼이 표시되므로
    // 이미지 없이 다음 단계로 이동
    if (currentStep === 0) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // 브라우저 히스토리에 상태 추가 (Android 뒤로가기 대응)
      window.history.pushState({ step: nextStep }, '', `#step-${nextStep}`);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      // 브라우저 히스토리 뒤로가기 (popstate 이벤트가 처리)
      window.history.back();
    } else {
      // step 0에서 뒤로가기 = 페이지 나가기
      router.replace(returnUrl);
    }
  };

  const handleStepData = (stepId: string, data: StepData) => {
    setFormData(prev => ({
      ...prev,
      [stepId]: data
    }));
  };

  const handleSubmit = () => {
    log.debug('handleSubmit called - currentStep:', currentStep);
    log.debug('handleSubmit - preConsultationSteps.length:', preConsultationSteps.length);
    log.debug('handleSubmit - stepId:', preConsultationSteps[currentStep].id);
    const currentStepData = formData[preConsultationSteps[currentStep].id] || {};
    log.debug('handleSubmit - currentStepData:', currentStepData);
    log.debug('handleSubmit - validation result:', validateStepData(preConsultationSteps[currentStep].id, currentStepData));
    if (!validateStepData(preConsultationSteps[currentStep].id, currentStepData)) {
      setIsValideSendForm(false);
      // log.debug('validateStepData currentStepData::', currentStepData);
      // log.debug('validateStepData currentStep::', currentStep);
      // log.debug('validateStepData preConsultationSteps[currentStep].id::', preConsultationSteps[currentStep].id);
      // log.debug('validateStepData launch toast message: ', getValidationMessage(preConsultationSteps[currentStep].id));
      toast({
        variant: "destructive",
        title: getLocalizedText(intakeForm.pcif1, locale),
        description: getValidationMessage(preConsultationSteps[currentStep].id),
      });
      return;
    }

    setIsPreviewOpen(true);
    setIsValideSendForm(true);
  
    // log.debug('Questionnaire completed:', formData);
  };

  // const CurrentStepComponent = preConsultationSteps[currentStep].component as React.ComponentType<StepComponentProps>;
 const CurrentStepComponent = React.useMemo(() => {
    const curStepId = preConsultationSteps[currentStep].id;

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
      case USER_INFO:
        return UserInfo as React.ComponentType<StepComponentProps>;
      case UPLOAD_PHOTO:
        return UploadImageStep as React.ComponentType<StepComponentProps>;
      case VIDEO_CONSULT_SCHEDULE:
        return VideoConsultScheduleStep as React.ComponentType<StepComponentProps>;
      // case DEMOGRAPHICS_BASIC:
      //   return DemographicsBasic as React.ComponentType<StepComponentProps>;
      // case VISIT_PATHS:
      //   return VisitPathStep as React.ComponentType<StepComponentProps>;
      default:
        throw new Error(`Unknown step: ${curStepId}`);
    }
  }, [currentStep]);
  return (
    // <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
    <div className="min-h-screen">
      
      {/* Header */}
      <PageHeader
        currentStep={currentStep}
        totalSteps={preConsultationSteps.length}
        // onBack={currentStep > 0 ? handlePrevious : undefined}
        onBack={handlePrevious}
        onOpenGuide={() => setShowGuideModal(true)}
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
            {getLocalizedText(preConsultationSteps[currentStep].title, locale)}
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
            {getLocalizedText(preConsultationSteps[currentStep].subtitle, locale)}
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
                  <span translate="no">{getLocalizedText(intakeForm.pcif2, locale)}</span>
                </Button>
              </>
            ) : currentStep === preConsultationSteps.length - 1 ? (
              <Button onClick={handleSubmit}
                className="w-full h-12 px-4 rounded-lg text-white flex items-center justify-center"
                style={{ backgroundColor: '#FB718F' }}
              >
                {getLocalizedText(intakeForm.pcif3, locale)}
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
                  {getLocalizedText(intakeForm.pcif4, locale)}
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
                  <span translate="no">{getLocalizedText(intakeForm.pcif2, locale)}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>


      {/* Preview Dialog */}
      <PreviewReport
        open={isPreviewOpen}
        showSendFormButton={isValideSendForm}
        onOpenChange={setIsPreviewOpen}
        formData={formData}
        returnUrl={returnUrl}
        onSubmissionComplete={(allStepData) => {
          setIsPreviewOpen(false);

          // // Generate recommendations
          // try {
          //   log.debug("=== Form Data for Recommendations ===");
          //   log.debug(allStepData);

          //   // Extract nested data structures
          //   const skinConcernsData = allStepData.skinConcerns?.concerns || [];
          //   const treatmentAreasData = allStepData.treatmentAreas?.treatmentAreas || [];
          //   const priorityOrderData = allStepData.priorityOrder?.priorityOrder || [];
          //   const pastTreatmentsData = allStepData.pastTreatments?.pastTreatments || ["none"];
          //   const healthConditionsData = allStepData.healthConditions?.healthConditions || ["none"];
          //   const userInfoData = allStepData.userInfo || {};

          //   log.debug("=== Extracted Data ===");
          //   log.debug("skinConcernsData:", skinConcernsData);
          //   log.debug("treatmentAreasData:", treatmentAreasData);
          //   log.debug("priorityOrderData:", priorityOrderData);
          //   log.debug("budget:", allStepData.budget);
          //   log.debug("goals:", allStepData.goals);
          //   log.debug("pastTreatmentsData:", pastTreatmentsData);
          //   log.debug("healthConditionsData:", healthConditionsData);

          //   // Map skinConcerns to include tier information
          //   const skinConcerns = skinConcernsData.map((concernId: string) => {
          //     const concernDef = questions.skinConcerns.find(c => c.id === concernId);
          //     return {
          //       id: concernId as any,
          //       tier: concernDef?.tier as 1 | 2 | 3 | 4 | undefined,
          //     };
          //   });

          //   const algorithmInput = {
          //     skinTypeId: allStepData.skinType || "combination",
          //     ageGroup: userInfoData.ageRange,
          //     gender: userInfoData.gender,
          //     skinConcerns: skinConcerns,
          //     treatmentGoals: allStepData.goals || [],
          //     treatmentAreas: treatmentAreasData,
          //     budgetRangeId: allStepData.budget || "1000-5000",
          //     priorityId: priorityOrderData[0] || "effectiveness",
          //     pastTreatments: pastTreatmentsData,
          //     medicalConditions: healthConditionsData,
          //   };

          //   log.debug("=== Algorithm Input ===");
          //   log.debug(algorithmInput);

          //   const output = recommendTreatments(algorithmInput);

          //   log.debug("=== Recommendation Output ===");
          //   log.debug("Recommendations count:", output.recommendations.length);
          //   log.debug("Total KRW:", output.totalPriceKRW);
          //   log.debug("Total USD:", output.totalPriceUSD);
          //   log.debug("Recommendations:", output.recommendations);
          //   log.debug("Excluded:", output.excluded);
          //   log.debug("Full output:", output);

          // } catch (error) {
          //   log.error("Failed to generate recommendations:", error);
          //   toast({
          //     variant: "destructive",
          //     title: "Error generating recommendations",
          //     description: "Please try again",
          //   });
          // }
        }}
      />

      {/* Guide Modal */}
      <Dialog open={showGuideModal} onOpenChange={setShowGuideModal}>
        <DialogContent className="max-w-md p-0 overflow-hidden [&>button]:hidden max-h-[90vh] overflow-y-auto">
          <ConsultationGuidePage
            locale={locale}
            onStart={() => setShowGuideModal(false)}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default PreConsultationIntakeForm;
