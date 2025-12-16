"use client";

import { HospitalDetailInfo, SNSChannelData } from "@/models/hospitalData.dto";
import Image from "next/image";
import React, { useState } from "react";
import { parseSNSUrl, type SNSPlatform } from "@/utils/snsUtils";
import { parseSNSChannelData, type ParsedSNSChannel } from "@/utils/snsChannelUtils";
import CopyAlertModal from "@/components/template/modal/CopyAlertModal";
import { useLocale } from "next-intl";
import { MessageCircle } from "lucide-react";
import { useHospitalTouchpointTracking } from "@/hooks/useHospitalTouchpointTracking";

interface DirectChatChannelsProps {
  hospitalDetails: HospitalDetailInfo;
}

interface ChannelItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: SNSChannelData;
  platform: SNSPlatform;
  needsCopy?: boolean;
  accounts?: ParsedSNSChannel[];
}

const DirectChatChannels = ({ hospitalDetails }: DirectChatChannelsProps) => {
  const locale = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  // 터치포인트 추적 훅
  const { trackEvent } = useHospitalTouchpointTracking(hospitalDetails.id_uuid_hospital);

  const isKorean = locale === 'ko';

  const labels = {
    ko: {
      directChat: "Direct Chat",
      copySuccess: "ID가 복사되었습니다.",
      channelNames: {
        instagram: "Instagram",
        facebook_messenger: "Messenger",
        we_chat: "WeChat",
        whats_app: "WhatsApp",
        tiktok: "TikTok",
        line: "Line",
        kakao_talk: "KakaoTalk",
        telegram: "Telegram",
        other_channel: "Website",
      },
    },
    en: {
      directChat: "Direct Chat",
      copySuccess: "ID has been copied.",
      channelNames: {
        instagram: "Instagram",
        facebook_messenger: "Messenger",
        we_chat: "WeChat",
        whats_app: "WhatsApp",
        tiktok: "TikTok",
        line: "Line",
        kakao_talk: "KakaoTalk",
        telegram: "Telegram",
        other_channel: "Website",
      },
    },
  };

  // 채널 정의
  const channelDefinitions: Omit<ChannelItem, 'value'>[] = [
    {
      id: 'instagram',
      icon: <Image src="/icons/icon_sns_instagram.png" alt="Instagram" width={20} height={20} />,
      label: 'instagram',
      platform: 'instagram',
    },
    {
      id: 'facebook_messenger',
      icon: <Image src="/icons/icon_sns_facebook.png" alt="Facebook Messenger" width={20} height={20} />,
      label: 'facebook_messenger',
      platform: 'facebook',
    },
    {
      id: 'we_chat',
      icon: <Image src="/icons/icon_sns_we_chat.png" alt="WeChat" width={20} height={20} />,
      label: 'we_chat',
      platform: 'wechat',
      needsCopy: true,
    },
    {
      id: 'whats_app',
      icon: <Image src="/icons/icon_sns_whats_app.jpg" alt="WhatsApp" width={20} height={20} />,
      label: 'whats_app',
      platform: 'whatsapp',
    },
    {
      id: 'tiktok',
      icon: <Image src="/icons/icon_sns_ticktok.png" alt="TikTok" width={20} height={20} />,
      label: 'tiktok',
      platform: 'tiktok',
    },
    {
      id: 'line',
      icon: <Image src="/icons/icon_sns_line.png" alt="Line" width={20} height={20} />,
      label: 'line',
      platform: 'line',
    },
    {
      id: 'kakao_talk',
      icon: <Image src="/icons/icon_sns_kakaotalk.png" alt="KakaoTalk" width={20} height={20} />,
      label: 'kakao_talk',
      platform: 'kakao_talk',
    },
    {
      id: 'telegram',
      icon: <Image src="/icons/icon_sns_facebook.png" alt="Telegram" width={20} height={20} />,
      label: 'telegram',
      platform: 'telegram',
    },
    {
      id: 'other_channel',
      icon: <Image src="/icons/icon_sns_homepage.svg" alt="Other" width={20} height={20} />,
      label: 'other_channel',
      platform: 'other',
    },
  ];

  // hospitalDetails에서 값이 있는 채널만 필터링
  const availableChannels: ChannelItem[] = channelDefinitions
    .map(def => {
      const value = hospitalDetails[def.id as keyof HospitalDetailInfo] as SNSChannelData;
      const accounts = parseSNSChannelData(value, locale);

      return {
        ...def,
        value,
        accounts,
      };
    })
    .filter(channel => channel.accounts && channel.accounts.length > 0);

  const handleChannelClick = async (channel: ChannelItem, account: ParsedSNSChannel) => {
    const parsed = parseSNSUrl(channel.platform, account.url);

    // WeChat의 경우 ID 복사 및 모달 표시
    if (parsed.isIdOnly) {
      try {
        await navigator.clipboard.writeText(parsed.displayValue);
        setCopiedText(parsed.displayValue);
        setCopyMessage(parsed.message || (isKorean ? labels.ko.copySuccess : labels.en.copySuccess));
        setShowCopyModal(true);

        // 추적: ID 복사
        trackEvent('external_link_click', {
          channel: channel.id,
          locale: account.locale,
          action_type: 'copy_id',
        });
      } catch (err) {
        console.error('복사 실패:', err);
      }
    } else if (parsed.url) {
      // Instagram의 경우 앱 시도 후 웹으로 fallback
      if (channel.platform === 'instagram') {
        const username = parsed.url.split('instagram.com/')[1]?.replace('/', '');
        if (username) {
          // 추적: Instagram 앱 리다이렉트 시도
          trackEvent('external_link_click', {
            channel: channel.id,
            locale: account.locale,
            link_url: parsed.url,
            action_type: 'link_click',
            app_redirect_attempt: true,
          });

          const appUrl = `instagram://user?username=${username}`;
          const appLink = document.createElement('a');
          appLink.href = appUrl;
          appLink.click();

          // 1초 후 웹사이트로 fallback
          setTimeout(() => {
            window.open(parsed.url, '_blank');
          }, 1000);
          return;
        }
      }

      // 추적: 링크 클릭
      trackEvent('external_link_click', {
        channel: channel.id,
        locale: account.locale,
        link_url: parsed.url,
        action_type: 'link_click',
      });

      // 일반 SNS는 새 창에서 열기
      window.open(parsed.url, '_blank');
    }
  };

  const handleCopy = async (channel: ChannelItem, account: ParsedSNSChannel, e: React.MouseEvent) => {
    e.stopPropagation();
    const parsed = parseSNSUrl(channel.platform, account.url);
    try {
      await navigator.clipboard.writeText(parsed.displayValue || account.url);
      setCopiedText(parsed.displayValue || account.url);
      setCopyMessage(isKorean ? labels.ko.copySuccess : labels.en.copySuccess);
      setShowCopyModal(true);

      // 추적: ID 복사
      trackEvent('external_link_click', {
        channel: channel.id,
        locale: account.locale,
        action_type: 'copy_id',
      });
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  if (availableChannels.length === 0) {
    return null;
  }

  return (
    <>
      <div className="relative">
        {/* Direct Chat 버튼 */}
      
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-2 py-1 bg-pink-600 text-white rounded-md font-medium text-xs leading-tight hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-1 w-full"
        >
            <MessageCircle size={12} /><span>{isKorean ? labels.ko.directChat : labels.en.directChat}</span>
          <svg
            className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 펼쳐지는 채널 목록 */}
        <div
          className={`absolute bottom-full right-0 mb-1 bg-white/95 backdrop-blur-sm shadow-lg rounded-lg p-2 min-w-[140px] max-h-[300px] overflow-y-auto transition-all duration-300 ease-out ${
            isExpanded
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <div className="flex flex-col gap-1.5">
            {availableChannels.map((channel, index) => (
              <React.Fragment key={channel.id}>
                {channel.accounts?.map((account) => (
                  <div
                    key={`${channel.id}-${account.locale}`}
                    className={`flex items-center gap-2 group transition-all duration-200 ${
                      isExpanded
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 -translate-x-2'
                    }`}
                    style={{
                      transitionDelay: isExpanded ? `${index * 30}ms` : `${(availableChannels.length - index) * 20}ms`,
                    }}
                  >
                    <button
                      onClick={() => handleChannelClick(channel, account)}
                      className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-5 h-5 flex-shrink-0">
                        {React.cloneElement(channel.icon as React.ReactElement, {
                          className: "w-full h-full object-contain",
                        })}
                      </div>
                      <span className="text-xs text-gray-700 truncate">
                        {account.flagEmoji && `${account.flagEmoji} `}
                        {isKorean
                          ? labels.ko.channelNames[channel.id as keyof typeof labels.ko.channelNames] || channel.label
                          : labels.en.channelNames[channel.id as keyof typeof labels.en.channelNames] || channel.label}
                      </span>
                    </button>
                    {(channel.needsCopy || channel.platform === 'wechat') && (
                      <button
                        onClick={(e) => handleCopy(channel, account, e)}
                        className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
                        title="Copy"
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M4 2H12C13.1046 2 14 2.89543 14 4V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V4C2 2.89543 2.89543 2 4 2Z"
                            stroke="#6b7280"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M10 6H14V10"
                            stroke="#6b7280"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Copy Alert Modal */}
      <CopyAlertModal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        mainString={copiedText}
        subDescString={copyMessage}
      />
    </>
  );
};

export default DirectChatChannels;

