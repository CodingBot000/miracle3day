import { log } from '@/utils/logger';
import { redirect } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import ScrollTop from "@/components/atoms/ScrollTop";
import HospitalDetailNewDesign from "./components/HospitalDetailNewDesign";
import { TABLE_DOCTOR, TABLE_HOSPITAL, TABLE_HOSPITAL_BUSINESS_HOUR, TABLE_HOSPITAL_DETAIL, TABLE_HOSPITAL_TREATMENT } from "@/constants/tables";
import { q, one } from "@/lib/db";
import { DoctorData } from "@/models/hospitalData.dto";

type Props = {
  params: { id: string; locale: string };
  searchParams: { tab: string };
};

interface HospitalDetailPageProps extends Props {}

// 서버 컴포넌트에서 직접 DB 쿼리 (HTTP 호출 대신)
async function getHospitalMainDirect(id_uuid: string) {
  try {
    const hospitalSql = `
      SELECT
        id,
        id_uuid,
        name,
        name_en,
        address_full_road,
        address_full_road_en,
        address_full_jibun,
        address_full_jibun_en,
        address_si,
        address_si_en,
        address_gu,
        address_gu_en,
        address_dong,
        address_dong_en,
        zipcode,
        latitude,
        longitude,
        address_detail,
        address_detail_en,
        directions_to_clinic,
        directions_to_clinic_en,
        location,
        imageurls,
        thumbnail_url,
        created_at,
        searchkey,
        id_unique,
        id_surgeries,
        show,
        favorite_count
      FROM ${TABLE_HOSPITAL}
      WHERE id_uuid = $1
      LIMIT 1
    `;
    const hospital = await one(hospitalSql, [id_uuid]);
    if (!hospital) {
      return null;
    }

    const detailSql = `SELECT * FROM ${TABLE_HOSPITAL_DETAIL} WHERE id_uuid_hospital = $1 LIMIT 1`;
    const businessSql = `SELECT * FROM ${TABLE_HOSPITAL_BUSINESS_HOUR} WHERE id_uuid_hospital = $1 ORDER BY day_of_week`;
    const treatmentSql = `SELECT * FROM ${TABLE_HOSPITAL_TREATMENT} WHERE id_uuid_hospital = $1`;
    const doctorSql = `SELECT * FROM ${TABLE_DOCTOR} WHERE id_uuid_hospital = $1 ORDER BY display_order ASC NULLS LAST`;

    const [detailRow, businessRows, treatmentRows, doctorRows] = await Promise.all([
      one(detailSql, [id_uuid]),
      q(businessSql, [id_uuid]),
      q(treatmentSql, [id_uuid]),
      q(doctorSql, [id_uuid]),
    ]);

    const doctors: DoctorData[] = doctorRows.map((doctor: any) => ({
      name: doctor.name ?? "",
      name_en: doctor.name_en ?? "",
      bio: doctor.bio ?? "",
      bio_en: doctor.bio_en ?? "",
      image_url: doctor.image_url ?? "",
      chief: Number(doctor.chief ?? 0),
      display_order: Number(doctor.display_order ?? 0),
    }));

    return {
      hospital_info: hospital,
      hospital_details: detailRow ?? null,
      business_hours: businessRows,
      treatments: treatmentRows,
      doctors,
      favorite: [],
      favorite_count: hospital.favorite_count ?? 0,
    };
  } catch (error) {
    console.error("[getHospitalMainDirect] failed:", error);
    return null;
  }
}

// export async function generateMetadata(
//   { params, searchParams: _searchParams }: Props,
//   parent: ResolvingMetadata
// ): Promise<Metadata> {
//   log.debug(`HospitalDetailPage generateMetadata params.id: ${params?.id}`);

//   const data = await getHospitalMainDirect(params?.id);

//   const previousImages = (await parent).openGraph?.images || [];

//   if (!data) {
//     return { title: "Hospital Not Found" };
//   }

//   return {
//     title: `${data.hospital_info.name} | Hospital Detail`,
//     openGraph: {
//       images: [...data.hospital_info.imageurls || [], ...previousImages],
//     },
//   };
// }

export async function generateMetadata(
  { params, searchParams: _searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const locale = params?.locale || 'en';
  const data = await getHospitalMainDirect(params?.id);
  const previousImages = (await parent).openGraph?.images || [];
  
  if (!data) {
    return { title: "Hospital Not Found" };
  }

  const info = data.hospital_info;
  const details = data.hospital_details;
  
  // 병원명 (영어 우선)
  const hospitalName = info.name_en || info.name;
  
  // 지역명
  const district = info.address_gu_en || 'Seoul';
  
  // 지원 언어 변환
  interface LanguageMap {
    [key: string]: string;
  }

  const langMap: LanguageMap = {
    'en-US': 'English',
    'ja-JP': 'Japanese', 
    'zh-TW': 'Chinese',
    'zh-CN': 'Chinese',
    'zh-HK': 'Cantonese',
    'ko-KR': 'Korean',
    'th-TH': 'Thai',
    'vi-VN': 'Vietnamese'
  };
  
  const languages: string = (details?.available_languages as string[] | undefined)
    ?.map((lang: string) => langMap[lang] || lang)
    ?.filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
    ?.slice(0, 3)
    ?.join(', ') || 'English';

  // 의사 수
  const doctorCount = data.doctors?.length || 0;
  
  // 역 근처 정보
  const nearStation = info.directions_to_clinic_en || '';
  
  // 썸네일
  const thumbnail = info.thumbnail_url || info.imageurls?.[0];

  // SEO 타이틀 (60자 이내)
  const title = `${hospitalName} ${district} - Reviews & Booking | ${languages}`;
  
  // SEO 설명 (155자 이내)
  const description = `Book ${hospitalName} in ${district}, Seoul. ${doctorCount} doctors. ${nearStation ? nearStation + '.' : ''} ${languages} support. Korean dermatology & aesthetics at local prices.`;

  // 키워드
  const keywords = [
    hospitalName,
    `${hospitalName} reviews`,
    `${district} dermatology`,
    'Korean skin clinic',
    'Seoul dermatology booking',
    'Korea medical tourism',
    'Korean beauty clinic',
    'K-beauty treatments'
  ];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: `${hospitalName} - Korean Beauty Clinic in ${district}`,
      description,
      images: thumbnail 
        ? [{ url: thumbnail, width: 1200, height: 630 }, ...previousImages]
        : previousImages,
      type: 'website',
      locale: locale,
      siteName: 'Mimotok',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${hospitalName} | Mimotok`,
      description,
      images: thumbnail ? [thumbnail] : [],
    },
    alternates: {
      canonical: `https://www.mimotok.com/en/hospital/${info.id_uuid}`,
      languages: {
        'en': `/en/hospital/${info.id_uuid}`,
        'ko': `/ko/hospital/${info.id_uuid}`,
        'ja': `/ja/hospital/${info.id_uuid}`,
        'zh-TW': `/zh-TW/hospital/${info.id_uuid}`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

const HospitalDetailPage = async ({
  params,
  searchParams: _searchParams,
}: HospitalDetailPageProps) => {
  const id_uuid_hospital = params?.id;
  log.debug(`HospitalDetailPage async params.id: ${params?.id}`);

  if (id_uuid_hospital === "undefined") redirect("/");

  const data = await getHospitalMainDirect(id_uuid_hospital);

  if (!data) {
    redirect("/hospital");
  }

  return (
    <main className="min-h-screen bg-white">
      <ScrollTop />
      <HospitalDetailNewDesign hospitalData={data} />
    </main>
  );
};

export default HospitalDetailPage;
