import React, { useState, useEffect } from 'react';
import InputField from './InputField';
import { Button } from '../ui/button';

import { AlertModal } from  "@/components/template/modal";
import { HelpCircle } from 'lucide-react';
import SNSConsentButton from "@/components/template/modal/SNSContentModal";
import Divider from './Divider';
import { BasicInfo } from '@/models/admin/basicinfo';
import { isValidEmail } from '@/utils/validators';
import { log } from "@/utils/logger";
import { isValid } from 'date-fns';

const SNS_CHANNEL_LABELS = {
  kakao_talk: 'KakaoTalk',
  line: 'LINE',
  we_chat: 'WeChat',
  whats_app: 'WhatsApp',
  telegram: 'Telegram',
  facebook_messenger: 'Facebook\nMessenger',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'Youtube',
  other_channel: 'Other\nChannel',
} as const;

type SnsChannelKey = keyof typeof SNS_CHANNEL_LABELS;

interface BasicInfoSectionProps {
  onInfoChange: (info: BasicInfo) => void;
  initialInfo?: BasicInfo;
}

function MessengerTable() {
  const messengerData = [
    {
      messenger: "KakaoTalk",
      countries: "한국",
      comment: "한국 병원이라면 필수 채널",
    },
    {
      messenger: "LINE",
      countries: "일본, 태국, 대만",
      comment: "일본·동남아 핵심",
    },
    {
      messenger: "WeChat",
      countries: "중국",
      comment: "중국 고객 대응 필수, 없으면 불가능 수준",
    },
    {
      messenger: "WhatsApp",
      countries: "인도, 동남아, 유럽, 남미, 중동",
      comment: "거의 모든 영어권·남미·중동",
    },
    {
      messenger: "Telegram",
      countries: "러시아권, 중동, 인도",
      comment: "러시아/중동은 WhatsApp+Telegram이 표준",
    },
    {
      messenger: "Facebook Messenger",
      countries: "미국, 동남아, 남미",
      comment: "페북 기반 광고와 자연스럽게 연동됨",
    },
        {
      messenger: "Instagram DM",
      countries: "글로벌 (뷰티·성형·젊은층)",
      comment: "뷰티/성형 업종 핵심, 사진 기반 홍보 후 DM 문의",
    },
    {
      messenger: "TikTok DM",
      countries: "글로벌 (Z세대·바이럴)",
      comment: "영상 바이럴 후 DM 문의, 메인상담은 외부 메신저 연결 권장",
    },
    {
      messenger: "Youtube",
      countries: "글로벌 (뷰티·성형·젊은층)",
      comment: "뷰티/성형 업종 핵심, 사진 기반 홍보 후 DM 문의",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b border-gray-300 text-left">메신저</th>
            <th className="px-4 py-2 border-b border-gray-300 text-left">주요 대상 국가</th>
            <th className="px-4 py-2 border-b border-gray-300 text-left">코멘트</th>
          </tr>
        </thead>
        <tbody>
          {messengerData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b border-gray-200">{item.messenger}</td>
              <td className="px-4 py-2 border-b border-gray-200">{item.countries}</td>
              <td className="px-4 py-2 border-b border-gray-200">{item.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const BasicInfoSection = ({
  onInfoChange,
  initialInfo,
}: BasicInfoSectionProps) => {
  log.info('BasicInfoSection initialInfo:', {
    sns_content_agreement: initialInfo?.sns_content_agreement,
    type: initialInfo?.sns_content_agreement != null ? typeof initialInfo.sns_content_agreement : 'null'
  });
  
  const [info, setInfo] = useState<BasicInfo>({
    name: initialInfo?.name || '',
    name_en: initialInfo?.name_en || '',
    email: initialInfo?.email || '',
    introduction: initialInfo?.introduction || '',
    introduction_en: initialInfo?.introduction_en || '',
    tel: initialInfo?.tel || '',

    kakao_talk: initialInfo?.kakao_talk || '',
    line: initialInfo?.line || '',
    we_chat: initialInfo?.we_chat || '',
    whats_app: initialInfo?.whats_app || '',
    telegram: initialInfo?.telegram || '',
    facebook_messenger: initialInfo?.facebook_messenger || '',
    instagram: initialInfo?.instagram || '',
    tiktok: initialInfo?.tiktok || '',
    youtube: initialInfo?.youtube || '',
    other_channel: initialInfo?.other_channel || '',
    sns_content_agreement: initialInfo?.sns_content_agreement ?? null,
  });

  // initialInfo가 변경될 때마다 info 상태 업데이트
  useEffect(() => {
    if (initialInfo) {
      log.info('initialInfo changed, updating info state:', initialInfo.sns_content_agreement);
      setInfo({
        name: initialInfo.name || info.name,
        name_en: initialInfo.name_en || info.name_en,
        email: initialInfo.email || info.email,
        introduction: initialInfo.introduction || info.introduction,
        introduction_en: initialInfo.introduction_en || info.introduction_en,
        tel: initialInfo.tel || info.tel,
       
        kakao_talk: initialInfo.kakao_talk || info.kakao_talk,
        line: initialInfo.line || info.line,
        we_chat: initialInfo.we_chat || info.we_chat,
        whats_app: initialInfo.whats_app || info.whats_app,
        telegram: initialInfo.telegram || info.telegram,
        facebook_messenger: initialInfo.facebook_messenger || info.facebook_messenger,
        instagram: initialInfo.instagram || info.instagram,
        tiktok: initialInfo.tiktok || info.tiktok,
        youtube: initialInfo.youtube || info.youtube,
        other_channel: initialInfo.other_channel || info.other_channel,
        sns_content_agreement: initialInfo.sns_content_agreement ?? info.sns_content_agreement,
      });
    }
  }, [initialInfo]);

  log.info('BasicInfoSection info state:', {
    sns_content_agreement: info.sns_content_agreement,
    type: info.sns_content_agreement != null ? typeof info.sns_content_agreement : 'null'
  });

  const [showSnsModal, setShowSnsModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const [tel, setTel] = useState(info.tel || '');


  // 이메일 blur 핸들러
  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (email && !isValidEmail(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
    } else {
      setEmailError('');
    }
  };

  // 전화번호 입력 핸들러
  const handleTelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9\-]/g, ''); // 숫자와 하이픈만 허용
    setTel(value);
    handleChange('tel', value);
  };

  const handleChange = (
    field: keyof BasicInfo,
    value: string
  ) => {
    const newInfo = { ...info, [field]: value };
    setInfo(newInfo);
    onInfoChange(newInfo);
  };

  const handleSnsChange = (
    channel: SnsChannelKey,
    value: string
  ) => {
    const newInfo = {
      ...info,
      [channel]: value,
    };
    setInfo(newInfo);
    onInfoChange(newInfo);
  };

  const handleSnsAgreementChange = (value: 1 | 0) => {
    const newInfo = {
      ...info,
      sns_content_agreement: value,
    };
    setInfo(newInfo);
    onInfoChange(newInfo);
  };

  // 활성화된 SNS 채널 목록 (값이 있는 채널만)
  const activeChannels = Object.entries({
    kakao_talk: info.kakao_talk,
    line: info.line,
    we_chat: info.we_chat,
    whats_app: info.whats_app,
    telegram: info.telegram,
    facebook_messenger: info.facebook_messenger,
    instagram: info.instagram,
    tiktok: info.tiktok,
    youtube: info.youtube,
    other_channel: info.other_channel,
  } as Record<SnsChannelKey, string>)
    .filter(([_, value]) => value)
    .map(([key]) => SNS_CHANNEL_LABELS[key as SnsChannelKey]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">기본 정보</h3>
        <InputField
          label="병원명"
          name="name"
          required
          value={info.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />

        <InputField
          label="병원명 (영문)"
          name="name"
          required
          value={info.name_en}
          placeholder='영문명은 구글맵에서 검색가능한 키워드로 권장드립니다. 영문명이 없으면 발음대로 써주세요.'
          onChange={(e) => handleChange('name_en', e.target.value)}
        />
      <div className="flex flex-row w-full gap-6">
          {/* 병원 소개 - 국문 */}
          <div className="flex flex-col w-1/2 gap-1">
            <label htmlFor="introduction" className="font-medium">
              병원 소개 (국문입력)
            </label>
            <textarea
              id="introduction"
              name="introduction"
              required
              value={info.introduction}
              onChange={(e) => handleChange('introduction', e.target.value)}
              placeholder="예: 저희 병원은 최신 장비와..."
              className="w-full px-3 py-2 border border-gray-300 rounded outline-none transition focus:border-blue-500 resize-none"
              rows={4}
            />
          </div>

          {/* 병원 소개 - 영문 */}
          <div className="flex flex-col w-1/2 gap-1">
            <label htmlFor="introduction_en" className="font-medium">
              병원 소개 (영문입력-선택사항)
            </label>
            <textarea
              id="introduction_en"
              name="introduction_en"
              required
              value={info.introduction_en}
              onChange={(e) => handleChange('introduction_en', e.target.value)}
              placeholder="입력하지 않으면 국문 입력을 기반으로 자동번역됩니다."
              className="w-full px-3 py-2 border border-gray-300 rounded outline-none transition focus:border-blue-500 resize-none"
              rows={4}
            />
          </div>
        </div>


        <InputField
          label="대표 이메일"
          name="email"
          type="email"
          required
          value={info.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={handleEmailBlur}
          isError={!!emailError}
          errorMessage={emailError}
        />
        
       

        <InputField
          label="대표 전화번호"
          name="tel"
          type="tel"
          inputMode="tel"
          required
          value={tel}
          onChange={handleTelChange}
          placeholder="예: 02-1234-5678 또는 010-1234-5678"
        />

        <div>
          <p className='text-red-500'>* 진료문의/진료상담/마케팅담당자/SMS수신 - 전화번호, 이메일 등은 다음 스텝에 별도 입력란이 있습니다. </p>
        </div>
        <Divider />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">SNS 상담 채널</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className='text-xs bg-black text-white'
              onClick={() => setShowSnsModal(true)}
            >
              추가하기
            </Button>
            <h4 className="text-sm text-gray-400">
              해외대상 서비스 이므로 카카오톡 외에도 필요시 새로 만드셔서 추가하시길 적극 권장합니다. 향후 언제든지 추가/변경 가능합니다. 
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              onClick={() => setShowGuideModal(true)}
            >
              <HelpCircle className="w-4 h-4" />
              채널별 가이드 보기
            </Button>
          </div>
          
          {activeChannels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeChannels.map((channel) => (
                <div
                  key={channel}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {channel}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertModal
        open={showSnsModal}
        onCancel={() => setShowSnsModal(false)}
        onConfirm={() => setShowSnsModal(false)}
        showCancelButton
        cancelText="닫기"
        confirmText="저장"
        className="max-w-lg"
        title="SNS 채널 정보 입력"
      >
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-500 mb-2">
            각 SNS 채널의 주소를 입력해주세요. 입력하지 않은 채널은 표시되지 않습니다. 
          </p>
          <p className="text-sm text-red-500 mb-2">
            해외 이용자를 위해 여러채널을 추가해주시는게 좋습니다.
          </p>
          
          {Object.entries(SNS_CHANNEL_LABELS).map(([key, label]) => (
            <InputField
              key={key}
              label={label}
              name={key}
              value={info[key as SnsChannelKey]}
              onChange={(e) =>
                handleSnsChange(key as SnsChannelKey, e.target.value)
              }
              placeholder={`${label} 주소 입력`}
            />
          ))}
        </div>
      </AlertModal>

      <AlertModal
        open={showGuideModal}
        onCancel={() => setShowGuideModal(false)}
        onConfirm={() => setShowGuideModal(false)}
        showCancelButton={false}
        confirmText="확인"
        className="max-w-4xl"
        title="SNS 채널별 가이드"
      >
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-6">
            각 SNS 채널별 주요 대상 국가와 특징을 확인하세요.
          </p>
          <MessengerTable />
        </div>
      </AlertModal>

      {/* SNS 채널 컨텐츠 이용 동의 */}
      <div className="space-y-4">
      
      <div className="flex items-center  gap-4">
        <h3 className="text-lg font-semibold text-red-400">
            SNS 홍보 채널의 컨텐츠 이용 동의
        </h3>
        <SNSConsentButton />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="snsAgreement"
                checked={info.sns_content_agreement === 1}
                onChange={() => handleSnsAgreementChange(1)}
                className="w-4 h-4 text-blue-600"
              />
              <span>컨텐츠 이용 동의</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="snsAgreement"
                checked={info.sns_content_agreement === 0}
                onChange={() => handleSnsAgreementChange(0)}
                className="w-4 h-4 text-blue-600"
              />
              <span>컨텐츠 이용을 동의하지 않음</span>
            </label>
          </div>
     
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
