import { one } from "@/lib/db";
import { TABLE_SURGERY_CARE_PROTOCOLS } from "@/constants/tables";
import type { SurgeryProtocol } from "@/models/surgeryData.dto";

export const dynamic = "force-dynamic";

type SurgeryProtocolRow = {
  id: string;
  category: 'facial_surgery' | 'body_surgery';
  category_title_ko: string;
  category_title_en: string;
  category_sort_order: number | null;
  concern_copy_ko: string | null;
  concern_copy_en: string | null;
  area_id: string;
  area_name_ko: string;
  area_name_en: string;
  area_sort_order: number | null;
  surgery_id: string;
  preparation: Record<string, any> | null;
  recovery_timeline: Record<string, any> | null;
  expected_results: Record<string, any> | null;
  cautions: Record<string, any> | null;
  meta: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const sql = `
      SELECT * FROM ${TABLE_SURGERY_CARE_PROTOCOLS}
      WHERE id = $1
    `;

    const row = await one<SurgeryProtocolRow>(sql, [id]);

    if (!row) {
      return Response.json(
        { error: "Surgery protocol not found" },
        {
          status: 404,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    // 응답 데이터 구성
    const surgeryProtocol: SurgeryProtocol = {
      id: row.id,
      category: row.category,
      category_title_ko: row.category_title_ko,
      category_title_en: row.category_title_en,
      category_sort_order: row.category_sort_order ?? undefined,
      concern_copy_ko: row.concern_copy_ko ?? undefined,
      concern_copy_en: row.concern_copy_en ?? undefined,
      area_id: row.area_id,
      area_name_ko: row.area_name_ko,
      area_name_en: row.area_name_en,
      area_sort_order: row.area_sort_order ?? undefined,
      surgery_id: row.surgery_id,
      preparation: (row.preparation ?? {}) as any,
      recovery_timeline: (row.recovery_timeline ?? {}) as any,
      expected_results: (row.expected_results ?? {
        duration: { ko: '', en: '' },
        benefits: [],
      }) as any,
      cautions: (row.cautions ?? { ko: '', en: '' }) as any,
      meta: row.meta ?? undefined,
      created_at: row.created_at ?? undefined,
      updated_at: row.updated_at ?? undefined,
    };

    return Response.json(surgeryProtocol, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("surgery_care_protocols [id] route error:", err);
    return Response.json(
      { error: "Failed to retrieve surgery protocol details" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
