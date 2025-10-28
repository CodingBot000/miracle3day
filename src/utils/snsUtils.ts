/**
 * SNS 플랫폼별 URL 파싱 및 표준화 유틸리티
 */

export type SNSPlatform =
  | 'instagram'
  | 'tiktok'
  | 'wechat'
  | 'line'
  | 'whatsapp'
  | 'facebook'
  | 'kakao_talk'
  | 'youtube'
  | 'telegram'
  | 'other';

export interface ParsedSNSResult {
  url: string;
  displayValue: string;
  isIdOnly?: boolean;
  message?: string;
}

/**
 * Instagram URL 파싱
 * 예: ortaclinic_en -> https://www.instagram.com/ortaclinic_en/
 */
export const parseInstagramUrl = (input: string): ParsedSNSResult => {
  if (!input) return { url: '', displayValue: '' };

  const trimmed = input.trim();

  // 이미 완전한 URL인 경우
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { url: trimmed, displayValue: trimmed };
  }

  // '/' 로 시작하는 경우 제거
  const username = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;

  // @ 제거
  const cleanUsername = username.replace('@', '');

  const url = `https://www.instagram.com/${cleanUsername}/`;
  return { url, displayValue: url };
};

/**
 * TikTok URL 파싱
 * 예: reonedermatology -> https://www.tiktok.com/@reonedermatology
 */
export const parseTikTokUrl = (input: string): ParsedSNSResult => {
  if (!input) return { url: '', displayValue: '' };

  const trimmed = input.trim();

  // 이미 완전한 URL인 경우
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // @가 없는 경우 추가
    if (trimmed.includes('tiktok.com/') && !trimmed.includes('tiktok.com/@')) {
      const url = trimmed.replace('tiktok.com/', 'tiktok.com/@');
      return { url, displayValue: url };
    }
    return { url: trimmed, displayValue: trimmed };
  }

  // 아이디만 있는 경우
  const username = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  const url = `https://www.tiktok.com/${username}`;
  return { url, displayValue: url };
};

/**
 * WeChat 파싱
 * - URL인 경우: ID만 추출
 * - ID만 있는 경우: 그대로 사용
 */
export const parseWeChatId = (input: string): ParsedSNSResult => {
  if (!input) return { url: '', displayValue: '' };

  const trimmed = input.trim();

  // URL 형태인 경우 ID 추출
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // URL에서 마지막 경로 세그먼트 추출
    const urlParts = trimmed.split('/').filter(part => part && part !== 'wechat');
    const wechatId = urlParts[urlParts.length - 1];

    return {
      url: '',
      displayValue: wechatId,
      isIdOnly: true,
      message: 'ID가 복사되었습니다. WeChat에서 친구 추가를 하고 대화를 나누세요.'
    };
  }

  // 이미 ID만 있는 경우
  return {
    url: '',
    displayValue: trimmed,
    isIdOnly: true,
    message: 'ID가 복사되었습니다. WeChat에서 친구 추가를 하고 대화를 나누세요.'
  };
};

/**
 * Line URL 파싱
 * 예: ortaclinic -> https://line.me/R/ti/p/@ortaclinic
 */
export const parseLineUrl = (input: string): ParsedSNSResult => {
  if (!input) return { url: '', displayValue: '' };

  const trimmed = input.trim();

  // 이미 완전한 URL인 경우
  if (trimmed.startsWith('https://line.me')) {
    // @가 없는 경우 추가
    if (trimmed.includes('/ti/p/') && !trimmed.includes('/ti/p/@')) {
      const url = trimmed.replace('/ti/p/', '/ti/p/@');
      return { url, displayValue: url };
    }
    return { url: trimmed, displayValue: trimmed };
  }

  // 아이디만 있는 경우
  const lineId = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  const url = `https://line.me/R/ti/p/${lineId}`;
  return { url, displayValue: url };
};

/**
 * WhatsApp URL 파싱
 * 예: +82-10-4391-1171 -> https://wa.me/821043911171
 */
