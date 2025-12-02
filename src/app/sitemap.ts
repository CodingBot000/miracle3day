import { MetadataRoute } from 'next';
import { locales } from '@/i18n/routing';

const baseUrl = 'https://mimotok.com';

// 공개 정적 페이지 (route group 제외, 실제 URL 경로)
// 인증 필요 페이지, 내부용 페이지, deprecated 페이지 제외
const staticPages = [
  '/home',
  '/aboutus',
  '/hospital',
  '/event',
  '/community',
  '/partners',
  '/care-categories',
  '/treatments_info',
  '/treatment-based-age-guide',
  '/treatment-protocol/treatment-landing',
  '/treatment-protocol/treatment-landing/treatment-list',
  '/treatment-protocol/treatment-landing-v2',
  '/treatment-protocol/treatment-landing-v2/protocol',
  '/treatment-protocol/treatment-landing-v2/treatment-list',
  '/support/customer-support',
  '/legal/cookie-policy',
  '/ai/youcam/s2s',
  '/ai/youcam/jscamera',
  '/contents/post',
];

// 동적 페이지 데이터 가져오기 (추후 DB 연동)
async function getHospitalIds(): Promise<string[]> {
  // TODO: 실제 DB에서 병원 ID 목록 가져오기
  // const hospitals = await db.hospital.findMany({ select: { id: true } });
  // return hospitals.map(h => h.id);
  return [];
}

async function getEventIds(): Promise<string[]> {
  // TODO: 실제 DB에서 이벤트 ID 목록 가져오기
  return [];
}

async function getCommunityPostIds(): Promise<string[]> {
  // TODO: 실제 DB에서 커뮤니티 포스트 ID 목록 가져오기
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // 1. 정적 페이지 - 각 언어별로 생성
  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '/home' ? 'daily' : 'weekly',
        priority: page === '/home' ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}${page}`])
          ),
        },
      });
    }
  }

  // 2. 병원 상세 페이지 (동적)
  const hospitalIds = await getHospitalIds();
  for (const id of hospitalIds) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/hospital/${id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/hospital/${id}`])
          ),
        },
      });
    }
  }

  // 3. 이벤트 상세 페이지 (동적)
  const eventIds = await getEventIds();
  for (const id of eventIds) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/event/${id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/event/${id}`])
          ),
        },
      });
    }
  }

  // 4. 커뮤니티 포스트 상세 페이지 (동적)
  const postIds = await getCommunityPostIds();
  for (const id of postIds) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/community/post/${id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/community/post/${id}`])
          ),
        },
      });
    }
  }

  return entries;
}
