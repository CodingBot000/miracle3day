import { CategoryNode } from "@/models/admin/category";


export function findRegionByKey(
  nodes: CategoryNode[],
  key: number
): CategoryNode | null {
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


export const REGIONS: CategoryNode[] = [
    {
      key: 1000,
      name: "seoul",
      label: "서울",
      children: [
        {
          key: 1010,
          name: "gangnam_shinnonhyeon_yangjae",
          label: "강남역/신논현역/양재",
        },
        {
          key: 1020,
          name: "cheongdam_apgujeong_sinsa",
          label: "청담/압구정/신사",
        },
        {
          key: 1030,
          name: "seolleung_samsung",
          label: "선릉/삼성",
        },
        {
          key: 1040,
          name: "nonhyeon_banpo_hakdong",
          label: "논현/반포/학동",
        },
        {
          key: 1050,
          name: "seocho_gyodae_bangbae",
          label: "서초/교대/방배",
        },
        {
          key: 1060,
          name: "daechi_dogok_hanti",
          label: "대치/도곡/한티",
        },
        {
          key: 1070,
          name: "hongdae_hapjeong_shinchon",
          label: "홍대/합정/신촌",
        },
        {
          key: 1080,
          name: "seoulstation_myeongdong_hoehyeon",
          label: "서울역/명동/회현",
        },
        {
          key: 1090,
          name: "jamsil_seokchon_cheongho",
          label: "잠실/석촌/천호",
        },
        {
          key: 1100,
          name: "wangsimni_seongsu_gundae",
          label: "왕십리/성수/건대",
        },
        {
          key: 1110,
          name: "magok_hwagok_mokdong",
          label: "마곡/화곡/목동",
        },
        {
          key: 1120,
          name: "jongno_euljiro_chungjeongno",
          label: "종로/을지로/충정로",
        },
        {
          key: 1130,
          name: "yeongdeungpo_yeouido_noryangjin",
          label: "영등포/여의도/노량진",
        },
        {
          key: 1140,
          name: "mia_dobong_nowon",
          label: "미아/도봉/노원",
        },
        {
          key: 1150,
          name: "itaewon_yongsan_samgakji",
          label: "이태원/용산/삼각지",
        },
        {
          key: 1160,
          name: "snudongjak_sadang_dongjak",
          label: "서울대/사당/동작",
        },
        {
          key: 1170,
          name: "eunpyeong_sangam",
          label: "은평/상암",
        },
        {
          key: 1180,
          name: "sindorim_guro",
          label: "신도림/구로",
        },
        {
          key: 1190,
          name: "mapo_gongdeok",
          label: "마포/공덕",
        },
        {
          key: 1200,
          name: "geumcheon_gasan",
          label: "금천/가산",
        },
        {
          key: 1210,
          name: "suseo_bokjeong_jangji",
          label: "수서/복정/장지",
        },
      ],
    },
    {
      key: 2000,
      name: "gyeonggi",
      label: "경기",
      children: [
        {
          key: 2010,
          name: "suwon_hwaseong",
          label: "수원/화성",
        },
        {
          key: 2020,
          name: "seongnam_yongin",
          label: "성남/용인",
        },
        {
          key: 2030,
          name: "anmyeong_uiwang",
          label: "안양/의왕",
        },
        {
          key: 2040,
          name: "bucheon_gwangmyeong_sihyeong",
          label: "부천/광명/시흥",
        },
        {
          key: 2050,
          name: "hanam_namyangju_uijeongbu",
          label: "하남/남양주/의정부",
        },
        {
          key: 2060,
          name: "goyang_paju_gimpo",
          label: "고양/파주/김포",
        }
      ],
    },
    {
      key: 3000,
      name: "incheon",
      label: "인천",
      children: [
        {
          key: 3010,
          name: "bupyong",
          label: "부평",
        },
        {
          key: 3020,
          name: "seoknam_seogucheong_gyeongingyodae",
          label: "석남/서구청/경인교대",
        },
        {
          key: 3030,
          name: "yeonsu_songdo",
          label: "연수/송도",
        },
        {
          key: 3040,
          name: "sinpo_dongincheon_yeongjongdo",
          label: "신포/동인천/영종도",
        },
        {
          key: 3050,
          name: "soreapogu_hogupo",
          label: "소래포구/호구포",
        },
        {
          key: 3060,
          name: "guwaldong",
          label: "구월동",
        }
      ],

    },
  ];
  