import { HospitalDetailInfo } from "@/models/hospitalData.dto";
import Image from "next/image";
import React, { useState } from "react";
import { parseSNSUrl, type SNSPlatform } from "@/utils/snsUtils";
import CopyAlertModal from "@/components/template/modal/CopyAlertModal";
// import Image from "next/image";;

type ContactType = 'tel' | 'email' | 'link';

interface ContactItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  type: ContactType;
  platform?: SNSPlatform;
}

interface HospitalContactInfoProps {
  hospitalDetails: HospitalDetailInfo;
}

const HospitalContactInfo = ({ hospitalDetails }: HospitalContactInfoProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const handleClick = async (item: ContactItem) => {
    if (item.type === 'tel') {
      // 모바일에서는 전화걸기
      window.location.href = `tel:${item.value}`;
    } else if (item.type === 'email') {
      // 이메일 클라이언트 열기
      window.location.href = `mailto:${item.value}`;
    } else if (item.type === 'link' && item.platform) {
      const parsed = parseSNSUrl(item.platform, item.value);

      // WeChat의 경우 ID 복사 및 모달 표시
      if (parsed.isIdOnly) {
        try {
          await navigator.clipboard.writeText(parsed.displayValue);
          setCopiedText(parsed.displayValue);
          setCopyMessage(parsed.message || '');
          setShowCopyModal(true);
        } catch (err) {
          console.error('복사 실패:', err);
        }
      } else if (parsed.url) {
        // Instagram의 경우 앱 시도 후 웹으로 fallback
        if (item.platform === 'instagram') {
          const username = parsed.url.split('instagram.com/')[1]?.replace('/', '');
          if (username) {
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

        // 일반 SNS는 새 창에서 열기
        window.open(parsed.url, '_blank');
      }
    }
  };
  const contactItems: ContactItem[] = [
    {
      icon: <Image src="/icons/icon_sns_tell.svg" alt="Tel" width={16} height={16} />,
      label: "Tel",
      value: hospitalDetails.tel,
      type: "tel"
    },
    {
      icon: <Image src="/icons/icon_sns_email.png" alt="Email" width={16} height={16} />,
      label: "email",
      value: hospitalDetails.email,
      type: "email"
    },
    {
      icon: <Image src="/icons/icon_sns_homepage.svg" alt="Homepage" width={16} height={16} />,
      label: "homepage",
      value: hospitalDetails.other_channel,
      type: "link",
      platform: "other"
    },
    {
      icon: <Image src="/icons/icon_sns_instagram.png" alt="Instagram" width={16} height={16} />,
      label: "instagram",
      value: hospitalDetails.instagram?.default || '',
      type: "link",
      platform: "instagram"
    },
    {
      icon: <Image src="/icons/icon_sns_facebook.png" alt="Facebook Messenger" width={16} height={16} />,
      label: "facebook_messenger",
      value: hospitalDetails.facebook_messenger?.default || '',
      type: "link",
      platform: "facebook"
    },
    {
      icon: <Image src="/icons/icon_sns_we_chat.png" alt="WeChat" width={16} height={16} />,
      label: "we_chat",
      value: hospitalDetails.we_chat?.default || '',
      type: "link",
      platform: "wechat"
    },
    {
      icon: <Image src="/icons/icon_sns_whats_app.jpg" alt="WhatsApp" width={16} height={16} />,
      label: "whats_app",
      value: hospitalDetails.whats_app?.default || '',
      type: "link",
      platform: "whatsapp"
    },
    {
      icon: <Image src="/icons/icon_sns_ticktok.png" alt="TikTok" width={16} height={16} />,
      label: "tiktok",
      value: hospitalDetails.tiktok?.default || '',
      type: "link",
      platform: "tiktok"
    },
    {
      icon: <Image src="/icons/icon_sns_youtube.svg" alt="YouTube" width={16} height={16} />,
      label: "youtube",
      value: hospitalDetails.youtube?.default || '',
      type: "link",
      platform: "youtube"
    },
    {
      icon: <Image src="/icons/icon_sns_line.png" alt="Line" width={16} height={16} />,
      label: "line",
      value: hospitalDetails.line?.default || '',
      type: "link",
      platform: "line"
    },
    {
      icon: <Image src="/icons/icon_sns_kakaotalk.png" alt="KakaoTalk" width={16} height={16} />,
      label: "kakao_talk",
      value: hospitalDetails.kakao_talk?.default || '',
      type: "link",
      platform: "kakao_talk"
    },
    {
      icon: <Image src="/icons/icon_sns_facebook.png" alt="Telegram" width={16} height={16} />,
      label: "telegram",
      value: hospitalDetails.telegram?.default || '',
      type: "link",
      platform: "telegram"
    },
  ];

  const filteredItems = contactItems.filter(
    item => (item.value && item.value.trim() !== '') &&
            !(item.label === 'email' && item.value.includes('notexist')) &&
            item.type !== 'tel' && // Hide tel from display
            item.type !== 'email' // Hide email from display
  );

  const needsCopyButton = (item: ContactItem) => item.type === 'tel' || item.type === 'email';

  return (
    <div>
      {/* 데스크탑: 좌측정렬 가로 나열, 모바일: 5개 초과시 5열 그리드 */}
      <div className={`
        flex flex-wrap gap-6
        ${filteredItems.length > 5 ? 'grid grid-cols-5 md:flex' : ''}
      `}>
        {filteredItems.map((item, index) => (
          <div key={index} className="relative flex flex-col items-center">
            {/* 복사 버튼 (tel/email만) */}
            {needsCopyButton(item) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(item.value, index);
                }}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors z-10"
                title="copy"
              >
                {copiedIndex === index ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 2H12C13.1046 2 14 2.89543 14 4V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V4C2 2.89543 2.89543 2 4 2Z" stroke="#6b7280" strokeWidth="1.5"/>
                    <path d="M10 6H14V10" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            )}

            {/* 아이콘 버튼 */}
            <button
              onClick={() => handleClick(item)}
              className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 relative">
                {React.cloneElement(item.icon as React.ReactElement, {
                  width: 32,
                  height: 32,
                  className: "w-full h-full object-contain"
                })}
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Copy Alert Modal */}
      <CopyAlertModal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        mainString={copiedText}
        subDescString={copyMessage}
      />
    </div>
  );
};

export default HospitalContactInfo;
