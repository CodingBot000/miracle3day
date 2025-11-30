// export const locationNames: string[] = [
//   "Apgujung",
//   "Myungdong",
//   "Gangnam",
//   "Chungdam",
//   "Songdo",
//   "Hongdae",
// ] as const;

import { CategoryNode, CategoryNodeRegion } from "@/app/[locale]/(site)/(pages)/contents/category/categoryNode";


export enum LocationEnum {
  Apgujung = "Apgujung",
  Myungdong = "Myungdong",
  Gangnam = "Gangnam",
  Chungdam = "Chungdam",
  Songdo = "Songdo",
  Hongdae = "Hongdae",
}

export const LOCATIONS = [
  LocationEnum.Apgujung,
  LocationEnum.Myungdong,
  LocationEnum.Gangnam,
  LocationEnum.Chungdam,
  LocationEnum.Songdo,
  LocationEnum.Hongdae,
] as const;

export type LocationType = (typeof LOCATIONS)[number];


// export const locationMapper = [
//   {"Apgujung":0},
//   {"Myungdong":1},
//   {"Gangnam":2},
//   {"Chungdam":3},
//   {"Songdo":4},
//   {"Hongdae":5},
// ] as const;



export function findRegionByKey(
  nodes: CategoryNodeRegion[],
  key: number
): CategoryNodeRegion | null {
  for (const node of nodes) {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const found = findRegionByKey(node.children, key);
      if (found) return found;
    }
  }
  return null;
}

