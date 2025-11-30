import UserInfoStep from "@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/UserInfoStep";
import BudgetStep from "@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/BudgetStep";
import TreatmentGoalsStep from "@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/TreatmentGoalsStep";
import VisitPathStep from "@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/VisitPathStep";
import SkinConcernsStep from "@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/SkinConcernsStep";
import HealthConditionStep from "@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/HealthConditionStep";
import {
  FaInstagram,
  FaReddit,
  FaTiktok,
  FaYoutube,
  FaGoogle,
  FaComments
} from 'react-icons/fa';
// import { SiLemon8 } from 'react-icons/si';
import { USER_INFO, BUDGET, HEALTH_CONDITIONS, PREFERENCES, PRIORITYFACTORS, SKIN_CONCERNS, SKIN_TYPE, TREATMENT_EXPERIENCE_BEFORE, TREATMENT_GOALS, UPLOAD_PHOTO, VISIT_PATHS, AGE_RANGE } from '@/constants/estimate_steps';
import UploadImageStep from "@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/UploadImageStep";
import SkinTypeStep from "@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/SkinTypeStep";
import PreferencesStep from "@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/PreferencesStep";
import PrioriotyFactorStep from "@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/PrioriotyFactorStep";
import TreatmentExpBeforeStep from "@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/TreatmentExpBefore";
// import AgeRangeStep from "@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/AgeRangeStep";

// ═══════════════════════════════════════════════════════════
// STEPS 정의 - 기재된 순서로 나옴
// ═══════════════════════════════════════════════════════════
export const steps = [
  // STEP 1: Age Range (새로 추가)
  // {
  //   id: AGE_RANGE,
  //   title: "What's your age range?",
  //   subtitle: "This helps us recommend age-appropriate treatments",
  //   component: AgeRangeStep,
  // },

  // STEP 2: Skin Type
  {
    id: SKIN_TYPE,
    title: "What's your skin type?",
    subtitle: "Help us understand your skin characteristics",
    component: SkinTypeStep,
  },

  // STEP 3: Skin Concerns (개선됨 - 계층적 구조)
  {
    id: SKIN_CONCERNS,
    title: "What would you like to improve?",
    subtitle: "Select all areas of concern (up to 5)",
    component: SkinConcernsStep,
  },

  // STEP 4: Treatment Goals (간소화)
  {
    id: TREATMENT_GOALS,
    title: "What's your main treatment goal?",
    subtitle: "What transformation are you hoping to achieve?",
    component: TreatmentGoalsStep,
  },

  // STEP 5: Budget (개선된 범위)
  {
    id: BUDGET,
    title: "What's your budget range?",
    subtitle: "Let's find treatments that fit your budget",
    component: BudgetStep,
  },

  // STEP 6: Health Conditions (안전 체크)
  {
    id: HEALTH_CONDITIONS,
    title: "Do you have any medical conditions we should know about?",
    subtitle: "This helps us recommend safe treatments for you",
    component: HealthConditionStep,
  },


  // ─────────────────────────────────────────────────────────
  // 선택적 단계들 (조건부 표시)
  // ─────────────────────────────────────────────────────────
  // OPTIONAL: Treatment Areas (특정 고민 선택 시만 표시)
  {
    id: PREFERENCES,
    title: "Which facial areas do you want to focus on?",
    subtitle: "Select specific areas for targeted treatment",
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
    title: "What matters most to you?",
    subtitle: "Rank your priorities (drag to reorder)",
    component: PrioriotyFactorStep,
    optional: true,
  },

  // OPTIONAL: Past Treatments (간소화된 버전)
  {
    id: TREATMENT_EXPERIENCE_BEFORE,
    title: "Have you had similar treatments before?",
    subtitle: "This helps us understand your experience level",
    component: TreatmentExpBeforeStep,
    optional: true,
  },
    // STEP 7: User Info (마지막)
    {
      id: USER_INFO,
      title: "Get your personalized treatment plan",
      subtitle: "We'll send your detailed recommendations within 24 hours",
      component: UserInfoStep,
    },
  

  // OPTIONAL: Visit Path (마케팅 데이터, USER_INFO에 통합 가능)
  {
    id: VISIT_PATHS,
    title: "How did you hear about us?",
    subtitle: "Optional",
    component: VisitPathStep,
    optional: true,
  },
    // OPTIONAL: Photo Upload (선택 사항)
    // {
    //   id: UPLOAD_PHOTO,
    //   title: "Upload a photo for more accurate analysis (Optional)",
    //   subtitle: "Only png, jpg, jpeg files. This step can be skipped.",
    //   component: UploadImageStep,
    //   optional: true, // 새로운 플래그
    // },
  
    
  
];

