// import { CategoryNode } from "@/models/admin/category";

// export const TREATMENT_CATEGORIES: CategoryNode[] = [
//   {
//     key: 1000,
//     name: "lifting",
//     label: "리프팅",
//     children: [
//       {
//         key: 1010,
//         name: "radiofrequency",
//         label: "고주파",
//         children: [
//           { key: 1011, name: "thermage", label: "써마지" },
//           { key: 1012, name: "inmode", label: "인모드" },
//           { key: 1013, name: "tune_face", label: "튠페이스" },
//           { key: 1014, name: "density", label: "덴서티" },
//           { key: 1015, name: "oligio", label: "올리지오" },
//           { key: 1999, name: "etc_lifting_radiofrequency", label: "기타" },
//         ],
//       },
//       {
//         key: 1020,
//         name: "ultrasound",
//         label: "초음파",
//         children: [
//           { key: 1021, name: "ulthera", label: "울쎄라" },
//           { key: 1022, name: "liftera", label: "리프테라" },
//           { key: 1023, name: "shurink", label: "슈링크" },
//         ],
//       },
//       {
//         key: 1030,
//         name: "titanium",
//         label: "티타늄",
//         children: [
//           { key: 1031, name: "onda", label: "온다" },
//           { key: 1032, name: "tuneliner", label: "튠라이너" },
//           { key: 1033, name: "sop", label: "소프" },
//           { key: 1034, name: "wave", label: "웨이브" },
//         ],
//       },
//       {
//         key: 1040,
//         name: "eye",
//         label: "눈가",
//         children: [
//           { key: 1041, name: "eye_shurink", label: "아이 슈링크" },
//           { key: 1042, name: "eye_ulthera", label: "아이 울쎼라" },
//           { key: 1043, name: "tuneeyes", label: "튠아이즈" },
//           { key: 1044, name: "thermage_eye", label: "써마지 아이" },
//         ],
//       },
//     ],
//   },
//   {
//     key: 2000,
//     name: "filler",
//     label: "필러",
//     children: [
//       { key: 2001, name: "forehead", label: "이마" },
//       { key: 2002, name: "glabella", label: "미간" },
//       { key: 2003, name: "chin", label: "턱" },
//       { key: 2004, name: "side_cheek", label: "옆볼" },
//       { key: 2005, name: "under_eye", label: "눈밑" },
//       { key: 2006, name: "aegyo", label: "애교" },
//       { key: 2007, name: "shoulder", label: "어깨" },
//       { key: 2008, name: "body", label: "바디" },
//     ],
//   },
//   {
//     key: 3000,
//     name: "collagen_booster",
//     label: "콜라겐 부스터",
//     children: [
//       { key: 3001, name: "sculptra", label: "스컬트라" },
//       { key: 3002, name: "juvelook", label: "쥬베룩" },
//     ],
//   },
//   {
//     key: 4000,
//     name: "botox",
//     label: "보톡스",
//     children: [
//       { key: 4001, name: "eye_botox", label: "눈가" },
//       { key: 4002, name: "glabella", label: "미간" },
//       { key: 4003, name: "forehead", label: "이마" },
//       { key: 4004, name: "chin", label: "턱" },
//       { key: 4005, name: "salivary_gland", label: "침샘" },
//       { key: 4006, name: "nose_bridge", label: "콧등" },
//       { key: 4007, name: "skin_botox", label: "스킨보톡스" },
//     ],
//   },
//   {
//     key: 5000,
//     name: "laser_pigment_redness",
//     label: "레이저/ 색소/붉은기",
//     children: [
//       { key: 5001, name: "lipot", label: "리팟" },
//       { key: 5002, name: "genesis", label: "제네시스" },
//       { key: 5003, name: "pico", label: "피코" },
//       { key: 5004, name: "revlite", label: "레블라이트" },
//       { key: 5005, name: "ipl", label: "IPL" },
//       { key: 5006, name: "lipot2", label: "리팟" },
//       { key: 5007, name: "co2", label: "co2" },
//       { key: 5008, name: "vbeam", label: "브이빔" },
//       { key: 5009, name: "excel_v", label: "엑셀브이" },
//       { key: 5999, name: "etc_laser_pigment_redness", label: "기타" },
//     ],
//   },
//   {
//     key: 6000,
//     name: "pore",
//     label: "모공",
//     children: [
//       { key: 6001, name: "potenza", label: "포텐자" },
//       { key: 6002, name: "secret", label: "시크릿" },
//       { key: 6003, name: "fraxel", label: "프락셀" },
//       { key: 6999, name: "etc_pore", label: "기타" },
//     ],
//   },
//   {
//     key: 7000,
//     name: "scar",
//     label: "흉터",
//     children: [
//       { key: 7001, name: "fraxel_genia", label: "프락셀제냐" },
//       { key: 7002, name: "tripeel", label: "트리필" },
//       { key: 7003, name: "juvgen", label: "주브젠" },
//     ],
//   },
//   {
//     key: 8000,
//     name: "skin_booster",
//     label: "스킨부스터",
//     children: [
//       { key: 8001, name: "rejuran", label: "리쥬란" },
//       { key: 8002, name: "exosome", label: "엑소좀" },
//       { key: 8003, name: "juvelook", label: "쥬베룩" },
//       { key: 8004, name: "water_glow_injection", label: "물광주사" },
//       { key: 8005, name: "stem_cell", label: "줄기세포" },
//       { key: 8999, name: "etc_skin_booster", label: "기타" },
//     ],
//   },
//   {
//     key: 9000,
//     name: "peeling_care",
//     label: "필링, 관리",
//     children: [
//       { key: 9001, name: "aladdin_peel", label: "알라딘필" },
//       { key: 9002, name: "lalapeel", label: "라라필" },
//       { key: 9003, name: "ldm", label: "ldm" },
//     ],
//   },
//   {
//     key: 10000,
//     name: "acne",
//     label: "여드름",
//     children: [
//       { key: 10001, name: "capri", label: "카프리" },
//       { key: 10002, name: "neobeam", label: "네오빔" },
//     ],
//   },
// ];
