"use client";

import { useRouter } from "next/navigation";
import { ROUTE } from "@/router";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useCookieLanguage } from "@/hooks/useCookieLanguage";

interface HospitalConsultationButtonProps {
  hospitalId: string;
}

const HospitalConsultationButton = ({ hospitalId }: HospitalConsultationButtonProps) => {
  const router = useRouter();
  const { language } = useCookieLanguage();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [error, setError] = useState<string>("");

  const handleChatConsultation = async () => {
    try {
      setIsCreatingChat(true);
      setError("");

      // Check if user is logged in
      const userRes = await fetch("/api/auth/getUser/session");
      const userData = await userRes.json();

      if (!userData.user) {
        // Redirect to login with return URL
        router.push(`/auth/login?redirect=/hospital/${hospitalId}`);
        return;
      }

      // Create chat channel
      const res = await fetch("/api/chat/create-channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_uuid: userData.user.id,
          hospital_id_uuid: hospitalId,
          payload: {
            message: "I would like to schedule a consultation",
          },
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to create chat channel");
      }

      // Redirect to chat channel
      router.push(`/chat/${encodeURIComponent(data.channel_url)}`);
    } catch (err: any) {
      console.error("Error creating chat:", err);
      setError(err.message || "Failed to start consultation. Please try again.");
      setIsCreatingChat(false);
    }
  };

  const handleReservationClick = () => {
    router.push(ROUTE.RESERVATION(hospitalId));
  };

  const labels = {
    ko: {
      chat: "상담하기",
      reservation: "예약하기",
      error: "상담을 시작할 수 없습니다. 다시 시도해주세요.",
    },
    en: {
      chat: "Start Chat",
      reservation: "Make Reservation",
      error: "Unable to start consultation. Please try again.",
    },
  };

  return (
    <>
      {error && (
        <div className="fixed left-0 right-0 bottom-24 flex justify-center px-4 z-50">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-[360px] w-full">
            <p className="text-sm">{language === 'ko' ? labels.ko.error : labels.en.error}</p>
          </div>
        </div>
      )}

      <div className="fixed left-0 right-0 bottom-0 flex justify-center px-4 py-0 bg-white z-40 shadow-lg">
        <div className="w-full max-w-[360px] h-20 flex items-center px-4 gap-3">
          <button
            onClick={handleChatConsultation}
            disabled={isCreatingChat}
            className="flex-1 h-12 bg-[#4CAF50] text-white rounded-lg font-semibold text-base leading-[22.4px] hover:bg-[#45a049] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreatingChat ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <MessageCircle size={18} />
                {language === 'ko' ? labels.ko.chat : labels.en.chat}
              </>
            )}
          </button>

          <button
            onClick={handleReservationClick}
            disabled={isCreatingChat}
            className="flex-1 h-12 bg-[#FB718F] text-white rounded-lg font-semibold text-base leading-[22.4px] hover:bg-[#f5648a] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {language === 'ko' ? labels.ko.reservation : labels.en.reservation}
          </button>
        </div>
      </div>
    </>
  );
};

export default HospitalConsultationButton;
