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
          UPLOAD_PHOTO} from '@/constants/pre_consult_steps';
import UploadImageStep from "@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/UploadImageStep";
import SkinTypeStep from "@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/SkinTypeStep";
import PreferencesStep from "@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/PreferencesStep";
import PrioriotyFactorStep from "@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/PrioriotyFactorStep";
import TreatmentExpBeforeStep from "@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/TreatmentExpBefore";

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
   
    // OPTIONAL: Photo Upload (선택 사항)
    {
      id: UPLOAD_PHOTO,
      title: {
        ko: "더 정확한 분석을 위해 사진을 업로드하세요 (선택사항)",
        en: "Upload a photo for more accurate analysis (Optional)"
      },
      subtitle: {
        ko: "png, jpg, jpeg 파일만 가능합니다. 이 단계는 건너뛸 수 있습니다.",
        en: "Only png, jpg, jpeg files. This step can be skipped."
      },
      component: UploadImageStep,
      optional: true, // 새로운 플래그
    },
  
    
  
];

// ═══════════════════════════════════════════════════════════
// QUESTIONS 데이터 정의
// ═══════════════════════════════════════════════════════════
export const questions = {


  // ─────────────────────────────────────────────────────────
  // 2. SKIN TYPES (기존 유지)
  // ─────────────────────────────────────────────────────────
  skinTypes: [
    {
      id: "dry",
      label: {
        ko: "건성",
        en: "Dry"
      },
      description: {
        ko: "자주 당기는 느낌, 각질이 생길 수 있음",
        en: "Often feels tight, may have flaky patches"
      },
    },
    {
      id: "oily",
      label: {
        ko: "지성",
        en: "Oily"
      },
      description: {
        ko: "윤기가 나고 모공이 넓음",
        en: "Shiny appearance, enlarged pores"
      },
    },
    {
      id: "combination",
      label: {
        ko: "복합성",
        en: "Combination"
      },
      description: {
        ko: "T존은 지성, 볼은 건성",
        en: "Oily T-zone, dry cheeks"
      },
    },
    {
      id: "sensitive",
      label: {
        ko: "민감성",
        en: "Sensitive"
      },
      description: {
        ko: "쉽게 자극받고 제품에 반응함",
        en: "Easily irritated, reactive to products"
      },
    },
    {
      id: "normal",
      label: {
        ko: "정상",
        en: "Normal"
      },
      description: {
        ko: "균형 잡힌 상태, 문제가 거의 없음",
        en: "Well-balanced, rarely problematic"
      },
    },
    {
      id: "not_sure",
      label: {
        ko: "모르겠음",
        en: "Not Sure"
      },
      description: {
        ko: "내 피부 타입을 모르겠음",
        en: "Not sure about my skin type"
      },
    },
  ],

  // ─────────────────────────────────────────────────────────
  // 3. SKIN CONCERNS (대폭 개선 - 계층적 구조)
  // ─────────────────────────────────────────────────────────
  skinConcerns: [
    // ═══ TIER 1: 일반 피부 고민 (Dermatology) ═══
    {
      id: "acne",
      label: {
        ko: "여드름 및 트러블",
        en: "Acne & Breakouts"
      },
      description: {
        ko: "활성 여드름, 염증이 있는 피부",
        en: "Active pimples, inflamed skin"
      },
      tier: 1,
      category: "skin_condition",
    },
    {
      id: "pigmentation",
      label: {
        ko: "기미 및 색소 침착",
        en: "Dark Spots & Pigmentation"
      },
      description: {
        ko: "피부 톤 불균형, 자외선 손상, 멜라스마",
        en: "Uneven skin tone, sun damage, melasma"
      },
      tier: 1,
      category: "skin_condition",
    },
    {
      id: "pores",
      label: {
        ko: "모공 확대 / 거친 질감",
        en: "Enlarged Pores / Rough Texture"
      },
      description: {
        ko: "눈에 띄는 모공, 거친 표면",
        en: "Visible pores, uneven surface"
      },
      tier: 1,
      category: "skin_condition",
    },
    {
      id: "redness",
      label: {
        ko: "홍조 및 민감성 피부",
        en: "Redness & Sensitive Skin"
      },
      description: {
        ko: "쉽게 자극받고 반응하는 피부",
        en: "Easily irritated, reactive skin"
      },
      tier: 1,
      category: "skin_condition",
    },
    {
      id: "scars",
      label: {
        ko: "흉터 (여드름 또는 기타)",
        en: "Scars (Acne or Other)"
      },
      description: {
        ko: "질감이 있는 흉터, 색소 침착",
        en: "Textured scars, discoloration"
      },
      tier: 1,
      category: "skin_condition",
    },
    {
      id: "dryness",
      label: {
        ko: "건조함 및 칙칙한 피부",
        en: "Dryness & Dull Skin"
      },
      description: {
        ko: "수분 부족 및 윤기 부족",
        en: "Lack of moisture and radiance"
      },
      tier: 1,
      category: "skin_condition",
    },

    // ═══ TIER 2: 에이징 고민 (Anti-Aging) ═══
    {
      id: "wrinkles",
      label: {
        ko: "주름 및 미세 주름",
        en: "Fine Lines & Wrinkles"
      },
      description: {
        ko: "이마 주름, 눈가 주름, 웃음 주름",
        en: "Forehead lines, crow's feet, smile lines"
      },
      tier: 2,
      category: "anti_aging",
    },
    {
      id: "sagging",
      label: {
        ko: "처짐 및 탄력 손실",
        en: "Sagging & Loss of Firmness"
      },
      description: {
        ko: "느슨한 피부, 턱선 처짐",
        en: "Loose skin, jowls"
      },
      tier: 2,
      category: "anti_aging",
    },
    {
      id: "volume_loss",
      label: {
        ko: "볼륨 손실",
        en: "Volume Loss"
      },
      description: {
        ko: "들뜬 볼, 눈밑 함몰",
        en: "Hollow cheeks, under-eye hollows"
      },
      tier: 2,
      category: "anti_aging",
    },

    // ═══ TIER 3: 윤곽 개선 (Facial Contouring) ═══
    {
      id: "jawline_enhancement",
      label: {
        ko: "턱선 정의 (V라인)",
        en: "Jawline Definition (V-line)"
      },
      description: {
        ko: "턱선 윤곽 강화, 턱 폭 감소",
        en: "Enhance jawline contour, reduce jaw width"
      },
      tier: 3,
      category: "contouring",
    },
    {
      id: "nose_enhancement",
      label: {
        ko: "코 성형",
        en: "Nose Enhancement"
      },
      description: {
        ko: "비수술 코 리핑",
        en: "Non-surgical nose refinement"
      },
      tier: 3,
      category: "contouring",
    },
    {
      id: "lip_enhancement",
      label: {
        ko: "입술 볼륨",
        en: "Lip Enhancement"
      },
      description: {
        ko: "볼륨 및 윤곽 추가",
        en: "Add volume and definition"
      },
      tier: 3,
      category: "contouring",
    },
    {
      id: "double_chin",
      label: {
        ko: "이중턱 감소",
        en: "Double Chin Reduction"
      },
      description: {
        ko: "턱밑 지방 감소",
        en: "Reduce submental fat"
      },
      tier: 3,
      category: "contouring",
    },
    {
      id: "cheek_contouring",
      label: {
        ko: "볼 볼륨 강화",
        en: "Cheek Volume Enhancement"
      },
      description: {
        ko: "볼에 볼륨 추가",
        en: "Add fullness to cheeks"
      },
      tier: 3,
      category: "contouring",
    },
    {
      id: "forehead_contouring",
      label: {
        ko: "이마 윤곽",
        en: "Forehead Contouring"
      },
      description: {
        ko: "이마를 매끄럽고 형태 있게",
        en: "Smooth and shape forehead"
      },
      tier: 3,
      category: "contouring",
    },

    // ═══ OTHER ═══
    {
      id: "other",
      label: {
        ko: "기타",
        en: "Other"
      },
      description: {
        ko: "구체적인 고민을 설명해주세요",
        en: "Describe your specific concern"
      },
      tier: 4,
      category: "other",
    },
  ],

  // ─────────────────────────────────────────────────────────
  // 4. TREATMENT GOALS (간소화 - 6개만)
  // ─────────────────────────────────────────────────────────
  treatmentGoals: [
    {
      id: "clear_skin",
      label: {
        ko: "맑고 건강한 피부",
        en: "Clear & Healthy Skin"
      },
      description: {
        ko: "여드름 치료, 흉터 감소, 피부 톤 균일화",
        en: "Treat acne, reduce scars, even skin tone"
      },
      emoji: "✨",
    },
    {
      id: "radiant_glow",
      label: {
        ko: "윤기 있는 피부",
        en: "Radiant Glow"
      },
      description: {
        ko: "칙칙한 피부를 밝고 활기 있게",
        en: "Brighten and revitalize dull skin"
      },
      emoji: "💎",
    },
    {
      id: "anti_aging",
      label: {
        ko: "안티에이징 및 젊은 외모",
        en: "Anti-Aging & Youthful Look"
      },
      description: {
        ko: "주름 감소, 탄력 개선",
        en: "Reduce wrinkles, improve firmness"
      },
      emoji: "⏳",
    },
    {
      id: "texture_improvement",
      label: {
        ko: "부드러운 질감",
        en: "Smooth Texture"
      },
      description: {
        ko: "모공 정리, 피부 표면 개선",
        en: "Refine pores, improve skin surface"
      },
      emoji: "🎨",
    },
    {
      id: "facial_contouring",
      label: {
        ko: "얼굴 윤곽 개선",
        en: "Facial Enhancement"
      },
      description: {
        ko: "윤곽 정의, 비율 개선",
        en: "Define features, improve proportions"
      },
      emoji: "💆‍♀️",
    },
    {
      id: "recommendation",
      label: {
        ko: "추천만 해주세요",
        en: "Just Give Me Recommendations"
      },
      description: {
        ko: "필요한 것이 무엇인지 모르겠음",
        en: "Not sure what I need"
      },
      emoji: "🤖",
    },
  ],

  // ─────────────────────────────────────────────────────────
  // 5. BUDGET RANGES (개선된 범위)
  // ─────────────────────────────────────────────────────────
  budgetRanges: [
    {
      id: "under-500",
      label: {
        ko: "$500 미만",
        en: "Under $500"
      },
      description: {
        ko: "기본 시술, 단일 세션",
        en: "Basic treatments, single session"
      },
    },
    {
      id: "500-1500",
      label: {
        ko: "$500 - $1,500",
        en: "$500 - $1,500"
      },
      description: {
        ko: "인기 시술 범위, 2-3회 세션",
        en: "Popular treatment range, 2-3 sessions"
      },
    },
    {
      id: "1500-3000",
      label: {
        ko: "$1,500 - $3,000",
        en: "$1,500 - $3,000"
      },
      description: {
        ko: "프리미엄 시술, 종합 케어",
        en: "Premium treatments, comprehensive care"
      },
    },
    {
      id: "3000-5000",
      label: {
        ko: "$3,000 - $5,000",
        en: "$3,000 - $5,000"
      },
      description: {
        ko: "고급 시술, 조합 치료",
        en: "Advanced procedures, combination treatments"
      },
    },
    {
      id: "5000-10000",
      label: {
        ko: "$5,000 - $10,000",
        en: "$5,000 - $10,000"
      },
      description: {
        ko: "광범위한 변화 패키지",
        en: "Extensive transformation packages"
      },
    },
    {
      id: "10000-plus",
      label: {
        ko: "$10,000 이상",
        en: "$10,000+"
      },
      description: {
        ko: "VIP 종합 프로그램",
        en: "VIP comprehensive programs"
      },
    },
    {
      id: "flexible",
      label: {
        ko: "유연함 / 모든 옵션 보기",
        en: "Flexible / Show All Options"
      },
      description: {
        ko: "모든 가능한 옵션을 보고 싶음",
        en: "I want to see all available options"
      },
    },
  ],

  // ─────────────────────────────────────────────────────────
  // 6. MEDICAL CONDITIONS (기존 유지)
  // ─────────────────────────────────────────────────────────
  medicalConditions: [
    {
      id: 'blood_clotting',
      label: {
        ko: '혈액 응고 장애',
        en: 'Blood Clotting Disorder'
      },
      description: {
        ko: '정상적인 혈액 응고에 영향을 주는 상태',
        en: 'Conditions affecting normal blood clotting'
      },
      emoji: '🩸'
    },
    {
      id: 'pregnant',
      label: {
        ko: '임신 중이거나 수유 중',
        en: 'Pregnant or Breastfeeding'
      },
      description: {
        ko: '현재 임신 중, 임신 계획 중, 또는 수유 중',
        en: 'Currently pregnant, planning pregnancy, or breastfeeding'
      },
      emoji: '🤰'
    },
    {
      id: 'skin_allergy',
      label: {
        ko: '피부 알레르기 이력',
        en: 'Skin Allergy History'
      },
      description: {
        ko: '알레르기성 피부 반응 이력',
        en: 'History of allergic skin reactions'
      },
      emoji: '🌿'
    },
    {
      id: 'immunosuppressants',
      label: {
        ko: '면역 억제제 복용 중',
        en: 'Taking Immunosuppressants'
      },
      description: {
        ko: '면역 체계를 억제하는 약물 복용 중',
        en: 'On medications that suppress immune system'
      },
      emoji: '💊'
    },
    {
      id: 'skin_condition',
      label: {
        ko: '만성 피부 질환',
        en: 'Chronic Skin Condition'
      },
      description: {
        ko: '아토피, 건선, 로제아 등',
        en: 'Eczema, psoriasis, rosacea, etc.'
      },
      emoji: '🧴'
    },
    {
      id: 'antibiotics_or_steroids',
      label: {
        ko: '항생제 또는 스테로이드 복용 중',
        en: 'Taking Antibiotics or Steroids'
      },
      description: {
        ko: '현재 항생제 또는 스테로이드 약물 복용 중',
        en: 'Currently on antibiotics or steroid medications'
      },
      emoji: '💉'
    },
    {
      id: 'keloid_tendency',
      label: {
        ko: '켈로이드 또는 비후성 흉터',
        en: 'Keloid or Hypertrophic Scarring'
      },
      description: {
        ko: '돌출된 흉터가 생기는 경향',
        en: 'Tendency to form raised scars'
      },
      emoji: '🩹'
    },
    {
      id: 'none',
      label: {
        ko: '해당 없음',
        en: 'None of the Above'
      },
      description: {
        ko: '관련 건강 상태 없음',
        en: 'No relevant medical conditions'
      },
      emoji: '✅'
    },
    {
      id: 'other',
      label: {
        ko: '기타',
        en: 'Other'
      },
      description: {
        ko: '텍스트 박스에 구체적으로 적어주세요',
        en: 'Please specify in the text box'
      },
      emoji: '📝'
    }
  ],

  // ─────────────────────────────────────────────────────────
  // OPTIONAL: 이하는 조건부 표시 또는 나중에 수집
  // ─────────────────────────────────────────────────────────

  // Treatment Areas (PREFERENCES) - 간소화
  treatmentAreas: [
    { 
      id: "full-face", 
      label: {
        ko: "전체 얼굴",
        en: "Full Face"
      },
      emoji: "👤" 
    },
    { 
      id: "upper-face", 
      label: {
        ko: "상안면 (이마, 눈)",
        en: "Upper Face (Forehead, Eyes)"
      },
      emoji: "👀" 
    },
    { 
      id: "mid-face", 
      label: {
        ko: "중안면 (볼, 코)",
        en: "Mid Face (Cheeks, Nose)"
      },
      emoji: "😊" 
    },
    { 
      id: "lower-face", 
      label: {
        ko: "하안면 (턱선, 턱)",
        en: "Lower Face (Jawline, Chin)"
      },
      emoji: "🦷" 
    },
    { 
      id: "neck", 
      label: {
        ko: "목",
        en: "Neck"
      },
      emoji: "🦢" 
    },
  ],

  // Priorities (간소화 - 단일 선택으로 변경 추천)
  priorities: [
    {
      id: "effectiveness",
      label: {
        ko: "효과",
        en: "Effectiveness"
      },
      description: {
        ko: "최고의 결과가 가장 중요함",
        en: "Best results matter most"
      },
    },
    {
      id: "price",
      label: {
        ko: "합리적인 가격",
        en: "Affordable Price"
      },
      description: {
        ko: "예산에 맞는 옵션 선호",
        en: "Budget-friendly options preferred"
      },
    },
    {
      id: "minimal_downtime",
      label: {
        ko: "최소 다운타임",
        en: "Minimal Downtime"
      },
      description: {
        ko: "빠른 회복이 중요함",
        en: "Quick recovery is important"
      },
    },
    {
      id: "safety",
      label: {
        ko: "안전성 및 자연스러운 결과",
        en: "Safety & Natural Results"
      },
      description: {
        ko: "보수적이고 검증된 시술",
        en: "Conservative, proven treatments"
      },
    },
    {
      id: "reviews",
      label: {
        ko: "높은 환자 평점",
        en: "High Patient Reviews"
      },
      description: {
        ko: "다른 사람들로부터 높은 평가",
        en: "Highly rated by others"
      },
    },
  ],

  // Past Treatments (대폭 간소화)
  pastTreatments: [
    {
      id: "never",
      label: {
        ko: "시술 경험 없음",
        en: "Never Had Any Treatments"
      },
      description: {
        ko: "이번이 처음입니다",
        en: "This will be my first time"
      },
    },
    {
      id: "injectables_recent",
      label: {
        ko: "주사 시술 (3개월 이내)",
        en: "Injectables (within 3 months)"
      },
      description: {
        ko: "최근 3개월 이내 보톡스, 필러 또는 유사 시술",
        en: "Botox, Fillers, or similar within last 3 months"
      },
    },
    {
      id: "injectables_past",
      label: {
        ko: "주사 시술 (3개월 이상 전)",
        en: "Injectables (more than 3 months ago)"
      },
      description: {
        ko: "이전에 보톡스, 필러를 받았지만 최근은 아님",
        en: "Had Botox, Fillers before but not recently"
      },
    },
    {
      id: "laser_recent",
      label: {
        ko: "레이저 시술 (2주 이내)",
        en: "Laser Treatments (within 2 weeks)"
      },
      description: {
        ko: "최근 2주 이내 레이저 시술",
        en: "Any laser procedure in last 2 weeks"
      },
    },
    {
      id: "laser_past",
      label: {
        ko: "레이저 시술 (2주 이상 전)",
        en: "Laser Treatments (more than 2 weeks ago)"
      },
      description: {
        ko: "이전에 레이저 시술을 받은 적 있음",
        en: "Had laser treatments before"
      },
    },
    {
      id: "other_treatments",
      label: {
        ko: "기타 미용 시술",
        en: "Other Cosmetic Procedures"
      },
      description: {
        ko: "화학적 필링, 마이크로니들링 등",
        en: "Chemical peels, microneedling, etc."
      },
    },
    {
      id: "not_sure",
      label: {
        ko: "모르겠음 / 기억나지 않음",
        en: "Not Sure / Can't Remember"
      },
      description: {
        ko: "세부 사항을 기억하지 못함",
        en: "Don't recall the details"
      },
    },
  ],

};
