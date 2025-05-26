import { CategoryNode } from "./categoryNode";

export const PLASTIC_SURGERY_CATEGORIES: CategoryNode[] = [
  { key: "recommend", label: "추천" },
  {
    key: "eye",
    label: "눈",
    children: [
      {
        key: "double_eyelid",
        label: "쌍꺼풀",
        children: [
          { key: "natural_adhesion", label: "자연유착" },
          { key: "buried", label: "매몰" },
          { key: "incision", label: "절개" },
          { key: "partial_incision", label: "부분벌개" },
        ],
      },
      {
        key: "canthoplasty",
        label: "트임",
        children: [
          { key: "epicanthoplasty", label: "앞트임" },
          { key: "lateral_canthoplasty", label: "뒤트임" },
          { key: "upper_canthoplasty", label: "윗트임" },
          { key: "lower_canthoplasty", label: "밑트임" },
          { key: "mongolian_fold", label: "몽고트임" },
          { key: "canthoplasty_revision", label: "트임복원" },
        ],
      },
      {
        key: "ptosis_correction",
        label: "눈매교정",
        children: [
          { key: "incision", label: "절개" },
          { key: "non_incision", label: "비절개" },
        ],
      },
      {
        key: "eye_shape_correction",
        label: "눈모양교정",
        children: [
          { key: "lower_eyelid_fat_reposition", label: "눈밑지방재배치" },
          { key: "upper_blepharoplasty", label: "상안검" },
          { key: "lower_blepharoplasty", label: "하안검" },
          { key: "brow_lift", label: "눈썹거상" },
          { key: "lower_eyelid_fat_removal", label: "눈밑지방제거" },
          { key: "eyelid_fat_removal", label: "눈꺼풀지방제거" },
        ],
      },
      {
        key: "eye_revision",
        label: "눈재수술",
        children: [
          { key: "double_eyelid", label: "쌍꺼풀" },
          { key: "canthoplasty", label: "트임" },
          { key: "ptosis_correction", label: "눈매교정" },
          { key: "eye_shape_correction", label: "눈모양교정" },
        ],
      },
    ],
  },
  {
    key: "nose",
    label: "코",
    children: [
      {
        key: "bridge",
        label: "콧대",
        children: [
          { key: "bridge_autologous", label: "콧대(자가조직)" },
          { key: "bridge_implant", label: "콧대(보형물)" },
          { key: "osteotomy", label: "코절골술" },
        ],
      },
      {
        key: "tip",
        label: "코끝",
        children: [
          { key: "tip_autologous", label: "코끝(자가조직)" },
          { key: "tip_implant", label: "코끝(보형물)" },
          { key: "tip_lengthening", label: "코길이연장" },
        ],
      },
      {
        key: "ala",
        label: "콧볼",
        children: [
          { key: "non_incision", label: "비절개" },
          { key: "medial_incision", label: "내측절개" },
        ],
      },
      {
        key: "functional",
        label: "기능코",
        children: [
          { key: "rhinitis_sinusitis", label: "비염/축농증" },
          { key: "nasal_valve_stenosis", label: "비밸브협착" },
          { key: "septal_deviation", label: "비중격만곡" },
        ],
      },
      {
        key: "nose_revision",
        label: "코재수술",
        children: [
          { key: "bridge", label: "콧대" },
          { key: "tip", label: "코끝" },
          { key: "ala", label: "콧볼" },
          { key: "functional", label: "기능코" },
        ],
      },
    ],
  },
  {
    key: "fat",
    label: "지방흡입/이식",
    children: [
      {
        key: "body_liposuction",
        label: "바디지방흡입",
        children: [
          { key: "abdomen", label: "복부" },
          { key: "arm", label: "팔" },
          { key: "thigh", label: "허벅지" },
          { key: "knee_calf_ankle", label: "무릎/종아리/발목" },
          { key: "buttock", label: "엉덩이" },
          { key: "trapezius_collar_back", label: "승모근/쇄골/등" },
          { key: "flank_love_handle", label: "옆구리/러브핸들" },
          { key: "breast", label: "가슴" },
          { key: "armpit_accessory_breast", label: "겨드랑이/부유방" },
          { key: "whole_body", label: "전신" },
        ],
      },
      {
        key: "face_liposuction",
        label: "얼굴지방흡입",
        children: [
          { key: "full_face", label: "풀페이스" },
          { key: "forehead_glabella", label: "이마/미간" },
          { key: "cheek_zygomatic", label: "볼/광대" },
          { key: "chin", label: "턱" },
          { key: "nasolabial_fold", label: "팔자" },
        ],
      },
      {
        key: "face_fat_graft",
        label: "얼굴지방이식",
        children: [
          { key: "full_face", label: "풀페이스" },
          { key: "forehead_glabella", label: "이마/미간" },
          { key: "cheek_zygomatic", label: "볼/광대" },
          { key: "eyes", label: "눈" },
          { key: "chin", label: "턱" },
          { key: "temple", label: "관자놀이" },
          { key: "nasolabial_fold", label: "팔자" },
          { key: "lips", label: "입술" },
        ],
      },
      {
        key: "body_fat_graft",
        label: "바디지방이식",
        children: [
          { key: "breast", label: "가슴" },
          { key: "buttock_pelvis", label: "엉덩이/골반" },
          { key: "calf", label: "종아리" },
        ],
      },
    ],
  },
  {
    key: "outline",
    label: "안면윤곽/양악",
    children: [
      {
        key: "zygoma",
        label: "광대",
        children: [
          { key: "zygoma_implant", label: "광대확대(보형물)" },
          { key: "zygoma_reduction", label: "광대축소" },
        ],
      },
      {
        key: "contour",
        label: "윤곽",
        children: [
          { key: "square_jaw", label: "사각턱" },
          { key: "chin", label: "턱끝" },
          { key: "double_chin", label: "이중턱" },
          { key: "complex_face_vline", label: "복합안면/V라인" },
          { key: "facelift", label: "안면거상" },
        ],
      },
      {
        key: "forehead",
        label: "이마",
        children: [
          { key: "forehead_implant", label: "이마확대(보형물)" },
          { key: "forehead_reduction", label: "이마축소" },
          { key: "forehead_lift", label: "이마거상" },
        ],
      },
      {
        key: "two_jaw",
        label: "양악",
        children: [
          { key: "two_jaw", label: "양악" },
          { key: "upper_jaw", label: "상악" },
          { key: "lower_jaw", label: "하악" },
        ],
      },
      {
        key: "contour_revision",
        label: "안면윤곽재수술",
        children: [
          { key: "zygoma", label: "광대" },
          { key: "contour", label: "윤곽" },
          { key: "forehead", label: "이마" },
          { key: "two_jaw", label: "양악" },
        ],
      },
    ],
  },
  {
    key: "breast",
    label: "가슴",
    children: [
      {
        key: "breast_shape_correction",
        label: "가슴모양교정",
        children: [
          { key: "augmentation_implant", label: "가슴확대(보형물)" },
          { key: "mastopexy", label: "가슴거상" },
          { key: "reduction", label: "가슴축소" },
          { key: "implant_removal", label: "가슴보형물제거" },
          { key: "foreign_body_removal", label: "가슴이물질제거" },
          { key: "axillary_fat_removal", label: "부유방지방제거" },
        ],
      },
      {
        key: "nipple_areola",
        label: "유두/유륜",
        children: [
          { key: "inverted_nipple", label: "함몰유두" },
          { key: "nipple_areola_reduction", label: "유두/유륜축소" },
        ],
      },
      {
        key: "breast_revision",
        label: "가슴재수술",
        children: [
          { key: "breast_shape_correction", label: "가슴모양교정" },
          { key: "nipple_areola", label: "유두/유륜" },
        ],
      },
    ],
  },
  {
    key: "mens",
    label: "남자성형",
    children: [
      {
        key: "eye",
        label: "눈",
        children: [
          { key: "double_eyelid_or_no_eyelid", label: "쌍꺼풀/무쌍" },
          { key: "canthoplasty", label: "트임" },
          { key: "ptosis_correction", label: "눈매교정" },
          { key: "eye_shape_correction", label: "눈모양교정" },
        ],
      },
      {
        key: "nose",
        label: "코",
        children: [
          { key: "bridge", label: "콧대" },
          { key: "tip", label: "코끝" },
          { key: "ala", label: "콧볼" },
          { key: "functional", label: "기능코" },
        ],
      },
      {
        key: "breast",
        label: "가슴",
        children: [
          { key: "gynecomastia", label: "여유증" },
          { key: "nipple_areola", label: "유두/유륜" },
        ],
      },
      {
        key: "liposuction_fat_graft",
        label: "지방흡입/이식",
        children: [
          { key: "body_liposuction", label: "바디지방흡입" },
          { key: "face_liposuction", label: "얼굴지방흡입" },
          { key: "face_fat_graft", label: "얼굴지방이식" },
          { key: "body_fat_graft", label: "바디지방이식" },
        ],
      },
      {
        key: "facial_contour_jaw",
        label: "안면윤곽/양악",
        children: [
          { key: "zygoma", label: "광대" },
          { key: "contour", label: "윤곽" },
          { key: "forehead", label: "이마" },
          { key: "two_jaw", label: "양악" },
        ],
      },
    ],
  },
  {
    key: "etc",
    label: "기타",
    children: [
      { key: "female_surgery", label: "여성성형" },
      { key: "body_lift", label: "바디거상" },
      { key: "lip_surgery", label: "입술성형" },
      { key: "philtrum_surgery", label: "인중성형" },
      { key: "nasolabial_surgery", label: "팔자성형" },
      { key: "dimple_surgery", label: "보조개성형" },
      { key: "buttock_surgery", label: "엉덩이성형" },
      { key: "ear_surgery", label: "귀성형" },
      { key: "other_surgery", label: "기타성형" },
    ],
  },
];
