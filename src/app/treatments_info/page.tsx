// app/(site)/treatments/page.tsx
import TreatmentsViewer from "./TreatmentsViewer";

export const dynamic = "error"; // 정적 페이지(SSG)

export default function Page() {
  // 라우팅으로 언어를 쓰지 않는다면 여기서 고정
  // [lang] 세그먼트를 쓰는 경우엔 해당 값 넘겨주세요.
  return <TreatmentsViewer lang="en" />;
}
