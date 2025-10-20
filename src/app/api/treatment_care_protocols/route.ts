// src/app/api/treatment_care_protocols/route.ts
import { query } from "@/lib/db";

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

  for (const [k, v] of searchParams.entries()) {
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
  }

  const whereSQL = wheres.length ? `WHERE ${wheres.join(" AND ")}` : "";

  const orders: string[] = [];
  for (const o of searchParams.getAll("order")) {
    const [col, dir] = o.split(".");
    orders.push(`${col} ${dir?.toUpperCase() === "DESC" ? "DESC" : "ASC"}`);
  }
  const orderSQL = orders.length ? `ORDER BY ${orders.join(",")}` : "";

  const sql = `SELECT ${select} FROM treatment_care_protocols ${whereSQL} ${orderSQL} LIMIT $${values.length + 1}`;
  console.log('sqlsqlsqlsql: ', sql);
  values.push(limit);

  const { rows } = await query(sql, values);
  return new Response(JSON.stringify(rows), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
