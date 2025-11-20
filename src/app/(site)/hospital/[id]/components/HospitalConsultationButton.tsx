"use client";

import { useRouter } from "next/navigation";
import { ROUTE } from "@/router";
import { useState } from "react";
import { MessageCircle, Video } from "lucide-react";
import { useCookieLanguage } from "@/hooks/useCookieLanguage";
import { useLoginGuard } from "@/hooks/useLoginGuard";
import { HospitalDetailInfo } from "@/app/models/hospitalData.dto";
import DirectChatChannels from "./DirectChatChannels";

interface HospitalConsultationButtonProps {
  hospitalId: string;
  hospitalDetails: HospitalDetailInfo;
}

const HospitalConsultationButton = ({ hospitalId, hospitalDetails }: HospitalConsultationButtonProps) => {
  const router = useRouter();
  const { language } = useCookieLanguage();
  const { requireLogin, loginModal } = useLoginGuard();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [error, setError] = useState<string>("");

  const labels = {
    ko: {
      chat: "상담하기",
      reservation: "예약하기",
      videoConsultation: "화상상담예약",
      chatError: "상담을 시작할 수 없습니다. 다시 시도해주세요.",
      reservationError: "방문 예약페이지를 열수 없습니다. 다시 시도해주세요.",
      videoConsultationError: "실시간 상담 예약 페이지를 열 수 없습니다. 다시 시도해주세요.",
    },
    en: {
      chat: "Platform Chat",
      reservation: "Make Reservation",
      videoConsultation: "Video Consultation",
      chatError: "Unable to start consultation. Please try again.",
      reservationError: "Unable to open reservation page. Please try again.",
      videoConsultationError: "Unable to open video consultation booking page. Please try again.",
    },
  };

  const handleChatConsultation = async () => {
    try {
      setIsCreatingChat(true);
      setError("");

      // Check if user is logged in
      if (!requireLogin()) {
        setIsCreatingChat(false);
        return;
      }

      // 1. 서버에서 채널 초기화 (유저 upsert + 채널 생성 + 토큰 발급)
      const res = await fetch('/api/stream/init-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to initialize stream channel');
      }

      const { token, apiKey, channelId } = await res.json();

      // 2. 사용자 정보 가져오기 (userId 필요)
      const userRes = await fetch("/api/auth/getUser");
      const userData = await userRes.json();
      const userId = userData?.userInfo?.id_uuid;

      if (!userId) {
        throw new Error("User ID not found");
      }

      // 3. Stream 클라이언트 연결
      const { StreamChat } = await import("stream-chat");
      const client = StreamChat.getInstance(apiKey);

      await client.connectUser(
        {
          id: userId,
        },
        token
      );

      // 4. 채널 watch (서버에서 이미 생성됨)
      const channel = client.channel('messaging', channelId);
      await channel.watch();

      // 5. 채팅 페이지로 이동
      router.push(`/chat?cid=${channelId}`);
    } catch (err: any) {
      console.error("Error creating chat:", err);
      setError(language === 'ko' ? labels.ko.chatError : labels.en.chatError);
      setIsCreatingChat(false);
    }
  };

  const handleReservationClick = () => {
    try {
      setError("");

      // Check if user is logged in
      if (!requireLogin()) {
        return;
      }

      router.push(ROUTE.RESERVATION(hospitalId));
    } catch (err: any) {
      console.error("Error opening reservation page:", err);
      setError(language === 'ko' ? labels.ko.reservationError : labels.en.reservationError);
    }
  };

  const handleVideoConsultation = async () => {
    try {
      
      setError("");

      // 1. Check if user is logged in
      if (!requireLogin()) {
        return;
      }

      // Get user info after login check
      const userRes = await fetch("/api/auth/getUser");
      const userData = await userRes.json();
      const userInfo = userData?.userInfo;
      
      // 2. Check if user has complete profile (birthDate, id_country, phone_country_code)
      const hasCompleteProfile =
        userInfo.birth_date &&
        userInfo.id_country &&
        userInfo.phone_country_code;
        console.log('hasCompleteProfile:', hasCompleteProfile);
      if (!hasCompleteProfile) {
        const currentUrl = `/hospital/${hospitalId}`;
        router.push(
          `/login/onboarding/complete-profile?code=${userInfo.id_uuid}&returnUrl=${encodeURIComponent(currentUrl)}`
        );
        return;
      }

      // 3. Navigate to video consultation form with hospital ID
      router.push(`/pre_consultation_intake_form?hospitalId=${hospitalId}`);
    } catch (err: any) {
      console.error("Error starting video consultation:", err);
      setError(language === 'ko' ? labels.ko.videoConsultationError : labels.en.videoConsultationError);
    }
  };

  // Direct Chat 채널이 있는지 확인
  const hasDirectChatChannels = 
    (hospitalDetails.instagram && hospitalDetails.instagram.trim() !== '') ||
    (hospitalDetails.facebook_messenger && hospitalDetails.facebook_messenger.trim() !== '') ||
    (hospitalDetails.we_chat && hospitalDetails.we_chat.trim() !== '') ||
    (hospitalDetails.whats_app && hospitalDetails.whats_app.trim() !== '') ||
    (hospitalDetails.tiktok && hospitalDetails.tiktok.trim() !== '') ||
    (hospitalDetails.line && hospitalDetails.line.trim() !== '') ||
    (hospitalDetails.kakao_talk && hospitalDetails.kakao_talk.trim() !== '') ||
    (hospitalDetails.telegram && hospitalDetails.telegram.trim() !== '') ||
    (hospitalDetails.other_channel && hospitalDetails.other_channel.trim() !== '');

  return (
    <>
      {/* Login Required Modal */}
      {loginModal}

      {error && (
        <div className="fixed bottom-[calc(200px+160px)] right-5 z-50 max-w-xs">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="fixed bottom-[100px] right-5 z-40">
        <div className="flex flex-col gap-1.5 bg-white/95 backdrop-blur-sm shadow-lg rounded-lg p-2 w-28">
          {/* Direct Chat 버튼 - 채널 데이터가 있을 때만 표시 */}
          {hasDirectChatChannels && (
            <DirectChatChannels hospitalDetails={hospitalDetails} />
          )}

          <button
            onClick={handleChatConsultation}
            disabled={isCreatingChat}
            className="px-2 py-1 bg-[#4CAF50] text-white rounded-md font-medium text-xs leading-tight hover:bg-[#45a049] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1 w-full"
          >
            {isCreatingChat ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : (
              <>
                <MessageCircle size={12} />
                {language === 'ko' ? labels.ko.chat : labels.en.chat}
              </>
            )}
          </button>

          <button
            onClick={handleReservationClick}
            disabled={isCreatingChat}
            className="px-2 py-1 bg-[#FB718F] text-white rounded-md font-medium text-xs leading-tight hover:bg-[#f5648a] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full"
          >
            {language === 'ko' ? labels.ko.reservation : labels.en.reservation}
          </button>

          <button
            onClick={handleVideoConsultation}
            disabled={isCreatingChat}
            className="px-2 py-1 bg-[#2196F3] text-white rounded-md font-medium text-xs leading-tight hover:bg-[#1976D2] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1 w-full"
          >
            <Video size={12} />
            {language === 'ko' ? labels.ko.videoConsultation : labels.en.videoConsultation}
          </button>
        </div>
      </div>
    </>
  );
};

export default HospitalConsultationButton;