// ═══════════════════════════════════════════════════════════
// QUESTIONS 데이터 정의
// ═══════════════════════════════════════════════════════════
export const questions = {

  // ─────────────────────────────────────────────────────────
  // 1. AGE RANGES (새로 추가)
  // ─────────────────────────────────────────────────────────
  ageRanges: [
    {
      id: "20s",
      label: "20s (20-29)",
      description: "Prevention & early care",
    },
    {
      id: "30s",
      label: "30s (30-39)",
      description: "Maintenance & first signs of aging",
    },
    {
      id: "40s",
      label: "40s (40-49)",
      description: "Anti-aging & rejuvenation",
    },
    {
      id: "50s",
      label: "50s (50-59)",
      description: "Advanced anti-aging",
    },
    {
      id: "60plus",
      label: "60+",
      description: "Comprehensive rejuvenation",
    },
  ],

  // ─────────────────────────────────────────────────────────
  // 2. SKIN TYPES (기존 유지)
  // ─────────────────────────────────────────────────────────
  skinTypes: [
    {
      id: "dry",
      label: "Dry",
      description: "Often feels tight, may have flaky patches",
    },
    {
      id: "oily",
      label: "Oily",
      description: "Shiny appearance, enlarged pores",
    },
    {
      id: "combination",
      label: "Combination",
      description: "Oily T-zone, dry cheeks",
    },
    {
      id: "sensitive",
      label: "Sensitive",
      description: "Easily irritated, reactive to products",
    },
    {
      id: "normal",
      label: "Normal",
      description: "Well-balanced, rarely problematic",
    },
    {
      id: "not_sure",
      label: "Not Sure",
      description: "Not sure about my skin type",
    },
  ],

  // ─────────────────────────────────────────────────────────
  // 3. SKIN CONCERNS (대폭 개선 - 계층적 구조)
  // ─────────────────────────────────────────────────────────
  skinConcerns: [
    // ═══ TIER 1: 일반 피부 고민 (Dermatology) ═══
    {
      id: "acne",
      label: "Acne & Breakouts",
      description: "Active pimples, inflamed skin",
      tier: 1,
      category: "skin_condition",
    },
    {
      id: "pigmentation",
      label: "Dark Spots & Pigmentation",
      description: "Uneven skin tone, sun damage, melasma",
      tier: 1,
      category: "skin_condition",
    },
    {
      id: "pores",
      label: "Enlarged Pores / Rough Texture",
      description: "Visible pores, uneven surface",
      tier: 1,
      category: "skin_condition",
    },
    {
      id: "redness",
      label: "Redness & Sensitive Skin",
      description: "Easily irritated, reactive skin",
      tier: 1,
      category: "skin_condition",
    },
    {
      id: "scars",
      label: "Scars (Acne or Other)",
      description: "Textured scars, discoloration",
      tier: 1,
      category: "skin_condition",
    },
    {
      id: "dryness",
      label: "Dryness & Dull Skin",
      description: "Lack of moisture and radiance",
      tier: 1,
      category: "skin_condition",
    },

    // ═══ TIER 2: 에이징 고민 (Anti-Aging) ═══
    {
      id: "wrinkles",
      label: "Fine Lines & Wrinkles",
      description: "Forehead lines, crow's feet, smile lines",
      tier: 2,
      category: "anti_aging",
    },
    {
      id: "sagging",
      label: "Sagging & Loss of Firmness",
      description: "Loose skin, jowls",
      tier: 2,
      category: "anti_aging",
    },
    {
      id: "volume_loss",
      label: "Volume Loss",
      description: "Hollow cheeks, under-eye hollows",
      tier: 2,
      category: "anti_aging",
    },

    // ═══ TIER 3: 윤곽 개선 (Facial Contouring) ═══
    {
      id: "jawline_enhancement",
      label: "Jawline Definition (V-line)",
      description: "Enhance jawline contour, reduce jaw width",
      tier: 3,
      category: "contouring",
    },
    {
      id: "nose_enhancement",
      label: "Nose Enhancement",
      description: "Non-surgical nose refinement",
      tier: 3,
      category: "contouring",
    },
    {
      id: "lip_enhancement",
      label: "Lip Enhancement",
      description: "Add volume and definition",
      tier: 3,
      category: "contouring",
    },
    {
      id: "double_chin",
      label: "Double Chin Reduction",
      description: "Reduce submental fat",
      tier: 3,
      category: "contouring",
    },
    {
      id: "cheek_contouring",
      label: "Cheek Volume Enhancement",
      description: "Add fullness to cheeks",
      tier: 3,
      category: "contouring",
    },
    {
      id: "forehead_contouring",
      label: "Forehead Contouring",
      description: "Smooth and shape forehead",
      tier: 3,
      category: "contouring",
    },

    // ═══ OTHER ═══
    {
      id: "other",
      label: "Other",
      description: "Describe your specific concern",
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
      label: "Clear & Healthy Skin",
      description: "Treat acne, reduce scars, even skin tone",
      emoji: "✨",
    },
    {
      id: "radiant_glow",
      label: "Radiant Glow",
      description: "Brighten and revitalize dull skin",
      emoji: "💎",
    },
    {
      id: "anti_aging",
      label: "Anti-Aging & Youthful Look",
      description: "Reduce wrinkles, improve firmness",
      emoji: "⏳",
    },
    {
      id: "texture_improvement",
      label: "Smooth Texture",
      description: "Refine pores, improve skin surface",
      emoji: "🎨",
    },
    {
      id: "facial_contouring",
      label: "Facial Enhancement",
      description: "Define features, improve proportions",
      emoji: "💆‍♀️",
    },
    {
      id: "recommendation",
      label: "Just Give Me Recommendations",
      description: "Not sure what I need",
      emoji: "🤖",
    },
  ],

  // ─────────────────────────────────────────────────────────
  // 5. BUDGET RANGES (개선된 범위)
  // ─────────────────────────────────────────────────────────
  budgetRanges: [
    {
      id: "under-500",
      label: "Under $500",
      description: "Basic treatments, single session",
    },
    {
      id: "500-1500",
      label: "$500 - $1,500",
      description: "Popular treatment range, 2-3 sessions",
    },
    {
      id: "1500-3000",
      label: "$1,500 - $3,000",
      description: "Premium treatments, comprehensive care",
    },
    {
      id: "3000-5000",
      label: "$3,000 - $5,000",
      description: "Advanced procedures, combination treatments",
    },
    {
      id: "5000-10000",
      label: "$5,000 - $10,000",
      description: "Extensive transformation packages",
    },
    {
      id: "10000-plus",
      label: "$10,000+",
      description: "VIP comprehensive programs",
    },
    {
      id: "flexible",
      label: "Flexible / Show All Options",
      description: "I want to see all available options",
    },
  ],

  // ─────────────────────────────────────────────────────────
  // 6. MEDICAL CONDITIONS (기존 유지)
  // ─────────────────────────────────────────────────────────
  medicalConditions: [
    {
      id: 'blood_clotting',
      label: 'Blood Clotting Disorder',
      description: 'Conditions affecting normal blood clotting',
      emoji: '🩸'
    },
    {
      id: 'pregnant',
      label: 'Pregnant or Breastfeeding',
      description: 'Currently pregnant, planning pregnancy, or breastfeeding',
      emoji: '🤰'
    },
    {
      id: 'skin_allergy',
      label: 'Skin Allergy History',
      description: 'History of allergic skin reactions',
      emoji: '🌿'
    },
    {
      id: 'immunosuppressants',
      label: 'Taking Immunosuppressants',
      description: 'On medications that suppress immune system',
      emoji: '💊'
    },
    {
      id: 'skin_condition',
      label: 'Chronic Skin Condition',
      description: 'Eczema, psoriasis, rosacea, etc.',
      emoji: '🧴'
    },
    {
      id: 'antibiotics_or_steroids',
      label: 'Taking Antibiotics or Steroids',
      description: 'Currently on antibiotics or steroid medications',
      emoji: '💉'
    },
    {
      id: 'keloid_tendency',
      label: 'Keloid or Hypertrophic Scarring',
      description: 'Tendency to form raised scars',
      emoji: '🩹'
    },
    {
      id: 'none',
      label: 'None of the Above',
      description: 'No relevant medical conditions',
      emoji: '✅'
    },
    {
      id: 'other',
      label: 'Other',
      description: 'Please specify in the text box',
      emoji: '📝'
    }
  ],

  // ─────────────────────────────────────────────────────────
  // OPTIONAL: 이하는 조건부 표시 또는 나중에 수집
  // ─────────────────────────────────────────────────────────

  // Treatment Areas (PREFERENCES) - 간소화
  treatmentAreas: [
    { id: "full-face", label: "Full Face", emoji: "👤" },
    { id: "upper-face", label: "Upper Face (Forehead, Eyes)", emoji: "👀" },
    { id: "mid-face", label: "Mid Face (Cheeks, Nose)", emoji: "😊" },
    { id: "lower-face", label: "Lower Face (Jawline, Chin)", emoji: "🦷" },
    { id: "neck", label: "Neck", emoji: "🦢" },
  ],

  // Priorities (간소화 - 단일 선택으로 변경 추천)
  priorities: [
    {
      id: "effectiveness",
      label: "Effectiveness",
      description: "Best results matter most",
    },
    {
      id: "price",
      label: "Affordable Price",
      description: "Budget-friendly options preferred",
    },
    {
      id: "minimal_downtime",
      label: "Minimal Downtime",
      description: "Quick recovery is important",
    },
    {
      id: "safety",
      label: "Safety & Natural Results",
      description: "Conservative, proven treatments",
    },
    {
      id: "reviews",
      label: "High Patient Reviews",
      description: "Highly rated by others",
    },
  ],

  // Past Treatments (대폭 간소화)
  pastTreatments: [
    {
      id: "never",
      label: "Never Had Any Treatments",
      description: "This will be my first time",
    },
    {
      id: "injectables_recent",
      label: "Injectables (within 3 months)",
      description: "Botox, Fillers, or similar within last 3 months",
    },
    {
      id: "injectables_past",
      label: "Injectables (more than 3 months ago)",
      description: "Had Botox, Fillers before but not recently",
    },
    {
      id: "laser_recent",
      label: "Laser Treatments (within 2 weeks)",
      description: "Any laser procedure in last 2 weeks",
    },
    {
      id: "laser_past",
      label: "Laser Treatments (more than 2 weeks ago)",
      description: "Had laser treatments before",
    },
    {
      id: "other_treatments",
      label: "Other Cosmetic Procedures",
      description: "Chemical peels, microneedling, etc.",
    },
    {
      id: "not_sure",
      label: "Not Sure / Can't Remember",
      description: "Don't recall the details",
    },
  ],

  // Visit Paths (기존 유지)
  visitPaths: [
    { id: 'instagram', label: 'Instagram', description: 'Instagram', icon: FaInstagram },
    { id: 'facebook', label: 'Facebook / Meta', description: 'FaceBook/Meta', icon: FaInstagram },
    { id: 'lemon8', label: 'Lemon8', description: 'Lemon8', icon: FaComments },
    { id: 'reddit', label: 'Reddit', description: 'Reddit', icon: FaReddit },
    { id: 'tiktok', label: 'TikTok', description: 'TikTok', icon: FaTiktok },
    { id: 'youtube', label: 'YouTube', description: 'YouTube', icon: FaYoutube },
    { id: 'web_search', label: 'Web Search', description: 'Google, Bing, Naver, etc.', icon: FaGoogle },
    { id: 'chat_ai', label: 'AI Chatbot', description: 'ChatGPT, Claude, etc.', icon: FaComments },
    { id: 'friend_referral', label: 'Friend Referral', description: 'Recommended by someone', icon: FaComments },
    { id: 'other', label: 'Other', description: 'Other', icon: FaComments },
  ],
};
