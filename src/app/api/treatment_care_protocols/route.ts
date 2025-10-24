// src/app/api/treatment_care_protocols/route.ts
import { q } from "@/lib/db";
import { TABLE_TREATMENT_CARE_PROTOCOLS } from "@/constants/tables";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const select = (searchParams.get("select") || "*").trim();
  const limit = Number(searchParams.get("limit") ?? 200);

  const wheres: string[] = [];
  const values: any[] = [];
  const add = (sql: string, val: any) => {
    values.push(val);
    wheres.push(sql.replace("$n", `$${values.length}`));
  };

  searchParams.forEach((v, k) => {
    if (k.startsWith("eq.")) add(`${k.slice(3)} = $n`, v);
    if (k.startsWith("ilike.")) add(`${k.slice(6)} ILIKE $n`, v);
    if (k.startsWith("in.")) {
      try {
        const arr = JSON.parse(v);
        values.push(arr);
        wheres.push(`${k.slice(3)} = ANY($${values.length})`);
      } catch {
        // ignore malformed JSON
      }
    }
  });

  const whereSQL = wheres.length ? `WHERE ${wheres.join(" AND ")}` : "";

  const orders: string[] = [];
  for (const o of searchParams.getAll("order")) {
    const [col, dir] = o.split(".");
    const safeCol = col.replace(/[^a-zA-Z0-9_]/g, "");
    if (!safeCol) continue;
    orders.push(`${safeCol} ${dir?.toUpperCase() === "DESC" ? "DESC" : "ASC"}`);
  }
  const orderSQL = orders.length ? `ORDER BY ${orders.join(",")}` : "";

  const sanitizedSelect = select
    .split(",")
    .map((col) => col.trim())
    .filter(Boolean)
    .map((col) => col.replace(/[^a-zA-Z0-9_.*]/g, ""))
    .join(", ") || "*";

  const sql = `SELECT ${sanitizedSelect} FROM ${TABLE_TREATMENT_CARE_PROTOCOLS} ${whereSQL} ${orderSQL} LIMIT $${values.length + 1}`;
  values.push(limit);

  const rows = await q(sql, values);
  return new Response(JSON.stringify(rows), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
