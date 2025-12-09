"use client";

import PreConsultationIntakeForm from "./PreConsultationSurveyFlow/PreConsultationIntakeForm";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Cookies from "js-cookie";
import { introModal } from "./pre_consultation_intake/form-definition_pre_con_base";
import { getLocalizedText } from "@/utils/i18n";

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

