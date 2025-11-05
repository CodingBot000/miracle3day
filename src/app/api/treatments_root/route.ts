import { q } from "@/lib/db";
import { TABLE_TREATMENTS_ROOT, TABLE_TREATMENTS_ALIAS } from "@/constants/tables";

export const dynamic = "force-dynamic";

function parseIds(url: URL): string[] {
  const raw = url.searchParams.getAll("ids");
  if (!raw.length) return [];

  const ids: string[] = [];
  for (const chunk of raw) {
    chunk
      .split(",")
      .map(id => id.trim())
      .filter(Boolean)
      .forEach(id => ids.push(id));
  }
  return Array.from(new Set(ids));
}

type TreatmentRootRow = {
  requested_id: string;
  id: string;
  ko: string;
  en: string;
  group_id: string;
  summary: Record<string, unknown> | null;
  tags: unknown[] | null;
  attributes: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
  alias_id: string | null;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const ids = parseIds(url);

    if (!ids.length) {
      return Response.json({ data: [] }, { headers: { "Cache-Control": "no-store" } });
    }

    const sql = `
      WITH requested AS (
        SELECT DISTINCT unnest($1::text[]) AS requested_id
      ),
      candidates AS (
        SELECT
          req.requested_id,
          r.id,
          r.ko,
          r.en,
          r.group_id,
          r.summary,
          r.tags,
          r.attributes,
          r.created_at,
          r.updated_at,
          NULL::text AS alias_id,
          0 AS priority
        FROM requested req
        JOIN ${TABLE_TREATMENTS_ROOT} r ON r.id = req.requested_id

        UNION ALL

        SELECT
          req.requested_id,
          r.id,
          r.ko,
          r.en,
          r.group_id,
          r.summary,
          r.tags,
          r.attributes,
          r.created_at,
          r.updated_at,
          req.requested_id AS alias_id,
          1 AS priority
        FROM requested req
        JOIN ${TABLE_TREATMENTS_ALIAS} a ON a.alias_id = req.requested_id
        JOIN ${TABLE_TREATMENTS_ROOT} r ON r.id = a.root_id
      )
      SELECT
        requested_id,
        id,
        ko,
        en,
        group_id,
        summary,
        tags,
        attributes,
        created_at,
        updated_at,
        alias_id
      FROM (
        SELECT *,
               ROW_NUMBER() OVER (PARTITION BY requested_id ORDER BY priority ASC) AS dedupe_rank
        FROM candidates
      ) ranked
      WHERE dedupe_rank = 1;
    `;

    const rows = await q<TreatmentRootRow>(sql, [ids]);

    return Response.json(
      { data: rows },
      { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("treatments_root route error:", err);
    return Response.json(
      { error: "Failed to retrieve treatment root data" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
