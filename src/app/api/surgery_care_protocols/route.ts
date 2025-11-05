import { q } from "@/lib/db";
import { TABLE_SURGERY_CARE_PROTOCOLS } from "@/constants/tables";
import type { SurgeryCategory } from "@/app/models/surgeryData.dto";

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? 200);

    // WHERE 조건 구성
    const wheres: string[] = [];
    const values: any[] = [];

    searchParams.forEach((v, k) => {
      if (k.startsWith("eq.")) {
        values.push(v);
        wheres.push(`${k.slice(3)} = $${values.length}`);
      }
    });

    const whereSQL = wheres.length ? `WHERE ${wheres.join(" AND ")}` : "";

    // SQL 쿼리
    const sql = `
      SELECT * FROM ${TABLE_SURGERY_CARE_PROTOCOLS}
      ${whereSQL}
      ORDER BY category_sort_order ASC, area_sort_order ASC
      LIMIT $${values.length + 1}
    `;
    values.push(limit);

    const rows = await q<SurgeryProtocolRow>(sql, values);

    // category별로 그룹핑
    const categoryMap = new Map<string, SurgeryCategory>();

    for (const row of rows) {
      const categoryKey = row.category;

      if (!categoryMap.has(categoryKey)) {
        categoryMap.set(categoryKey, {
          category: row.category,
          category_title_ko: row.category_title_ko,
          category_title_en: row.category_title_en,
          category_sort_order: row.category_sort_order ?? 0,
          concern_copy_ko: row.concern_copy_ko ?? undefined,
          concern_copy_en: row.concern_copy_en ?? undefined,
          surgeries: [],
        });
      }

      const category = categoryMap.get(categoryKey)!;
      category.surgeries.push({
        id: row.id,
        area_id: row.area_id,
        area_name_ko: row.area_name_ko,
        area_name_en: row.area_name_en,
        surgery_id: row.surgery_id,
        preparation: (row.preparation ?? {}) as any,
        expected_results: (row.expected_results ?? {
          duration: { ko: '', en: '' },
          benefits: [],
        }) as any,
      });
    }

    // 배열로 변환 및 정렬
    const categories = Array.from(categoryMap.values()).sort(
      (a, b) => a.category_sort_order - b.category_sort_order
    );

    return Response.json(
      { categories },
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    console.error("surgery_care_protocols route error:", err);
    return Response.json(
      { error: "Failed to retrieve surgery protocols" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
