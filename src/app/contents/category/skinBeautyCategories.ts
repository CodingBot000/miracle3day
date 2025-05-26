import { CategoryNode } from "./categoryNode";

  export const SKIN_BEAUTY_CATEGORIES: CategoryNode[] = [
    { key: "recommend", label: "추천" },
    {
      key: "face",
      label: "얼굴",
      children: [
        {
          key: "filler",
          label: "필러",
          children: [
            { key: "full_face", label: "풀페이스" },
            { key: "forehead_glabella", label: "이마/미간" },
            { key: "nose", label: "코" },
            { key: "lips_mouth_corner", label: "입술/입꼬리" },
            { key: "eyes", label: "눈" },
            { key: "chin", label: "턱" },
            { key: "cheek_zygomatic", label: "볼/광대" },
            { key: "neck", label: "목" },
            { key: "nasolabial_fold", label: "팔자" },
            { key: "temple", label: "관자놀이" },
            { key: "scalp", label: "두상" },
            { key: "filler_removal", label: "필러제거" },
          ],
        },
        {
          key: "lifting",
          label: "리프팅",
          children: [
            { key: "laser_lifting", label: "레이저리프팅" },
            { key: "thread_lifting", label: "실리프팅" },
            { key: "nose_lifting", label: "코리프팅" },
            { key: "nerve_block_lifting", label: "신경차단리프팅" },
          ],
        },
        {
          key: "botox",
          label: "보톡스",
          children: [
            { key: "full_face", label: "풀페이스" },
            { key: "chin", label: "턱" },
            { key: "parotid_gland", label: "침샘" },
            { key: "forehead_glabella", label: "이마/미간" },
            { key: "eyes", label: "눈" },
            { key: "skin", label: "스킨" },
            { key: "lips_mouth_corner", label: "입술/입꼬리" },
            { key: "gums", label: "잇몸" },
            { key: "hyperhidrosis", label: "다한증" },
            { key: "cheek_zygomatic", label: "볼/광대" },
            { key: "nose", label: "코" },
            { key: "neck", label: "목" },
            { key: "nasolabial_fold", label: "팔자" },
            { key: "temple", label: "관자놀이" },
          ],
        },
        {
          key: "fat_dissolving_contouring_injection",
          label: "지방분해/윤곽주사",
          children: [
            { key: "full_face", label: "풀페이스" },
            { key: "cheek_zygomatic", label: "볼/광대" },
            { key: "chin", label: "턱" },
            { key: "nose", label: "코" },
          ],
        },
      ],
    },
    {
      key: "body",
      label: "체형",
      children: [
        {
          key: "fat_dissolving_contouring_injection",
          label: "지방분해/윤곽주사",
          children: [
            { key: "abdomen", label: "복부" },
            { key: "flank_love_handle", label: "옆구리/러브핸들" },
            { key: "arm", label: "팔" },
            { key: "thigh", label: "허벅지" },
            { key: "knee_calf_ankle", label: "무릎/종아리/발목" },
            { key: "trapezius_collar_back", label: "승모근/쇄골/등" },
            { key: "buttock", label: "엉덩이" },
            { key: "whole_body", label: "전신" },
          ],
        },
        {
          key: "diet",
          label: "다이어트",
          children: [
            { key: "fat_extraction_injection", label: "지방추출주사" },
            { key: "carboxytherapy", label: "카복시테라피" },
            { key: "diet_program", label: "다이어트 프로그램" },
            { key: "cryolipolysis", label: "냉각지방분해" },
            { key: "laser_extracorporeal_shockwave", label: "레이저/체외충격파" },
            { key: "cellulite_toning", label: "셀룰라이트토닝" },
          ],
        },
        {
          key: "stretch_mark_treatment",
          label: "튼살치료",
          children: [
            { key: "laser", label: "레이저" },
            { key: "microneedle", label: "마이크로니들" },
          ],
        },
        {
          key: "filler",
          label: "필러",
          children: [
            { key: "buttock_pelvis", label: "엉덩이/골반" },
            { key: "calf", label: "종아리" },
            { key: "breast", label: "가슴" },
            { key: "filler_removal", label: "필러제거" },
          ],
        },
        {
          key: "lifting",
          label: "리프팅",
          children: [
            { key: "laser_lifting", label: "레이저리프팅" },
            { key: "thread_lifting", label: "실리프팅" },
            { key: "nerve_block_lifting", label: "신경차단리프팅" },
          ],
        },
        {
          key: "botox",
          label: "보톡스",
          children: [
            { key: "trapezius_collar", label: "승모근/쇄골" },
            { key: "thigh", label: "허벅지" },
            { key: "calf", label: "종아리" },
            { key: "arm", label: "팔" },
          ],
        },
        {
          key: "body_whitening",
          label: "바디미백",
          children: [
            { key: "armpit", label: "겨드랑이" },
            { key: "elbow", label: "팔꿈치" },
            { key: "y_zone", label: "Y존" },
            { key: "buttock", label: "엉덩이" },
            { key: "knee", label: "무릎" },
            { key: "elbow_ankle", label: "팔꿈치/복숭아뼈" },
            { key: "nipple_areola", label: "유두/유륜" },
          ],
        },
      ],
    },
    {
      key: "skin",
      label: "피부",
      children: [
        {
          key: "elasticity_regeneration",
          label: "탄력/재생",
          children: [
            { key: "skin_booster", label: "스킨부스터" },
            { key: "collagen_booster", label: "콜라겐부스터" },
            { key: "vitamin_injection_iv", label: "비타민주사/수액" },
            { key: "skin_care", label: "스킨케어" },
          ],
        },
        {
          key: "acne_pore",
          label: "여드름/모공",
          children: [
            { key: "pore_care", label: "모공케어" },
            { key: "acne_extraction", label: "여드름압출" },
            { key: "acne_scar", label: "여드름흉터" },
            { key: "acne_inflammation", label: "여드름염증" },
            { key: "skin_care", label: "스킨케어" },
          ],
        },
        {
          key: "whitening_freckle_redness",
          label: "미백/잡티/홍조",
          children: [
            { key: "melasma_freckle", label: "기미/잡티/주근깨" },
            { key: "mole_seborrheic_keratosis", label: "점/검버섯" },
            { key: "skin_tone_up", label: "피부톤업" },
            { key: "dark_circle", label: "다크서클" },
            { key: "redness", label: "홍조" },
            { key: "skin_care", label: "스킨케어" },
          ],
        },
        {
          key: "moisturizing_soothing",
          label: "보습/진정",
          children: [
            { key: "skin_booster", label: "스킨부스터" },
            { key: "vitamin_injection_iv", label: "비타민주사/수액" },
            { key: "skin_care", label: "스킨케어" },
          ],
        },
        {
          key: "skin_disease",
          label: "피부질환",
          children: [
            { key: "atopy", label: "아토피" },
            { key: "seborrheic_dermatitis", label: "지루성피부염" },
            { key: "bromhidrosis_hyperhidrosis", label: "액취증/다한증" },
            { key: "scar_burn", label: "흉터/화상" },
            { key: "wart_corn", label: "사마귀/티눈" },
            { key: "syringoma_milia_skin_tag", label: "환관종/비립종/쥐젖" },
            { key: "etc", label: "기타" },
          ],
        },
      ],
    },
    {
      key: "dental",
      label: "치아",
      children: [
        { key: "orthodontics", label: "치아교정" },
        { key: "whitening", label: "치아미백" },
        { key: "treatment", label: "치아치료" },
        { key: "gum_care", label: "잇몸관리" },
      ],
    },
    {
      key: "scalp",
      label: "두피/탈모/제모",
      children: [
        {
          key: "scalp_hair_loss_care",
          label: "두피/탈모케어",
          children: [
            { key: "scalp_care", label: "두피케어" },
            { key: "scalp_hair_follicle_injection", label: "두피/모낭주사" },
            { key: "hair_loss_laser", label: "탈모레이저" },
          ],
        },
        {
          key: "hair_transplant",
          label: "모발이식",
          children: [
            { key: "incision", label: "절개" },
            { key: "non_incision", label: "비절개" },
          ],
        },
        {
          key: "laser_hair_removal",
          label: "레이저제모",
          children: [
            { key: "face", label: "얼굴" },
            { key: "body", label: "바디" },
          ],
        },
      ],
    },
    { key: "vision", label: "시력교정" },
    { key: "oriental", label: "한방" },
    {
      key: "etc",
      label: "기타",
      children: [
        {
          key: "semi_permanent_makeup",
          label: "반영구화장",
          children: [
            { key: "eyebrow", label: "눈썹" },
            { key: "eyeliner", label: "아이라인" },
            { key: "lips", label: "입술" },
            { key: "scalp_hairline", label: "두피/헤어라인" },
            { key: "nipple_areola", label: "유두/유륜" },
            { key: "beauty_spot", label: "미인점" },
            { key: "tattoo_removal", label: "문신제거" },
          ],
        },
        { key: "female_procedure", label: "여성시술" },
        { key: "post_surgery_care", label: "성형후관리" },
        { key: "other_petitskin", label: "기타쁘띠/피부" },
      ],
    },
  ];
  