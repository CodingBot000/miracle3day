export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Metadata } from "next";
import HospitalListNewDesign from "./components/HospitalListNewDesign";
import { TABLE_HOSPITAL } from "@/constants/tables";
import { q } from "@/lib/db";
import type { HospitalData } from "@/models/hospitalData.dto";
import { shuffleAndApplyPriority } from "@/utils/hospitalPriority";

type Props = {
  params: {
    locale: string;
  };
  searchParams: {
    locationNum?: string;
    treatmentId?: string;
    treatmentNameKo?: string;
    treatmentNameEn?: string;
  };
};

export const metadata: Metadata = {
  title: "Clinic List | Beauty Well",
  description: "Find the best beauty and medical hospitals in Korea",
};

// Next.js 서버 컴포넌트에서 자신의 API를 HTTP로 호출할 때 Vercel/Cloudflare에서 차단됨
// 그래서 여기서 직접호출하는중
// 검색해보면 다른 솔루션이있는것같긴한데 일단동작하니 놔두자

// 전체 병원 목록 조회
async function getHospitalListAll() {
  try {
    const sql = `
      SELECT
        created_at,
        name,
        name_en,
        searchkey,
        latitude,
        longitude,
        thumbnail_url,
        imageurls,
        id_surgeries,
        id_unique,
        id_uuid,
        location,
        address_full_road_en,
        address_full_jibun_en,
        show
      FROM ${TABLE_HOSPITAL}
      WHERE show = true
    `;
    const rows = await q<HospitalData>(sql);
    return rows;
  } catch (error) {
    console.error("[getHospitalListAll] failed:", error);
    return [];
  }
}

// 시술 기반 병원 조회
async function getHospitalListByTreatment(
  treatmentId: string,
  treatmentNameKo?: string,
  treatmentNameEn?: string
) {
  try {
    // treatmentId는 안전한 값만 허용 (영문, 숫자, 언더스코어만)
    if (!/^[a-zA-Z0-9_-]+$/.test(treatmentId)) {
      console.error("Invalid treatmentId:", treatmentId);
      return [];
    }

    let whereConditions = `'${treatmentId}' = ANY(tp.matched_root_ids)`;

    if (treatmentNameKo) {
      // SQL injection 방지를 위해 특수문자 escape
      const escapedKo = treatmentNameKo.replace(/'/g, "''");
      whereConditions += ` OR tp.name::text ILIKE '%${escapedKo}%'`;
    }

    if (treatmentNameEn) {
      const escapedEn = treatmentNameEn.replace(/'/g, "''");
      whereConditions += ` OR tp.name::text ILIKE '%${escapedEn}%'`;
    }

    const sql = `
      SELECT DISTINCT
        h.created_at,
        h.name,
        h.name_en,
        h.searchkey,
        h.latitude,
        h.longitude,
        h.thumbnail_url,
        h.imageurls,
        h.id_surgeries,
        h.id_unique,
        h.id_uuid,
        h.location,
        h.address_full_road_en,
        h.address_full_jibun_en,
        h.show
      FROM ${TABLE_HOSPITAL} h
      INNER JOIN treatment_product tp ON h.id_uuid = tp.id_uuid_hospital
      WHERE (${whereConditions})
      AND h.show = true
    `;

    const rows = await q<HospitalData>(sql);
    return rows;
  } catch (error) {
    console.error("[getHospitalListByTreatment] failed:", error);
    return [];
  }
}

// Fallback: 다국어 지원 병원 조회 (ko 제외 3개 이상 언어 지원)
async function getHospitalListByLanguages() {
  try {
    const sql = `
      SELECT DISTINCT
        h.created_at,
        h.name,
        h.name_en,
        h.searchkey,
        h.latitude,
        h.longitude,
        h.thumbnail_url,
        h.imageurls,
        h.id_surgeries,
        h.id_unique,
        h.id_uuid,
        h.location,
        h.address_full_road_en,
        h.address_full_jibun_en,
        h.show
      FROM ${TABLE_HOSPITAL} h
      INNER JOIN hospital_details hd ON h.id_uuid = hd.id_uuid_hospital
      WHERE cardinality(array_remove(hd.available_languages, 'ko')) >= 3
      AND h.show = true
    `;

    const rows = await q<HospitalData>(sql);
    return rows;
  } catch (error) {
    console.error("[getHospitalListByLanguages] failed:", error);
    return [];
  }
}

const HospitalListPage = async ({ params, searchParams }: Props) => {
  const { locale } = params;
  const { treatmentId, treatmentNameKo, treatmentNameEn } = searchParams;

  let hospitalData: HospitalData[] = [];
  let isFallback = false;

  if (treatmentId) {
    // 시술 기반 조회 시도
    hospitalData = await getHospitalListByTreatment(treatmentId, treatmentNameKo, treatmentNameEn);

    // 결과가 0개면 fallback 쿼리 실행
    if (hospitalData.length === 0) {
      hospitalData = await getHospitalListByLanguages();
      isFallback = true;
    }
  } else {
    // treatmentId가 없으면 전체 조회
    hospitalData = await getHospitalListAll();
  }

  // Randomize the order of hospitals and apply priority rules
  const shuffledHospitalData = shuffleAndApplyPriority(hospitalData);

  // Localized text
  const isKorean = locale === 'ko';
  const treatmentDisplayName = isKorean ? (treatmentNameKo || treatmentId) : (treatmentNameEn || treatmentId);
  const availableText = isKorean ? '시술 가능 병원' : 'clinics available';
  const countSuffix = isKorean ? '개' : '';

  return (
    <main className="min-h-screen bg-white">
      {/* 선택된 시술 정보 표시 (fallback이 아닌 경우만) */}
      {treatmentId && !isFallback && (
        <div className="px-4 py-3 bg-gradient-to-r from-[#FDF5F0] to-[#F8E8E0] border-b border-[#E8B4A0]/30">
          <p className="text-sm text-[#8B4513]">
            <span className="font-medium">&quot;{treatmentDisplayName}&quot;</span> {availableText} <span className="font-bold">{shuffledHospitalData.length}</span>{countSuffix}
          </p>
        </div>
      )}
      <HospitalListNewDesign initialData={shuffledHospitalData} isFallback={isFallback} />
    </main>
  );
};

export default HospitalListPage;
