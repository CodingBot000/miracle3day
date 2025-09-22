import { CategoryNode } from "./categoryNode";

export const PLASTIC_SURGERY_CATEGORIES: CategoryNode[] = [
  { key: "recommend", label: "추천", name: "Recommend" },
  {
    key: "eye",
    label: "눈",
    name: "Eye",
    children: [
      {
        key: "double_eyelid",
        label: "쌍꺼풀",
        name: "Double Eyelid",
        children: [
          { key: "natural_adhesion", label: "자연유착", name: "Natural Adhesion" },
          { key: "buried", label: "매몰", name: "Buried" },
          { key: "incision", label: "절개", name: "Incision" },
          { key: "partial_incision", label: "부분벌개", name: "Partial Incision" },
        ],
      },
      {
        key: "canthoplasty",
        label: "트임",
        name: "Canthoplasty",
        children: [
          { key: "epicanthoplasty", label: "앞트임", name: "Epicanthoplasty" },
          { key: "lateral_canthoplasty", label: "뒤트임", name: "Lateral Canthoplasty" },
          { key: "upper_canthoplasty", label: "윗트임", name: "Upper Canthoplasty" },
          { key: "lower_canthoplasty", label: "밑트임", name: "Lower Canthoplasty" },
          { key: "mongolian_fold", label: "몽고트임", name: "Mongolian Fold" },
          { key: "canthoplasty_revision", label: "트임복원", name: "Canthoplasty Revision" },
        ],
      },
      {
        key: "ptosis_correction",
        label: "눈매교정",
        name: "Ptosis Correction",
        children: [
          { key: "incision", label: "절개", name: "Incision" },
          { key: "non_incision", label: "비절개", name: "Non Incision" },
        ],
      },
      {
        key: "eye_shape_correction",
        label: "눈모양교정",
        name: "Eye Shape Correction",
        children: [
          { key: "lower_eyelid_fat_reposition", label: "눈밑지방재배치", name: "Lower Eyelid Fat Reposition" },
          { key: "upper_blepharoplasty", label: "상안검", name: "Upper Blepharoplasty" },
          { key: "lower_blepharoplasty", label: "하안검", name: "Lower Blepharoplasty" },
          { key: "brow_lift", label: "눈썹거상", name: "Brow Lift" },
          { key: "lower_eyelid_fat_removal", label: "눈밑지방제거", name: "Lower Eyelid Fat Removal" },
          { key: "eyelid_fat_removal", label: "눈꺼풀지방제거", name: "Eyelid Fat Removal" },
        ],
      },
      {
        key: "eye_revision",
        label: "눈재수술",
        name: "Eye Revision",
        children: [
          { key: "double_eyelid", label: "쌍꺼풀", name: "Double Eyelid" },
          { key: "canthoplasty", label: "트임", name: "Canthoplasty" },
          { key: "ptosis_correction", label: "눈매교정", name: "Ptosis Correction" },
          { key: "eye_shape_correction", label: "눈모양교정", name: "Eye Shape Correction" },
        ],
      },
    ],
  },
  {
    key: "nose",
    label: "코",
    name: "Nose",
    children: [
      {
        key: "bridge",
        label: "콧대",
        name: "Bridge",
        children: [
          { key: "bridge_autologous", label: "콧대(자가조직)", name: "Bridge Autologous" },
          { key: "bridge_implant", label: "콧대(보형물)", name: "Bridge Implant" },
          { key: "osteotomy", label: "코절골술", name: "Osteotomy" },
        ],
      },
      {
        key: "tip",
        label: "코끝",
        name: "Tip",
        children: [
          { key: "tip_autologous", label: "코끝(자가조직)", name: "Tip Autologous" },
          { key: "tip_implant", label: "코끝(보형물)", name: "Tip Implant" },
          { key: "tip_lengthening", label: "코길이연장", name: "Tip Lengthening" },
        ],
      },
      {
        key: "ala",
        label: "콧볼",
        name: "Ala",
        children: [
          { key: "non_incision", label: "비절개", name: "Non Incision" },
          { key: "medial_incision", label: "내측절개", name: "Medial Incision" },
        ],
      },
      {
        key: "functional",
        label: "기능코",
        name: "Functional",
        children: [
          { key: "rhinitis_sinusitis", label: "비염/축농증", name: "Rhinitis Sinusitis" },
          { key: "nasal_valve_stenosis", label: "비밸브협착", name: "Nasal Valve Stenosis" },
          { key: "septal_deviation", label: "비중격만곡", name: "Septal Deviation" },
        ],
      },
      {
        key: "nose_revision",
        label: "코재수술",
        name: "Nose Revision",
        children: [
          { key: "bridge", label: "콧대", name: "Bridge" },
          { key: "tip", label: "코끝", name: "Tip" },
          { key: "ala", label: "콧볼", name: "Ala" },
          { key: "functional", label: "기능코", name: "Functional" },
        ],
      },
    ],
  },
  {
    key: "fat",
    label: "지방흡입/이식",
    name: "Fat Graft",
    children: [
      {
        key: "body_liposuction",
        label: "바디지방흡입",
        name: "Body Liposuction",
        children: [
          { key: "abdomen", label: "복부", name: "Abdomen" },
          { key: "arm", label: "팔", name: "Arm" },
          { key: "thigh", label: "허벅지", name: "Thigh" },
          { key: "knee_calf_ankle", label: "무릎/종아리/발목", name: "Knee Calf Ankle" },
          { key: "buttock", label: "엉덩이", name: "Buttock" },
          { key: "trapezius_collar_back", label: "승모근/쇄골/등", name: "Trapezius Collar Back" },
          { key: "flank_love_handle", label: "옆구리/러브핸들", name: "Flank Love Handle" },
          { key: "breast", label: "가슴", name: "Breast" },
          { key: "armpit_accessory_breast", label: "겨드랑이/부유방", name: "Armpit Accessory Breast" },
          { key: "whole_body", label: "전신", name: "Whole Body" },
        ],
      },
      {
        key: "face_liposuction",
        label: "얼굴지방흡입",
        name: "Face Liposuction",
        children: [
          { key: "full_face", label: "풀페이스", name: "Full Face" },
          { key: "forehead_glabella", label: "이마/미간", name: "Forehead Glabella" },
          { key: "cheek_zygomatic", label: "볼/광대", name: "Cheek Zygomatic" },
          { key: "chin", label: "턱", name: "Chin" },
          { key: "nasolabial_fold", label: "팔자", name: "Nasolabial Fold" },
        ],
      },
      {
        key: "face_fat_graft",
        label: "얼굴지방이식",
        name: "Face Fat Graft",
        children: [
          { key: "full_face", label: "풀페이스", name: "Full Face" },
          { key: "forehead_glabella", label: "이마/미간", name: "Forehead Glabella" },
          { key: "cheek_zygomatic", label: "볼/광대", name: "Cheek Zygomatic" },
          { key: "eyes", label: "눈", name: "Eyes" },
          { key: "chin", label: "턱", name: "Chin" },
          { key: "temple", label: "관자놀이", name: "Temple" },
          { key: "nasolabial_fold", label: "팔자", name: "Nasolabial Fold" },
          { key: "lips", label: "입술", name: "Lips" },
        ],
      },
      {
        key: "body_fat_graft",
        label: "바디지방이식",
        name: "Body Fat Graft",
        children: [
          { key: "breast", label: "가슴", name: "Breast" },
          { key: "buttock_pelvis", label: "엉덩이/골반", name: "Buttock Pelvis" },
          { key: "calf", label: "종아리", name: "Calf" },
        ],
      },
    ],
  },
  {
    key: "outline",
    label: "안면윤곽/양악",
    name: "Facial Contour/Jaw",
    children: [
      {
        key: "zygoma",
        label: "광대",
        name: "Zygoma",
        children: [
          { key: "zygoma_implant", label: "광대확대(보형물)", name: "Zygoma Implant" },
          { key: "zygoma_reduction", label: "광대축소", name: "Zygoma Reduction" },
        ],
      },
      {
        key: "contour",
        label: "윤곽",
        name: "Contour",
        children: [
          { key: "square_jaw", label: "사각턱", name: "Square Jaw" },
          { key: "chin", label: "턱끝", name: "Chin" },
          { key: "double_chin", label: "이중턱", name: "Double Chin" },
          { key: "complex_face_vline", label: "복합안면/V라인", name: "Complex Face Vline" },
          { key: "facelift", label: "안면거상", name: "Facelift" },
        ],
      },
      {
        key: "forehead",
        label: "이마",
        name: "Forehead",
        children: [
          { key: "forehead_implant", label: "이마확대(보형물)", name: "Forehead Implant" },
          { key: "forehead_reduction", label: "이마축소", name: "Forehead Reduction" },
          { key: "forehead_lift", label: "이마거상", name: "Forehead Lift" },
        ],
      },
      {
        key: "two_jaw",
        label: "양악",
        name: "Two Jaw",
        children: [
          { key: "two_jaw", label: "양악", name: "Two Jaw" },
          { key: "upper_jaw", label: "상악", name: "Upper Jaw" },
          { key: "lower_jaw", label: "하악", name: "Lower Jaw" },
        ],
      },
      {
        key: "contour_revision",
        label: "안면윤곽재수술",
        name: "Facial Contour Revision",
        children: [
          { key: "zygoma", label: "광대", name: "Zygoma" },
          { key: "contour", label: "윤곽", name: "Contour" },
          { key: "forehead", label: "이마", name: "Forehead" },
          { key: "two_jaw", label: "양악", name: "Two Jaw" },
        ],
      },
    ],
  },
  {
    key: "breast",
    label: "가슴",
    name: "Breast",
    children: [
      {
        key: "breast_shape_correction",
        label: "가슴모양교정",
        name: "Breast Shape Correction",
        children: [
          { key: "augmentation_implant", label: "가슴확대(보형물)", name: "Augmentation Implant" },
          { key: "mastopexy", label: "가슴거상", name: "Mastopexy" },
          { key: "reduction", label: "가슴축소", name: "Reduction" },
          { key: "implant_removal", label: "가슴보형물제거", name: "Implant Removal" },
          { key: "foreign_body_removal", label: "가슴이물질제거", name: "Foreign Body Removal" },
          { key: "axillary_fat_removal", label: "부유방지방제거", name: "Axillary Fat Removal" },
        ],
      },
      {
        key: "nipple_areola",
        label: "유두/유륜",
        name: "Nipple Areola",
        children: [
          { key: "inverted_nipple", label: "함몰유두", name: "Inverted Nipple" },
          { key: "nipple_areola_reduction", label: "유두/유륜축소", name: "Nipple Areola Reduction" },
        ],
      },
      {
        key: "breast_revision",
        label: "가슴재수술",
        name: "Breast Revision",
        children: [
          { key: "breast_shape_correction", label: "가슴모양교정", name: "Breast Shape Correction" },
          { key: "nipple_areola", label: "유두/유륜", name: "Nipple Areola" },
        ],
      },
    ],
  },
  {
    key: "mens",
    label: "남자성형",
    name: "Mens",
    children: [
      {
        key: "eye",
        label: "눈",
        name: "Eye",
        children: [
          { key: "double_eyelid_or_no_eyelid", label: "쌍꺼풀/무쌍", name: "Double Eyelid Or No Eyelid" },
          { key: "canthoplasty", label: "트임", name: "Canthoplasty" },
          { key: "ptosis_correction", label: "눈매교정", name: "Ptosis Correction" },
          { key: "eye_shape_correction", label: "눈모양교정", name: "Eye Shape Correction" },
        ],
      },
      {
        key: "nose",
        label: "코",
        name: "Nose",
        children: [
          { key: "bridge", label: "콧대", name: "Bridge" },
          { key: "tip", label: "코끝", name: "Tip" },
          { key: "ala", label: "콧볼", name: "Ala" },
          { key: "functional", label: "기능코", name: "Functional" },
        ],
      },
      {
        key: "breast",
        label: "가슴",
        name: "Breast",
        children: [
          { key: "gynecomastia", label: "여유증", name: "Gynecomastia" },
          { key: "nipple_areola", label: "유두/유륜", name: "Nipple Areola" },
        ],
      },
      {
        key: "liposuction_fat_graft",
        label: "지방흡입/이식",
        name: "Liposuction/Fat Graft",
        children: [
          { key: "body_liposuction", label: "바디지방흡입", name: "Body Liposuction" },
          { key: "face_liposuction", label: "얼굴지방흡입", name: "Face Liposuction" },
          { key: "face_fat_graft", label: "얼굴지방이식", name: "Face Fat Graft" },
          { key: "body_fat_graft", label: "바디지방이식", name: "Body Fat Graft" },
        ],
      },
      {
        key: "facial_contour_jaw",
        label: "안면윤곽/양악",
        name: "Facial Contour/Jaw",
        children: [
          { key: "zygoma", label: "광대", name: "Zygoma" },
          { key: "contour", label: "윤곽", name: "Contour" },
          { key: "forehead", label: "이마", name: "Forehead" },
          { key: "two_jaw", label: "양악", name: "Two Jaw" },
        ],
      },
    ],
  },
  {
    key: "etc",
    label: "기타",
    name: "Etc",
    children: [
      { key: "female_surgery", label: "여성성형", name: "Female Surgery" },
      { key: "body_lift", label: "바디거상", name: "Body Lift" },
      { key: "lip_surgery", label: "입술성형", name: "Lip Surgery" },
      { key: "philtrum_surgery", label: "인중성형", name: "Philtrum Surgery" },
      { key: "nasolabial_surgery", label: "팔자성형", name: "Nasolabial Surgery" },
      { key: "dimple_surgery", label: "보조개성형", name: "Dimple Surgery" },
      { key: "buttock_surgery", label: "엉덩이성형", name: "Buttock Surgery" },
      { key: "ear_surgery", label: "귀성형", name: "Ear Surgery" },
      { key: "other_surgery", label: "기타성형", name: "Other Surgery" },
    ],
  },
];
