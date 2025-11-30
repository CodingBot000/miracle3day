
"use client";

import { MobileAnalysisLoadingScreen } from "../common/analysis_animation/MobileAnalysisLoadingScreen";
import TreatmentAnalysisLoading from "../common/analysis_animation/TreatmentAnalysisLoading";


export default function LoaadingTest() {
  return (
    <div>
      {/* 데스크탑에서 테스트하려면 TreatmentAnalysisLoading 사용 */}
      {/* <TreatmentAnalysisLoading /> */}

      {/* 모바일 전용 컴포넌트 (md:hidden으로 데스크탑에서 안 보임) */}
      <MobileAnalysisLoadingScreen />
    </div>
  );
}

