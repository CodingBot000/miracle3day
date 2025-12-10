import BudgetStep from "@/app/[locale]/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/BudgetStep";
import TreatmentGoalsStep from "@/app/[locale]/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/TreatmentGoalsStep";
import VisitPathStep from "@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/VisitPathStep";
import SkinConcernsStep from "@/app/[locale]/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/SkinConcernsStep";
import HealthConditionStep from "@/app/[locale]/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/HealthConditionStep";
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
import UploadImageStep from "@/app/[locale]/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/UploadImageStep";
import SkinTypeStep from "@/app/[locale]/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/SkinTypeStep";
import PreferencesStep from "@/app/[locale]/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/PreferencesStep";
import PrioriotyFactorStep from "@/app/[locale]/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/PrioriotyFactorStep";
import TreatmentExpBeforeStep from "@/app/[locale]/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/TreatmentExpBefore";
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
      en: "What's your skin type?",
      ja: "肌タイプを教えてください",
      "zh-CN": "您的皮肤类型是什么？",
      "zh-TW": "您的皮膚類型是什麼？"
    },
    subtitle: {
      ko: "피부 특성을 파악하는 데 도움이 됩니다",
      en: "Help us understand your skin characteristics",
      ja: "肌の特徴を把握するのに役立ちます",
      "zh-CN": "帮助我们了解您的皮肤特征",
      "zh-TW": "幫助我們了解您的皮膚特徵"
    },
    component: SkinTypeStep,
  },

  // STEP 3: Skin Concerns (개선됨 - 계층적 구조)
  {
    id: SKIN_CONCERNS,
    title: {
      ko: "개선하고 싶은 부분은 무엇인가요?",
      en: "What would you like to improve?",
      ja: "改善したい部分は何ですか？",
      "zh-CN": "您想改善哪些方面？",
      "zh-TW": "您想改善哪些方面？"
    },
    subtitle: {
      ko: "관심 있는 모든 영역을 선택하세요 (최대 5개)",
      en: "Select all areas of concern (up to 5)",
      ja: "気になる部分をすべてお選びください（最大5つ）",
      "zh-CN": "选择所有关注的问题（最多5个）",
      "zh-TW": "選擇所有關注的問題（最多5個）"
    },
    component: SkinConcernsStep,
  },

  // STEP 4: Treatment Goals (간소화)
  {
    id: TREATMENT_GOALS,
    title: {
      ko: "주요 치료 목표는 무엇인가요?",
      en: "What's your main treatment goal?",
      ja: "主な治療目標は何ですか？",
      "zh-CN": "您的主要治疗目标是什么？",
      "zh-TW": "您的主要治療目標是什麼？"
    },
    subtitle: {
      ko: "어떤 변화를 기대하시나요?",
      en: "What transformation are you hoping to achieve?",
      ja: "どのような変化をご希望ですか？",
      "zh-CN": "您希望实现什么样的改变？",
      "zh-TW": "您希望實現什麼樣的改變？"
    },
    component: TreatmentGoalsStep,
  },

  // STEP 5: Budget (개선된 범위)
  {
    id: BUDGET,
    title: {
      ko: "예산 범위는 얼마인가요?",
      en: "What's your budget range?",
      ja: "ご予算の範囲はいくらですか？",
      "zh-CN": "您的预算范围是多少？",
      "zh-TW": "您的預算範圍是多少？"
    },
    subtitle: {
      ko: "예산에 맞는 시술을 찾아보겠습니다",
      en: "Let's find treatments that fit your budget",
      ja: "ご予算に合った施術をお探しします",
      "zh-CN": "让我们找到适合您预算的治疗方案",
      "zh-TW": "讓我們找到適合您預算的治療方案"
    },
    component: BudgetStep,
  },

  // STEP 6: Health Conditions (안전 체크)
  {
    id: HEALTH_CONDITIONS,
    title: {
      ko: "알려주셔야 할 건강 상태가 있나요?",
      en: "Do you have any medical conditions we should know about?",
      ja: "お知らせいただきたい健康状態はありますか？",
      "zh-CN": "您有任何我们应该知道的健康状况吗？",
      "zh-TW": "您有任何我們應該知道的健康狀況嗎？"
    },
    subtitle: {
      ko: "안전한 시술을 추천하는 데 도움이 됩니다",
      en: "This helps us recommend safe treatments for you",
      ja: "安全な施術をご提案するのに役立ちます",
      "zh-CN": "这有助于我们为您推荐安全的治疗方案",
      "zh-TW": "這有助於我們為您推薦安全的治療方案"
    },
    component: HealthConditionStep,
  },


  // ────────────────────────────────────────────────────────
  // 선택적 단계들 (조건부 표시)
  // ────────────────────────────────────────────────────────
  // OPTIONAL: Treatment Areas (특정 고민 선택 시만 표시)
  {
    id: PREFERENCES,
    title: {
      ko: "어떤 얼굴 부위에 집중하고 싶으신가요?",
      en: "Which facial areas do you want to focus on?",
      ja: "どの顔の部位に集中したいですか？",
      "zh-CN": "您想重点关注哪些面部区域？",
      "zh-TW": "您想重點關注哪些面部區域？"
    },
    subtitle: {
      ko: "타겟팅된 치료를 위해 특정 영역을 선택하세요",
      en: "Select specific areas for targeted treatment",
      ja: "ターゲットを絞った治療のため、特定の部位をお選びください",
      "zh-CN": "选择特定区域进行针对性治疗",
      "zh-TW": "選擇特定區域進行針對性治療"
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
      en: "What matters most to you?",
      ja: "最も重要だと思うことは何ですか？",
      "zh-CN": "对您来说最重要的是什么？",
      "zh-TW": "對您來說最重要的是什麼？"
    },
    subtitle: {
      ko: "우선순위를 순위대로 나열하세요 ",
      en: "Rank your priorities",
      ja: "優先順位を順番に並べてください",
      "zh-CN": "按优先级排列",
      "zh-TW": "按優先順序排列"
    },
    component: PrioriotyFactorStep,
    optional: true,
  },

  // OPTIONAL: Past Treatments (간소화된 버전)
  {
    id: TREATMENT_EXPERIENCE_BEFORE,
    title: {
      ko: "이전에 유사한 시술을 받아본 적이 있나요?",
      en: "Have you had similar treatments before?",
      ja: "以前に類似の施術を受けたことはありますか？",
      "zh-CN": "您以前接受过类似的治疗吗？",
      "zh-TW": "您以前接受過類似的治療嗎？"
    },
    subtitle: {
      ko: "경험 수준을 파악하는 데 도움이 됩니다",
      en: "This helps us understand your experience level",
      ja: "経験レベルを把握するのに役立ちます",
      "zh-CN": "这有助于我们了解您的经验水平",
      "zh-TW": "這有助於我們了解您的經驗水平"
    },
    component: TreatmentExpBeforeStep,
    optional: true,
  },
      
    {
      id: USER_INFO,
      title: {
        ko: "맞춤형 치료 계획을 받아보세요",
        en: "Get your personalized treatment plan",
        ja: "パーソナライズされた治療計画を受け取りましょう",
        "zh-CN": "获取您的个性化治疗方案",
        "zh-TW": "獲取您的個人化治療方案"
      },
      subtitle: {
        ko: "피부 상태는 개인의 나이, 성별, 인종, 생활 환경 등에 따라 다르게 나타납니다.\n\n보다 정확하고 과학적인 시술 추천을 위해 최소한의 정보를 선택적으로 요청드립니다.\n\n제공해주시는 정보는 개인정보 보호 기준에 따라 안전하게 관리되며,\n\n개인 맞춤 진단 및 추천 제공 목적 외에는 사용되지 않습니다.",
        en: "Skin characteristics differ significantly depending on factors such as age, gender, ethnicity, and environment.\n\nTo make our recommendations more accurate and clinically relevant, we ask for minimal information on an optional basis.\n\nYour information will be securely protected and used only for personalized analysis and recommendations.",
        ja: "肌の状態は、年齢、性別、人種、生活環境などによって異なります。\n\nより正確で科学的な施術の推奨のため、最小限の情報を任意でお願いしております。\n\nご提供いただく情報は個人情報保護基準に従って安全に管理され、\n\n個人に合わせた診断と推奨の提供以外の目的では使用されません。",
        "zh-CN": "皮肤特征因年龄、性别、种族和环境等因素而有显著差异。\n\n为了使我们的建议更准确和更具临床相关性，我们会在可选的基础上询问最少的信息。\n\n您的信息将根据个人信息保护标准得到安全保护，\n\n仅用于个性化分析和建议，不会用于其他目的。",
        "zh-TW": "皮膚特徵因年齡、性別、種族和環境等因素而有顯著差異。\n\n為了使我們的建議更準確和更具臨床相關性，我們會在可選的基礎上詢問最少的資訊。\n\n您的資訊將根據個人資訊保護標準得到安全保護，\n\n僅用於個人化分析和建議，不會用於其他目的。"
      },
      component: UserInfoStep,
    },
    // OPTIONAL: Photo Upload (선택 사항)
    {
      id: UPLOAD_PHOTO,
      title: {
        ko: "더 정확한 분석을 위해 사진을 업로드하세요 (선택사항)",
        en: "Upload a photo for more accurate analysis (Optional)",
        ja: "より正確な分析のため、写真をアップロードしてください（任意）",
        "zh-CN": "上传照片以进行更准确的分析（可选）",
        "zh-TW": "上傳照片以進行更準確的分析（可選）"
      },
      subtitle: {
        ko: "png, jpg, jpeg 파일만 가능합니다. 이 단계는 건너뛸 수 있습니다. 건너뛰시려면 파일 첨부 없이 다음버튼을 눌러주세요.",
        en: "Only png, jpg, and jpeg files are supported.\nThis step is optional — if you'd like to skip it, simply proceed without uploading a file.",
        ja: "png、jpg、jpegファイルのみ対応しています。このステップは任意です。スキップする場合は、ファイルをアップロードせずに次へ進んでください。",
        "zh-CN": "仅支持png、jpg和jpeg文件。\n此步骤为可选 - 如果您想跳过，只需在不上传文件的情况下继续即可。",
        "zh-TW": "僅支援png、jpg和jpeg檔案。\n此步驟為可選 - 如果您想跳過，只需在不上傳檔案的情況下繼續即可。"
      },
      component: UploadImageStep,
      optional: true, // 새로운 플래그
    },

    // Video Consultation Schedule
    {
      id: VIDEO_CONSULT_SCHEDULE,
      title: {
        ko: "화상 상담이 가능한 날짜와 시간을 알려주세요",
        en: "When are you available for the video consultation?",
        ja: "ビデオ相談が可能な日時を教えてください",
        "zh-CN": "您何时可以进行视频咨询？",
        "zh-TW": "您何時可以進行視訊諮詢？"
      },
      subtitle: {
        ko: "최대 3개까지 희망 날짜와 시간을 선택해 주세요. 병원에서 검토 후 가능한 시간으로 확정해 드립니다.",
        en: "Select up to three preferred date and time options. The clinic will review and confirm the best available slot.",
        ja: "最大3つまで希望日時をお選びください。クリニックが確認後、可能な時間を確定いたします。",
        "zh-CN": "最多选择三个首选日期和时间选项。诊所将审核并确认最佳可用时段。",
        "zh-TW": "最多選擇三個首選日期和時間選項。診所將審核並確認最佳可用時段。"
      },
      component: VideoConsultScheduleStep,
    },

];
