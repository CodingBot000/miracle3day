import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { TABLE_HOSPITAL as TABLE } from "@/constants/tables";
import { deriveAllowedColumns } from "@/security/derive-allowed";

type RouteContext = {
  params: { id: string };
};

export async function GET(_req: Request, { params }: RouteContext) {
  const row = await one(`SELECT * FROM ${TABLE} WHERE id = $1`, [params.id]);
  if (!row) {
    return NextResponse.json({}, { status: 404 });
  }
  return NextResponse.json(row);
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const body = await req.json();
  const entries = Object.entries(body ?? {});

  if (!entries.length) {
    return NextResponse.json({ message: "empty body" }, { status: 400 });
  }

  const allowedKeys = await deriveAllowedColumns(TABLE, entries.map(([key]) => key));

  if (!allowedKeys.length) {
    return NextResponse.json({ message: "no updatable fields" }, { status: 400 });
  }

  let index = 1;
  const fields: string[] = [];
  const values: any[] = [];

  for (const key of allowedKeys) {
    fields.push(`${key} = $${index++}`);
    values.push(body[key]);
  }

  values.push(params.id);

  const row = await one(
    `UPDATE ${TABLE} SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${index} RETURNING *`,
    values
  );

  if (!row) {
    return NextResponse.json({}, { status: 404 });
  }

  console.info({ table: TABLE, id: params.id, keys: allowedKeys, action: "PATCH" });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const row = await one(`DELETE FROM ${TABLE} WHERE id = $1 RETURNING 1`, [params.id]);

  if (!row) {
    return NextResponse.json({}, { status: 404 });
  }

  console.info({ table: TABLE, id: params.id, action: "DELETE" });
  return NextResponse.json({ ok: true });
}
