// export type FormType = 'single-select' | 'multi-select' | 'file-upload';

// export interface OptionWithSub {
//   label: string;
//   sub?: string[];
//   input?: boolean;
// }

// export type Option = string | OptionWithSub;

// export interface FormDefinitionProps {
//   id: string;
//   type: FormType;
//   title: string;
//   subdescription?: string;
//   options?: Option[];
// }


// export const formDefinition2: FormDefinitionProps[] = [
//   {
//     id: "q1",
//     type: "multi-select",
//     title: "현재 피부 상태에 대해 알려주세요",
//     subdescription: "아름다워질 시간이에요",
//     options: [
//       { label: "여드름/트러블", sub: ["염증성 여드름", "좁쌀 여드름", "여드름 흉터/착색"] },
//       { label: "색소침착/잡티", sub: ["기미", "주근깨", "햇빛 잡티"] },
//       { label: "주름/탄력 저하", sub: ["눈가/입가 주름", "얼굴 전체 탄력 저하", "목 주름"] },
//       { label: "모공 확장", sub: ["콧볼/코 주변", "볼/턱"] },
//       { label: "붉은기/홍조", sub: ["민감성 피부", "혈관 확장"] },
//       { label: "기타", input: true }
//     ]
//   },
//   {
//     id: "q2",
//     type: "single-select",
//     title: "현재 나이대를 선택해주세요",
//     subdescription: "피부 상태는 나이에 따라 다르게 나타나요",
//     options: ["10대", "20대", "30대", "40대", "50대 이상"]
//   },
//   {
//     id: "q3",
//     type: "single-select",
//     title: "피부 타입은 어떤가요?",
//     subdescription: "좀 더 아름다워질 수 있어요. 더 알려주세요.",
//     options: ["지성", "건성", "복합성", "민감성"]
//   },
//   {
//     id: "q4",
//     type: "single-select",
//     title: "피부 고민이 생긴지 얼마나 되었나요?",
//     subdescription: "얼마 안남았어요, 힘내세요",
//     options: ["1개월 이내", "1~6개월", "6개월~1년", "1년 이상"]
//   },
//   {
//     id: "q5",
//     type: "multi-select",
//     title: "평소 피부 관리 방식은 어떤가요?",
//     subdescription: "당신의 아름다움을 도와드릴게요",
//     options: ["보습제만 사용", "기초화장품", "자외선 차단제", "병원 시술 경험 있음", "홈케어 제품 사용"]
//   },
//   {
//     id: "q6",
//     type: "multi-select",
//     title: "과거에 받았던 피부과 시술이 있다면 선택해주세요",
//     subdescription: "당신의 아름다움이 거의 완성되어 가고 있어요.",
//     options: ["레이저 토닝", "IPL / LDM", "피코레이저", "프락셀", "보톡스 / 필러", "리프팅", "기타", "시술 받은 적 없음"]
//   },
//   {
//     id: "q7",
//     type: "single-select",
//     title: "피부과 시술을 받을 때 가장 중요한 요소는 무엇인가요?",
//     subdescription: "이제 아름다움을 완성하는데 거의 다 왔어요.",
//     options: ["가격", "시술 효과", "통증 여부", "회복 기간", "시술 후기", "병원 위치"]
//   },
//   {
//     id: "q8",
//     type: "multi-select",
//     title: "희망하는 시술 부위는 어디인가요?",
//     subdescription: "아름다워질 준비가 되었나요?",
//     options: ["이마", "눈가", "볼", "턱선", "목", "등/가슴", "기타"]
//   },
//   {
//     id: "q9",
//     type: "multi-select",
//     title: "특정 질환이나 복용 중인 약이 있으신가요?",
//     subdescription: "이제 마지막이에요!",
//     options: ["없음", "피부 질환", "임신/수유 중", "항생제/스테로이드 복용 중", "기타"]
//   },
//   {
//     id: "q10",
//     type: "file-upload",
//     title: "본인 얼굴 사진을 첨부해주세요 (선택 사항)"
//   }
// ];