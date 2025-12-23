"use client";

import PreConsultationIntakeForm from "./PreConsultationSurveyFlow/PreConsultationIntakeForm";
import ConsultationGuidePage from "./PreConsultationSurveyFlow/ConsultationGuidePage";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Cookies from "js-cookie";
import { introModal } from "./pre_consultation_intake/form-definition_pre_con_base";
import { getLocalizedText } from "@/utils/i18n";
import { GA4_EVENT_ACTION } from "@/lib/ga4_event_execute";
import { getDeviceType } from "@/utils/deviceDetection";

const INTRO_COOKIE_KEY = "pre_consultation_intro_hidden";
const GUIDE_COOKIE_KEY = "pre_consultation_guide_seen";

export default function PreConsultationIntakeFormPage() {
  const [showGuide, setShowGuide] = useState(true);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const locale = useLocale();

    // GA4 이벤트: 설문 페이지 진입 추적
    useEffect(() => {
      GA4_EVENT_ACTION.LANDING_VIDEO_CONSULT({
        locale: locale,
        device_type: getDeviceType(),
        referrer_url: typeof document !== 'undefined' ? document.referrer : '',
        page_path: window.location.pathname,
      });
    }, []); // 빈 dependency array = 컴포넌트 마운트 시 1회만 실행
  
    
  useEffect(() => {
    // 가이드 페이지를 이미 봤는지 확인
    const guideSeen = Cookies.get(GUIDE_COOKIE_KEY);
    if (guideSeen) {
      setShowGuide(false);
      // 가이드를 이미 본 경우, 인트로 모달 체크
      const introHidden = Cookies.get(INTRO_COOKIE_KEY);
      if (!introHidden) {
        setShowIntroModal(true);
      }
    }
  }, []);

  const handleGuideStart = () => {
    // 가이드 페이지를 봤다고 쿠키 저장 (세션 동안만)
    Cookies.set(GUIDE_COOKIE_KEY, "true");
    setShowGuide(false);

    // 인트로 모달 표시 여부 확인
    const introHidden = Cookies.get(INTRO_COOKIE_KEY);
    if (!introHidden) {
      setShowIntroModal(true);
    }
  };

  const handleConfirm = () => {
    if (dontShowAgain) {
      // 30일간 쿠키 저장
      Cookies.set(INTRO_COOKIE_KEY, "true", { expires: 30 });
    }
    setShowIntroModal(false);
  };

  // 가이드 페이지 표시
  if (showGuide) {
    return <ConsultationGuidePage locale={locale} onStart={handleGuideStart} />;
  }

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
                {getLocalizedText(introModal.pg1, locale)}
              </span>
            </div>
            <div className="text-gray-700">
              <p className="mb-4 whitespace-pre-line text-sm">
                {getLocalizedText(introModal.pg2, locale)}
              </p>

              <p className="text-sm">
                {getLocalizedText(introModal.pg3, locale)}
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
                {getLocalizedText(introModal.pg4, locale)}
              </span>
            </label>
              <label className="text-sm text-gray-400">
                {getLocalizedText(introModal.pg5, locale)}
              </label>

            {/* 확인 버튼 */}
            <button
              onClick={handleConfirm}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {getLocalizedText(introModal.pg6, locale)}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PreConsultationIntakeForm은 항상 렌더링 */}
      <PreConsultationIntakeForm />
    </div>
  );
}