export const parseWhatsAppUrl = (input: string): ParsedSNSResult => {
  if (!input) return { url: '', displayValue: '' };

  const trimmed = input.trim();

  // 이미 wa.me URL인 경우
  if (trimmed.includes('wa.me/')) {
    return { url: trimmed, displayValue: trimmed };
  }

  // 전화번호에서 숫자만 추출
  const phoneNumber = trimmed.replace(/[^0-9]/g, '');

  const url = `https://wa.me/${phoneNumber}`;
  return { url, displayValue: url };
};

/**
 * Facebook URL 파싱
 * 예: 1mmps.eng -> https://www.facebook.com/1mmps.eng/
 */
export const parseFacebookUrl = (input: string): ParsedSNSResult => {
  if (!input) return { url: '', displayValue: '' };

  const trimmed = input.trim();

  // 이미 완전한 URL인 경우
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { url: trimmed, displayValue: trimmed };
  }

  // 아이디만 있는 경우
  const url = `https://www.facebook.com/${trimmed}/`;
  return { url, displayValue: url };
};

/**
 * KakaoTalk URL 파싱
 * 예: 계정아이디 -> https://pf.kakao.com/계정아이디
 */
export const parseKakaoTalkUrl = (input: string): ParsedSNSResult => {
  if (!input) return { url: '', displayValue: '' };

  const trimmed = input.trim();

  // 이미 pf.kakao.com URL인 경우
  if (trimmed.startsWith('https://pf.kakao.com/')) {
    return { url: trimmed, displayValue: trimmed };
  }

  // 아이디만 있는 경우
  const url = `https://pf.kakao.com/${trimmed}`;
  return { url, displayValue: url };
};

/**
 * YouTube URL 파싱
 * URL이 없으면 기본 YouTube URL 추가
 */
export const parseYouTubeUrl = (input: string): ParsedSNSResult => {
  if (!input) return { url: '', displayValue: '' };

  const trimmed = input.trim();

  // 이미 완전한 URL인 경우
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { url: trimmed, displayValue: trimmed };
  }

  // 채널 ID 또는 사용자명만 있는 경우
  // @가 있으면 사용자명, 없으면 채널 ID로 간주
  const url = trimmed.startsWith('@')
    ? `https://www.youtube.com/${trimmed}`
    : `https://www.youtube.com/channel/${trimmed}`;

  return { url, displayValue: url };
};

/**
 * Telegram URL 파싱
 */
export const parseTelegramUrl = (input: string): ParsedSNSResult => {
  if (!input) return { url: '', displayValue: '' };

  const trimmed = input.trim();

  // 이미 완전한 URL인 경우
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { url: trimmed, displayValue: trimmed };
  }

  // 아이디만 있는 경우 (@ 제거)
  const username = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
  const url = `https://t.me/${username}`;
  return { url, displayValue: url };
};

/**
 * 플랫폼에 따라 적절한 파싱 함수 호출
 */
export const parseSNSUrl = (platform: SNSPlatform, input: string): ParsedSNSResult => {
  if (!input) return { url: '', displayValue: '' };

  switch (platform) {
    case 'instagram':
      return parseInstagramUrl(input);
    case 'tiktok':
      return parseTikTokUrl(input);
    case 'wechat':
      return parseWeChatId(input);
    case 'line':
      return parseLineUrl(input);
    case 'whatsapp':
      return parseWhatsAppUrl(input);
    case 'facebook':
      return parseFacebookUrl(input);
    case 'kakao_talk':
      return parseKakaoTalkUrl(input);
    case 'youtube':
      return parseYouTubeUrl(input);
    case 'telegram':
      return parseTelegramUrl(input);
    case 'other':
    default:
      // other_channel은 파싱 없이 그대로 사용
      return { url: input, displayValue: input };
  }
};

/**
 * SNS 링크 클릭 핸들러
 * WeChat은 ID 복사, 나머지는 새 창에서 열기
 */
export const handleSNSClick = (platform: SNSPlatform, input: string): void => {
  const parsed = parseSNSUrl(platform, input);

  if (parsed.isIdOnly) {
    // WeChat의 경우 ID 복사
    navigator.clipboard.writeText(parsed.displayValue);
    if (parsed.message) {
      alert(parsed.message);
    }
  } else if (parsed.url) {
    // 일반 URL은 새 창에서 열기
    window.open(parsed.url, '_blank');
  }
};
