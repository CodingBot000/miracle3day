// app/(site)/treatments/page.tsx
import { Suspense } from "react";
import TreatmentsViewer from "./TreatmentsViewer";

export const dynamic = "force-dynamic"; // 동적 페이지로 변경

function TreatmentsViewerWrapper() {
  return <TreatmentsViewer lang="en" />;
}

export default function Page() {
  // 라우팅으로 언어를 쓰지 않는다면 여기서 고정
  // [lang] 세그먼트를 쓰는 경우엔 해당 값 넘겨주세요.
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TreatmentsViewerWrapper />
    </Suspense>
  );
}
