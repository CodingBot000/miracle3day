import BudgetStep from "@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/BudgetStep";
import TreatmentGoalsStep from "@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/TreatmentGoalsStep";
import VisitPathStep from "@/app/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/VisitPathStep";
import SkinConcernsStep from "@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/SkinConcernsStep";
import HealthConditionStep from "@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/HealthConditionStep";
import {  BUDGET,
   HEALTH_CONDITIONS,
    PREFERENCES,
     PRIORITYFACTORS,
      SKIN_CONCERNS,
       SKIN_TYPE,
        TREATMENT_EXPERIENCE_BEFORE,
         TREATMENT_GOALS,
          UPLOAD_PHOTO,
          USER_INFO,
          VIDEO_CONSULT_SCHEDULE} from '@/constants/pre_consult_steps';
import UploadImageStep from "@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/UploadImageStep";
import SkinTypeStep from "@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/SkinTypeStep";
import PreferencesStep from "@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/PreferencesStep";
import PrioriotyFactorStep from "@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/PrioriotyFactorStep";
import TreatmentExpBeforeStep from "@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/TreatmentExpBefore";
import UserInfoStep from "../PreConsultationSurveyFlow/questionnaire/UserInfoStep";
import VideoConsultScheduleStep from "../PreConsultationSurveyFlow/questionnaire/VideoConsultScheduleStep";
// ═══════════════════════════════════════════════════════════
// STEPS 정의 - 기재된 순서로 나옴
// ═══════════════════════════════════════════════════════════
export const preConsultationSteps = [
  // // STEP 1: Age Range (새로 추가)
  // {
  //   id: AGE_RANGE,
  //   title: "What's your age range?",
  //   subtitle: "This helps us recommend age-appropriate treatments",
  //   component: AgeRangeStep,
  // },
      
    // {
    //   id: USER_INFO,
    //   title: {
    //     ko: "맞춤형 치료 계획을 받아보세요",
    //     en: "Get your personalized treatment plan"
    //   },
    //   subtitle: {
    //     ko: "피부 상태는 개인의 나이, 성별, 인종, 생활 환경 등에 따라 다르게 나타납니다.\n\n보다 정확하고 과학적인 시술 추천을 위해 최소한의 정보를 선택적으로 요청드립니다.\n\n제공해주시는 정보는 개인정보 보호 기준에 따라 안전하게 관리되며,\n\n개인 맞춤 진단 및 추천 제공 목적 외에는 사용되지 않습니다.",
    //     en: "Skin characteristics differ significantly depending on factors such as age, gender, ethnicity, and environment.\n\nTo make our recommendations more accurate and clinically relevant, we ask for minimal information on an optional basis.\n\nYour information will be securely protected and used only for personalized analysis and recommendations."
    //   },
    //   component: UserInfoStep,
    // },
  // STEP 2: Skin Type
  {
    id: SKIN_TYPE,
    title: {
      ko: "피부 타입을 알려주세요",
      en: "What's your skin type?"
    },
    subtitle: {
      ko: "피부 특성을 파악하는 데 도움이 됩니다",
      en: "Help us understand your skin characteristics"
    },
    component: SkinTypeStep,
  },

  // STEP 3: Skin Concerns (개선됨 - 계층적 구조)
  {
    id: SKIN_CONCERNS,
    title: {
      ko: "개선하고 싶은 부분은 무엇인가요?",
      en: "What would you like to improve?"
    },
    subtitle: {
      ko: "관심 있는 모든 영역을 선택하세요 (최대 5개)",
      en: "Select all areas of concern (up to 5)"
    },
    component: SkinConcernsStep,
  },

  // STEP 4: Treatment Goals (간소화)
  {
    id: TREATMENT_GOALS,
    title: {
      ko: "주요 치료 목표는 무엇인가요?",
      en: "What's your main treatment goal?"
    },
    subtitle: {
      ko: "어떤 변화를 기대하시나요?",
      en: "What transformation are you hoping to achieve?"
    },
    component: TreatmentGoalsStep,
  },

  // STEP 5: Budget (개선된 범위)
  {
    id: BUDGET,
    title: {
      ko: "예산 범위는 얼마인가요?",
      en: "What's your budget range?"
    },
    subtitle: {
      ko: "예산에 맞는 시술을 찾아보겠습니다",
      en: "Let's find treatments that fit your budget"
    },
    component: BudgetStep,
  },

  // STEP 6: Health Conditions (안전 체크)
  {
    id: HEALTH_CONDITIONS,
    title: {
      ko: "알려주셔야 할 건강 상태가 있나요?",
      en: "Do you have any medical conditions we should know about?"
    },
    subtitle: {
      ko: "안전한 시술을 추천하는 데 도움이 됩니다",
      en: "This helps us recommend safe treatments for you"
    },
    component: HealthConditionStep,
  },


  // ─────────────────────────────────────────────────────────
  // 선택적 단계들 (조건부 표시)
  // ─────────────────────────────────────────────────────────
  // OPTIONAL: Treatment Areas (특정 고민 선택 시만 표시)
  {
    id: PREFERENCES,
    title: {
      ko: "어떤 얼굴 부위에 집중하고 싶으신가요?",
      en: "Which facial areas do you want to focus on?"
    },
    subtitle: {
      ko: "타겟팅된 치료를 위해 특정 영역을 선택하세요",
      en: "Select specific areas for targeted treatment"
    },
    component: PreferencesStep,
    optional: true,
    // condition: (formData) => {
    //   // Facial contouring 고민 선택 시만 표시
    //   const contouringConcerns = ['filler-forehead', 'filler-jawline', 'filler-cheeks', 'double_chin'];
    //   return formData.skinConcerns?.some(c => contouringConcerns.includes(c));
    // }
  },

  // OPTIONAL: Priority Factors (제거 또는 간소화)
  {
    id: PRIORITYFACTORS,
    title: {
      ko: "가장 중요하게 생각하는 것은 무엇인가요?",
      en: "What matters most to you?"
    },
    subtitle: {
      ko: "우선순위를 순위대로 나열하세요 (드래그하여 재정렬)",
      en: "Rank your priorities (drag to reorder)"
    },
    component: PrioriotyFactorStep,
    optional: true,
  },

  // OPTIONAL: Past Treatments (간소화된 버전)
  {
    id: TREATMENT_EXPERIENCE_BEFORE,
    title: {
      ko: "이전에 유사한 시술을 받아본 적이 있나요?",
      en: "Have you had similar treatments before?"
    },
    subtitle: {
      ko: "경험 수준을 파악하는 데 도움이 됩니다",
      en: "This helps us understand your experience level"
    },
    component: TreatmentExpBeforeStep,
    optional: true,
  },
      
    {
      id: USER_INFO,
      title: {
        ko: "맞춤형 치료 계획을 받아보세요",
        en: "Get your personalized treatment plan"
      },
      subtitle: {
        ko: "피부 상태는 개인의 나이, 성별, 인종, 생활 환경 등에 따라 다르게 나타납니다.\n\n보다 정확하고 과학적인 시술 추천을 위해 최소한의 정보를 선택적으로 요청드립니다.\n\n제공해주시는 정보는 개인정보 보호 기준에 따라 안전하게 관리되며,\n\n개인 맞춤 진단 및 추천 제공 목적 외에는 사용되지 않습니다.",
        en: "Skin characteristics differ significantly depending on factors such as age, gender, ethnicity, and environment.\n\nTo make our recommendations more accurate and clinically relevant, we ask for minimal information on an optional basis.\n\nYour information will be securely protected and used only for personalized analysis and recommendations."
      },
      component: UserInfoStep,
    },
    // OPTIONAL: Photo Upload (선택 사항)
    {
      id: UPLOAD_PHOTO,
      title: {
        ko: "더 정확한 분석을 위해 사진을 업로드하세요 (선택사항)",
        en: "Upload a photo for more accurate analysis (Optional)"
      },
      subtitle: {
        ko: "png, jpg, jpeg 파일만 가능합니다. 이 단계는 건너뛸 수 있습니다. 건너뛰시라면 파일 첨부 없이 다음버튼을 눌러주세요.",
        en: "Only png, jpg, and jpeg files are supported.\nThis step is optional — if you'd like to skip it, simply proceed without uploading a file."
      },
      component: UploadImageStep,
      optional: true, // 새로운 플래그
    },

    // Video Consultation Schedule
    {
      id: VIDEO_CONSULT_SCHEDULE,
      title: {
        ko: "화상 상담이 가능한 날짜와 시간을 알려주세요",
        en: "When are you available for the video consultation?"
      },
      subtitle: {
        ko: "최대 3개까지 희망 날짜와 시간을 선택해 주세요. 병원에서 검토 후 가능한 시간으로 확정해 드립니다.",
        en: "Select up to three preferred date and time options. The clinic will review and confirm the best available slot."
      },
      component: VideoConsultScheduleStep,
    },

];
