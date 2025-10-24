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
  pain_level: string | null;
  pain_score_0_10: number | null;
  effect_onset_weeks_min: number | null;
  effect_onset_weeks_max: number | null;
  duration_months_min: number | null;
  duration_months_max: number | null;
  cost_currency: string | null;
  cost_from: number | null;
  rec_sessions_min: number | null;
  rec_sessions_max: number | null;
  rec_interval_weeks: number | null;
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
          r.pain_level,
          r.pain_score_0_10,
          r.effect_onset_weeks_min,
          r.effect_onset_weeks_max,
          r.duration_months_min,
          r.duration_months_max,
          r.cost_currency,
          r.cost_from,
          r.rec_sessions_min,
          r.rec_sessions_max,
          r.rec_interval_weeks,
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
          r.pain_level,
          r.pain_score_0_10,
          r.effect_onset_weeks_min,
          r.effect_onset_weeks_max,
          r.duration_months_min,
          r.duration_months_max,
          r.cost_currency,
          r.cost_from,
          r.rec_sessions_min,
          r.rec_sessions_max,
          r.rec_interval_weeks,
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
        pain_level,
        pain_score_0_10,
        effect_onset_weeks_min,
        effect_onset_weeks_max,
        duration_months_min,
        duration_months_max,
        cost_currency,
        cost_from,
        rec_sessions_min,
        rec_sessions_max,
        rec_interval_weeks,
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
