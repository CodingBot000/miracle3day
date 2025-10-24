import { NextResponse } from "next/server";
import { LIMIT } from "./constant";
import { TABLE_HOSPITAL, TABLE_REVIEW, TABLE_MEMBERS } from "@/constants/tables";
import { q } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id_uuid_hospital = params.id;

  const { searchParams } = new URL(req.url);
  // const pageParam = parseInt(searchParams.get("pageParam") as string);
  const pageParam = parseInt(searchParams.get("pageParam") || "0");
  const offset = pageParam * LIMIT;
  const limit = offset + LIMIT - 1;

  try {
    const hospitalRows = await q(
      `SELECT * FROM ${TABLE_HOSPITAL}
       WHERE show = true AND id_uuid = $1
       LIMIT 1`,
      [id_uuid_hospital]
    );

    const hospitalData = hospitalRows[0];

    if (!hospitalData) {
      return NextResponse.json(
        { data: { hospitalData: null, reviewsWithMember: [] }, nextCursor: false },
        { status: 404, statusText: "Not Found" }
      );
    }

    const reviewRows = await q(
      `SELECT * FROM ${TABLE_REVIEW}
       WHERE id_uuid_hospital = $1
       ORDER BY created_at ASC
       LIMIT $2 OFFSET $3`,
      [id_uuid_hospital, LIMIT, offset]
    );

    const countRows = await q<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM ${TABLE_REVIEW}
       WHERE id_uuid_hospital = $1`,
      [id_uuid_hospital]
    );

    if (!reviewRows.length) {
      return NextResponse.json(
        {
          data: {
            hospitalData,
            reviewsWithMember: [],
          },
          nextCursor: false,
        },
        { status: 200 }
      );
    }

    const userNos = Array.from(new Set(reviewRows.map((r: any) => r.user_no)));
    let memberDatas: any[] = [];

    if (userNos.length > 0) {
      const members = await q(
        `SELECT * FROM ${TABLE_MEMBERS}
         WHERE user_no = ANY($1::int[])`,
        [userNos]
      );
      memberDatas = members;
    }

    const memberMap = new Map(
      memberDatas.map((m) => [m.user_no, m])
    );

    const reviewsWithMember = reviewRows.map((r: any) => ({
      review: r,
      member: memberMap.get(r.user_no) ?? null,
    }));

    const total = countRows[0]?.count ?? 0;
    const nextCursor = limit < total;

    return NextResponse.json(
      {
        data: {
          hospitalData,
          reviewsWithMember,
        },
        nextCursor,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { status: 500, message: error.message },
        { status: 500 }
      );
    }
  }
}
