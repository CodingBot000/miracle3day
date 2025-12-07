
export interface BasicInfo {
    name: string;
    name_en: string;
    email: string;
    introduction: string;
    introduction_en: string;
    tel: string;
    kakao_talk: string;
      line: string;
    we_chat: string;
    whats_app: string;
      telegram: string;
    facebook_messenger: string;
      instagram: string;
      tiktok: string;
      youtube: string;
      other_channel: string;
    sns_content_agreement: 1 | 0 | null;
  }
  

  export interface ContactsInfo {
    consultationPhone: string;
    consultationManagerPhones: string[];
    smsPhone: string;
    eventManagerPhone: string;
    marketingEmails: string[];
  }