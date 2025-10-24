import { NextResponse } from "next/server";
import { q, one } from "@/lib/db";
import { TABLE_HOSPITAL as TABLE } from "@/constants/tables";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function sanitizeSort(value: string | null) {
  if (!value) return "created_at";
  const sanitized = value.replace(/[^a-zA-Z0-9_]/g, "");
  return sanitized || "created_at";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") || DEFAULT_LIMIT), 1),
    MAX_LIMIT
  );
  const offset = Math.max(Number(searchParams.get("offset") || 0), 0);
  const sort = sanitizeSort(searchParams.get("sort"));
  const dir = searchParams.get("dir")?.toLowerCase() === "asc" ? "ASC" : "DESC";

  const args: any[] = [limit, offset];
  let sql = `SELECT * FROM ${TABLE}`;

  if (search) {
    sql += ` WHERE name ILIKE $3`;
    args.push(`%${search}%`);
  }

  sql += ` ORDER BY ${sort} ${dir} LIMIT $1 OFFSET $2`;

  const rows = await q(sql, args);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ message: "name is required" }, { status: 400 });
  }

  const row = await one(`INSERT INTO ${TABLE} (name) VALUES ($1) RETURNING *`, [name]);
  return NextResponse.json(row, { status: 201 });
}
