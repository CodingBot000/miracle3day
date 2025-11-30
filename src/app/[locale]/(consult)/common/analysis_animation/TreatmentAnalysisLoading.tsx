
import { AnalysisProgress } from "./AnalysisProgress";

export default function TreatmentAnalysisLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[240px] gap-4">
      {/* 로딩 스피너 같은 것 같이 */}
      <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-slate-500 animate-spin" />

      <AnalysisProgress
        locale="ko"
        delayBetweenStepsMs={1000}
        onComplete={() => {
          // 마지막 문장까지 다 보여주고 나서
          // 여기에서 실제 결과 fetch 완료 여부 보고
          // 상태 전환 / 라우터 이동 등 처리
        }}
      />

      {/* <p className="mt-2 text-xs text-slate-400">
        {`약 몇 초 정도 소요될 수 있습니다.`}
      </p> */}
    </div>
  );
}