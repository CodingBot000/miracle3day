"use client";

import PreConsultationIntakeForm from "./PreConsultationSurveyFlow/PreConsultationIntakeForm";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Cookies from "js-cookie";

const INTRO_COOKIE_KEY = "pre_consultation_intro_hidden";

export default function PreConsultationIntakeFormPage() {
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    // 쿠키 확인하여 모달 표시 여부 결정
    const introHidden = Cookies.get(INTRO_COOKIE_KEY);
    if (!introHidden) {
      setShowIntroModal(true);
    }
  }, []);

  const handleConfirm = () => {
    if (dontShowAgain) {
      // 30일간 쿠키 저장
      Cookies.set(INTRO_COOKIE_KEY, "true", { expires: 30 });
    }
    setShowIntroModal(false);
  };

  return (
    <div>
      {/* 인트로 모달 */}
      <Dialog open={showIntroModal} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-md [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="flex flex-col space-y-4">
            <div className="p-3 text-sm text-blue-800 rounded-lg bg-blue-50" role="alert">
              <span className="font-medium">
                {locale === 'ko' ? "안내 사항" : "Introductory Message"}
              </span>
            </div>
            <div className="text-gray-700">
              <p className="mb-4 whitespace-pre-line text-sm">
                {locale === 'ko'
                  ? "본 사전 문진은 원활한 화상상담 예약을 위해 필요한 기본 정보를 확인하는 절차입니다.\n화상상담은 신청일 기준 약 1주일 후부터 가능하며,\n문진 마지막 단계에서 상담 가능한 날짜와 시간을 선택하실 수 있습니다."
                  : "This pre-consultation questionnaire helps us collect the essential information needed to schedule your video consultation.\nVideo consultations are available approximately one week after your request.\nAt the final step, you will be able to select your preferred consultation dates and times."}
              </p>
              
              <p className="text-sm">
                {locale === 'ko'
                  ? "문진 작성을 완료한 후, 화상 상담 일정을 예약하실 수 있습니다. 감사합니다!"
                  : "After completing the intake form, you can schedule your video consultation. Thank you!"}
              </p>

            </div>

            {/* 다시 보지 않기 체크박스 */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                {locale === 'ko' ? "다시 보지 않기" : "Don't show again"}
              </span>
            </label>
              <label className="text-sm text-gray-400">
                {locale === 'ko'
                  ? "안내문의 주요 사항에 변경이 있을 경우 다시 보여질 수 있습니다."
                  : "This notice may be shown again if any key information is updated."}
              </label>

            {/* 확인 버튼 */}
            <button
              onClick={handleConfirm}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {locale === 'ko' ? "확인" : "Confirm"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PreConsultationIntakeForm은 항상 렌더링 */}
      <PreConsultationIntakeForm />
    </div>
  );
}

