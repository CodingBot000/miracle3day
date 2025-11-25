import {
  FaInstagram,
  FaReddit,
  FaTiktok,
  FaYoutube,
  FaGoogle,
  FaComments
} from 'react-icons/fa';

// ═══════════════════════════════════════════════════════════
// QUESTIONS 데이터 정의
// ═══════════════════════════════════════════════════════════
export const questions = {

  // ─────────────────────────────────────────────────────────
  // 1. AGE RANGES (새로 추가)
  // ─────────────────────────────────────────────────────────
  // ageRanges: [
  //   {
  //     id: "20s",
  //     label: {
  //       ko: "20대 (20-29)",
  //       en: "20s (20-29)"
  //     },
  //     description: {
  //       ko: "예방 및 초기 관리",
  //       en: "Prevention & early care"
  //     },
  //   },
  //   {
  //     id: "30s",
  //     label: {
  //       ko: "30대 (30-39)",
  //       en: "30s (30-39)"
  //     },
  //     description: {
  //       ko: "유지 관리 및 노화 초기 징후",
  //       en: "Maintenance & first signs of aging"
  //     },
  //   },
  //   {
  //     id: "40s",
  //     label: {
  //       ko: "40대 (40-49)",
  //       en: "40s (40-49)"
  //     },
  //     description: {
  //       ko: "안티에이징 및 회춘",
  //       en: "Anti-aging & rejuvenation"
  //     },
  //   },
  //   {
  //     id: "50s",
  //     label: {
  //       ko: "50대 (50-59)",
  //       en: "50s (50-59)"
  //     },
  //     description: {
  //       ko: "고급 안티에이징",
  //       en: "Advanced anti-aging"
  //     },
  //   },
  //   {
  //     id: "60plus",
  //     label: {
  //       ko: "60세 이상",
  //       en: "60+"
  //     },
  //     description: {
  //       ko: "종합적인 회춘",
  //       en: "Comprehensive rejuvenation"
  //     },
  //   },
  // ],

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

  demographicsBasic: [
    {
      "id": "age_group",
      "type": "single_select",
      "required": false,
      "title": {
        "ko": "연령대",
        "en": "Age group"
      },
      "helperText": {
        "ko": "연령대를 선택해주세요.\n정확한 시술 추천을 위해 간단히 참고합니다.",
        "en": "Please select your age group.\nIt helps us provide more accurate recommendations."
      },
      "options": [
        {
          "value": "18_24",
          "label": {
            "ko": "18–24세",
            "en": "18–24"
          }
        },
        {
          "value": "25_34",
          "label": {
            "ko": "25–34세",
            "en": "25–34"
          }
        },
        {
          "value": "35_44",
          "label": {
            "ko": "35–44세",
            "en": "35–44"
          }
        },
        {
          "value": "45_54",
          "label": {
            "ko": "45–54세",
            "en": "45–54"
          }
        },
        {
          "value": "55_64",
          "label": {
            "ko": "55–64세",
            "en": "55–64"
          }
        },
        {
          "value": "65_plus",
          "label": {
            "ko": "65세 이상",
            "en": "65+"
          }
        },
        {
          "value": "prefer_not_to_say",
          "label": {
            "ko": "답변하지 않음",
            "en": "Prefer not to say"
          }
        }
      ]
    },
    {
      "id": "gender",
      "type": "single_select",
      "required": false,
      "title": {
        "ko": "성별",
        "en": "Gender"
      },
      "helperText": {
        "ko": "성별을 선택해주세요.\n피부 타입과 반응이 성별에 따라 달라 정확도 향상에 도움이 됩니다.\n원치 않으시면 ‘답변하지 않음’을 선택하셔도 됩니다.",
        "en": "Please select your gender.\nSkin characteristics can differ by gender, helping us personalize your recommendations.\nYou may choose “Prefer not to say.”"
      },
      "options": [
        {
          "value": "male",
          "label": {
            "ko": "남성",
            "en": "Male"
          }
        },
        {
          "value": "female",
          "label": {
            "ko": "여성",
            "en": "Female"
          }
        },
        {
          "value": "other",
          "label": {
            "ko": "기타",
            "en": "Other"
          }
        },
        {
          "value": "prefer_not_to_say",
          "label": {
            "ko": "답변하지 않음",
            "en": "Prefer not to say"
          }
        }
      ]
    },
    {
      "id": "ethnic_background",
      "type": "single_select",
      "required": false,
      "title": {
        "ko": "피부/인종 그룹",
        "en": "Ethnic background / skin type group"
      },
      "helperText": {
        "ko": "본인과 가장 가까운 피부·인종 그룹을 선택해주세요.\n피부 반응이 그룹별로 조금씩 달라 맞춤 추천에 도움이 됩니다.\n원치 않으시면 ‘답변하지 않음’을 선택하셔도 됩니다.",
        "en": "Please choose the skin/ethnic group that best describes you.\nSkin responses can vary slightly across groups, helping us personalize your recommendations.\nYou may select “Prefer not to say.”"
      },
      "options": [
        {
          "value": "asian",
          "label": {
            "ko": "동양 (Asian)",
            "en": "Asian"
          }
        },
        {
          "value": "white",
          "label": {
            "ko": "백인 (White / Caucasian)",
            "en": "White (Caucasian)"
          }
        },
        {
          "value": "african",
          "label": {
            "ko": "흑인 (African / African-American)",
            "en": "African / African-American"
          }
        },
        {
          "value": "hispanic",
          "label": {
            "ko": "히스패닉 (Hispanic / Latino)",
            "en": "Hispanic / Latino"
          }
        },
        {
          "value": "middle_eastern",
          "label": {
            "ko": "중동 (Middle Eastern)",
            "en": "Middle Eastern"
          }
        },
        {
          "value": "mixed",
          "label": {
            "ko": "혼합 (Mixed)",
            "en": "Mixed"
          }
        },
        {
          "value": "prefer_not_to_say",
          "label": {
            "ko": "답변하지 않음",
            "en": "Prefer not to say"
          }
        }
      ]
    },
    {
      "id": "country_of_residence",
      "type": "country_select",
      "required": false,
      "title": {
        "ko": "현재 거주 국가",
        "en": "Current country of residence"
      },
      "helperText": {
        "ko": "현재 거주 중인 국가를 선택해주세요.\n국적이 아닌 ‘생활 중인 국가’ 기준이며, 기후·환경 차이가 시술 추천에 영향을 줄 수 있기 때문에 확인합니다.",
        "en": "Please select the country you currently live in.\nThis refers to your place of residence (not nationality), and we ask because climate and environmental conditions can affect treatment recommendations."
      },
      "placeholder": {
        "ko": "거주 국가를 선택하세요",
        "en": "Select your country"
      },
      "optionSource": {
        "type": "iso_3166_1_alpha_2",
        "note": {
          "ko": "프론트엔드에서 ISO 국가 코드 목록을 사용해 드롭다운을 구성하세요.",
          "en": "Use the ISO country code list on the frontend to populate the dropdown."
        }
      },
      "extraOptions": [
        {
          "value": "prefer_not_to_say",
          "label": {
            "ko": "답변하지 않음",
            "en": "Prefer not to say"
          }
        }
      ]
    }
  ],

  // Visit Paths (기존 유지)
  visitPaths: [
    { 
      id: 'instagram', 
      label: {
        ko: '인스타그램',
        en: 'Instagram'
      },
      description: {
        ko: '인스타그램',
        en: 'Instagram'
      },
      icon: FaInstagram 
    },
    { 
      id: 'facebook', 
      label: {
        ko: '페이스북 / 메타',
        en: 'Facebook / Meta'
      },
      description: {
        ko: '페이스북/메타',
        en: 'FaceBook/Meta'
      },
      icon: FaInstagram 
    },
    { 
      id: 'lemon8', 
      label: {
        ko: '레몬8',
        en: 'Lemon8'
      },
      description: {
        ko: '레몬8',
        en: 'Lemon8'
      },
      icon: FaComments 
    },
    { 
      id: 'reddit', 
      label: {
        ko: '레딧',
        en: 'Reddit'
      },
      description: {
        ko: '레딧',
        en: 'Reddit'
      },
      icon: FaReddit 
    },
    { 
      id: 'tiktok', 
      label: {
        ko: '틱톡',
        en: 'TikTok'
      },
      description: {
        ko: '틱톡',
        en: 'TikTok'
      },
      icon: FaTiktok 
    },
    { 
      id: 'youtube', 
      label: {
        ko: '유튜브',
        en: 'YouTube'
      },
      description: {
        ko: '유튜브',
        en: 'YouTube'
      },
      icon: FaYoutube 
    },
    { 
      id: 'web_search', 
      label: {
        ko: '웹 검색',
        en: 'Web Search'
      },
      description: {
        ko: '구글, 빙, 네이버 등',
        en: 'Google, Bing, Naver, etc.'
      },
      icon: FaGoogle 
    },
    { 
      id: 'chat_ai', 
      label: {
        ko: 'AI 챗봇',
        en: 'AI Chatbot'
      },
      description: {
        ko: 'ChatGPT, Claude 등',
        en: 'ChatGPT, Claude, etc.'
      },
      icon: FaComments 
    },
    { 
      id: 'friend_referral', 
      label: {
        ko: '지인 추천',
        en: 'Friend Referral'
      },
      description: {
        ko: '누군가의 추천',
        en: 'Recommended by someone'
      },
      icon: FaComments 
    },
    { 
      id: 'other', 
      label: {
        ko: '기타',
        en: 'Other'
      },
      description: {
        ko: '기타',
        en: 'Other'
      },
      icon: FaComments 
    },
  ],
};
