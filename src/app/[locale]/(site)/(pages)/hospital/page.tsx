export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Metadata } from "next";
import HospitalListNewDesign from "./components/HospitalListNewDesign";
import { TABLE_HOSPITAL } from "@/constants/tables";
import { q } from "@/lib/db";
import type { HospitalData } from "@/app/models/hospitalData.dto";

type Props = {
  searchParams: { locationNum?: string };
};

export const metadata: Metadata = {
  title: "Clinic List | Beauty Well",
  description: "Find the best beauty and medical hospitals in Korea",
};

// 서버 컴포넌트에서 직접 DB 쿼리 (HTTP 호출 대신)
async function getHospitalListDirect() {
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
      ORDER BY created_at DESC
    `;
    const rows = await q<HospitalData>(sql);
    return rows;
  } catch (error) {
    console.error("[getHospitalListDirect] failed:", error);
    return [];
  }
}

const HospitalListPage = async ({ searchParams: _searchParams }: Props) => {
  const hospitalData = await getHospitalListDirect();

  return (
    <main className="min-h-screen bg-white">
      <HospitalListNewDesign initialData={hospitalData} />
    </main>
  );
};

export default HospitalListPage;
