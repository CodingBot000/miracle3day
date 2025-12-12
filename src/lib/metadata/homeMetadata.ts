// lib/metadata/homeMetadata.ts
import { Metadata } from 'next';

type LocaleMeta = {
  title: string;
  description: string;
  keywords: string[];
};

const metadataByLocale: Record<string, LocaleMeta> = {
  en: {
    title: 'Korean Dermatology & Skin Clinic for Foreigners | Free Video Consultation | Mimotok',
    description: 'Book Korean dermatology for foreigners. Free video consultation with clinics. Get instant quotes via AI questionnaire. Glass skin, laser, botox at Korean prices. English support.',
    keywords: [
      'Korean dermatology for foreigners',
      'K-beauty treatments Seoul',
      'Korea skin clinic English',
      'medical tourism Korea skin',
      'glass skin treatment Korea',
      'Korean laser treatment booking',
      'free consultation Korean clinic',
      'Korea dermatology video consultation',
      'Korean beauty clinic quote',
      'Gangnam dermatology foreigners',
      'Seoul skin clinic booking',
      'Korea botox price',
      'Korean filler clinic',
      'K-beauty medical tourism'
    ]
  },
  ko: {
    title: '미모톡 - 외국인 피부과·성형외과 예약 | 무료 화상상담 | AI 견적',
    description: '외국인 환자를 위한 한국 피부과, 성형외과 예약 플랫폼. 무료 화상상담, 문진표 기반 AI 자동 견적. 영어, 일본어, 중국어 상담 지원.',
    keywords: [
      '외국인 피부과',
      '의료관광 피부과',
      '외국인 성형외과',
      '무료 화상상담',
      '피부과 견적',
      '강남 피부과 외국인',
      '한국 의료관광'
    ]
  },
  ja: {
    title: '韓国皮膚科・美容クリニック予約 | 無料ビデオ相談 | 日本語対応 | Mimotok',
    description: '韓国の皮膚科・美容クリニックをオンライン予約。無料ビデオ相談で医師と直接話せる。問診票で自動見積り。レーザー、ボトックス、ヒアルロン酸を韓国価格で。',
    keywords: [
      '韓国 皮膚科 予約',
      '韓国 美容クリニック 日本語',
      '江南 皮膚科',
      '韓国 レーザー治療 値段',
      '韓国 ボトックス 安い',
      '韓国 美容医療 相談',
      '韓国 皮膚科 無料相談',
      '韓国 美容 ビデオ相談',
      'K-beauty 施術',
      '韓国 医療観光 皮膚科',
      '韓国 ヒアルロン酸 価格',
      '韓国 美肌 治療'
    ]
  },
  'zh-TW': {
    title: '韓國皮膚科・整形外科預約 | 免費視訊諮詢 | 中文服務 | Mimotok',
    description: '線上預約韓國皮膚科診所。免費視訊諮詢直接與醫生溝通。問診表AI自動報價。雷射、肉毒、玻尿酸，韓國價格。提供中文服務。',
    keywords: [
      '韓國皮膚科預約',
      '韓國整形外科',
      '江南皮膚科',
      '韓國醫美價格',
      '韓國雷射治療',
      '韓國肉毒桿菌',
      '韓國玻尿酸',
      '韓國美容診所中文',
      '韓國醫療觀光',
      '韓國皮膚科免費諮詢',
      '韓國美容視訊諮詢',
      'K-beauty療程'
    ]
  },
  'zh-CN': {
    title: '韩国皮肤科・整形外科预约 | 免费视频咨询 | 中文服务 | Mimotok',
    description: '在线预约韩国皮肤科诊所。免费视频咨询直接与医生沟通。问诊表AI自动报价。激光、肉毒、玻尿酸，韩国价格。提供中文服务。',
    keywords: [
      '韩国皮肤科预约',
      '韩国整形外科',
      '江南皮肤科',
      '韩国医美价格',
      '韩国激光治疗',
      '韩国肉毒杆菌',
      '韩国玻尿酸',
      '韩国美容诊所中文',
      '韩国医疗观光',
      '韩国皮肤科免费咨询',
      '韩国美容视频咨询',
      'K-beauty疗程'
    ]
  }
};

export function getHomeMetadata(locale: string): Metadata {
  const meta = metadataByLocale[locale] || metadataByLocale.en;
  const baseUrl = 'https://www.mimotok.com';

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${baseUrl}/${locale}`,
      siteName: 'Mimotok',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Mimotok - Korean Beauty Clinic Booking',
        }
      ],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [`${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'en': '/en',
        'ko': '/ko',
        'ja': '/ja',
        'zh-TW': '/zh-TW',
        'zh-CN': '/zh-CN',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}