export const REGIONS: CategoryNodeRegion[] = [
  {
    key: 1000,
    name: "seoul",
    label: { ko: "서울", en: "Seoul" },
    children: [
      {
        key: 1010,
        name: "gangnam_shinnonhyeon_yangjae",
        label: { ko: "강남역/신논현역/양재", en: "Gangnam/Shinnonhyeon/Yangjae" },
      },
      {
        key: 1020,
        name: "cheongdam_apgujeong_sinsa",
        label: { ko: "청담/압구정/신사", en: "Cheongdam/Apgujeong/Sinsa" },
      },
      {
        key: 1030,
        name: "seolleung_samsung",
        label: { ko: "선릉/삼성", en: "Seolleung/Samsung" },
      },
      {
        key: 1040,
        name: "nonhyeon_banpo_hakdong",
        label: { ko: "논현/반포/학동", en: "Nonhyeon/Banpo/Hakdong" },
      },
      {
        key: 1050,
        name: "seocho_gyodae_bangbae",
        label: { ko: "서초/교대/방배", en: "Seocho/Gyodae/Bangbae" },
      },
      {
        key: 1060,
        name: "daechi_dogok_hanti",
        label: { ko: "대치/도곡/한티", en: "Daechi/Dogok/Hanti" },
      },
      {
        key: 1070,
        name: "hongdae_hapjeong_shinchon",
        label: { ko: "홍대/합정/신촌", en: "Hongdae/Hapjeong/Shinchon" },
      },
      {
        key: 1080,
        name: "seoulstation_myeongdong_hoehyeon",
        label: { ko: "서울역/명동/회현", en: "Seoul Station/Myeongdong/Hoehyeon" },
      },
      {
        key: 1090,
        name: "jamsil_seokchon_cheongho",
        label: { ko: "잠실/석촌/천호", en: "Jamsil/Seokchon/Cheonho" },
      },
      {
        key: 1100,
        name: "wangsimni_seongsu_gundae",
        label: { ko: "왕십리/성수/건대", en: "Wangsimni/Seongsu/Konkuk Univ." },
      },
      {
        key: 1110,
        name: "magok_hwagok_mokdong",
        label: { ko: "마곡/화곡/목동", en: "Magok/Hwagok/Mokdong" },
      },
      {
        key: 1120,
        name: "jongno_euljiro_chungjeongno",
        label: { ko: "종로/을지로/충정로", en: "Jongno/Euljiro/Chungjeongno" },
      },
      {
        key: 1130,
        name: "yeongdeungpo_yeouido_noryangjin",
        label: { ko: "영등포/여의도/노량진", en: "Yeongdeungpo/Yeouido/Noryangjin" },
      },
      {
        key: 1140,
        name: "mia_dobong_nowon",
        label: { ko: "미아/도봉/노원", en: "Mia/Dobong/Nowon" },
      },
      {
        key: 1150,
        name: "itaewon_yongsan_samgakji",
        label: { ko: "이태원/용산/삼각지", en: "Itaewon/Yongsan/Samgakji" },
      },
      {
        key: 1160,
        name: "snudongjak_sadang_dongjak",
        label: { ko: "서울대/사당/동작", en: "Seoul Nat’l Univ./Sadang/Dongjak" },
      },
      {
        key: 1170,
        name: "eunpyeong_sangam",
        label: { ko: "은평/상암", en: "Eunpyeong/Sangam" },
      },
      {
        key: 1180,
        name: "sindorim_guro",
        label: { ko: "신도림/구로", en: "Sindorim/Guro" },
      },
      {
        key: 1190,
        name: "mapo_gongdeok",
        label: { ko: "마포/공덕", en: "Mapo/Gongdeok" },
      },
      {
        key: 1200,
        name: "geumcheon_gasan",
        label: { ko: "금천/가산", en: "Geumcheon/Gasan" },
      },
      {
        key: 1210,
        name: "suseo_bokjeong_jangji",
        label: { ko: "수서/복정/장지", en: "Suseo/Bokjeong/Jangji" },
      },
    ],
  },
  {
    key: 2000,
    name: "gyeonggi",
    label: { ko: "경기", en: "Gyeonggi" },
    children: [
      {
        key: 2010,
        name: "suwon_hwaseong",
        label: { ko: "수원/화성", en: "Suwon/Hwaseong" },
      },
      {
        key: 2020,
        name: "seongnam_yongin",
        label: { ko: "성남/용인", en: "Seongnam/Yongin" },
      },
      {
        key: 2030,
        name: "anmyeong_uiwang",
        label: { ko: "안양/의왕", en: "Anyang/Uiwang" },
      },
      {
        key: 2040,
        name: "bucheon_gwangmyeong_sihyeong",
        label: { ko: "부천/광명/시흥", en: "Bucheon/Gwangmyeong/Siheung" },
      },
      {
        key: 2050,
        name: "hanam_namyangju_uijeongbu",
        label: { ko: "하남/남양주/의정부", en: "Hanam/Namyangju/Uijeongbu" },
      },
      {
        key: 2060,
        name: "goyang_paju_gimpo",
        label: { ko: "고양/파주/김포", en: "Goyang/Paju/Gimpo" },
      },
    ],
  },
  {
    key: 3000,
    name: "incheon",
    label: { ko: "인천", en: "Incheon" },
    children: [
      {
        key: 3010,
        name: "bupyong",
        label: { ko: "부평", en: "Bupyeong" },
      },
      {
        key: 3020,
        name: "seoknam_seogucheong_gyeongingyodae",
        label: { ko: "석남/서구청/경인교대", en: "Seoknam/Seogu Office/Gyeongin Univ." },
      },
      {
        key: 3030,
        name: "yeonsu_songdo",
        label: { ko: "연수/송도", en: "Yeonsu/Songdo" },
      },
      {
        key: 3040,
        name: "sinpo_dongincheon_yeongjongdo",
        label: { ko: "신포/동인천/영종도", en: "Sinpo/Dongincheon/Yeongjongdo" },
      },
      {
        key: 3050,
        name: "soreapogu_hogupo",
        label: { ko: "소래포구/호구포", en: "Soraepogu/Hogupo" },
      },
      {
        key: 3060,
        name: "guwaldong",
        label: { ko: "구월동", en: "Guwol-dong" },
      },
    ],
  },
];
