import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { upsertUser, createDistinct1to1Channel } from "@/lib/sendbird";
import { TABLE_MEMBERS } from "@/constants/tables";
import { q } from "@/lib/db";

const Body = z.object({
  member_uuid: z.string().uuid(),   // 로그인한 사용자 UUID (members.uuid)
  hospital_id_uuid: z.string().uuid(), // 병원 UUID (hospital.id_uuid)
  payload: z
    .object({
      // 상담폼 요약 (선택: 병원에 첫메시지 힌트로 보관)
      name: z.string().optional(),
      country: z.string().optional(),
      contact: z.string().optional(), // 사용자가 선호하는 연락수단(이메일/WeChat/…)
      message: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { member_uuid, hospital_id_uuid, payload } = Body.parse(body);

    console.log('[create-channel] Request:', { member_uuid, hospital_id_uuid });

    // DB에서 member 정보 조회
    const memberRows = await q<{ nickname: string | null }>(
      `SELECT nickname FROM ${TABLE_MEMBERS} WHERE uuid = $1 LIMIT 1`,
      [member_uuid]
    );

    if (!memberRows.length) {
      throw new Error('Failed to fetch member information');
    }

    const memberNickname = memberRows[0]?.nickname || 'Guest';
    console.log('[create-channel] Member nickname:', memberNickname);

    // 1) Sendbird에 유저 등록(없으면 생성) - 순차적으로 처리
    console.log('[create-channel] Upserting member user...');
    await upsertUser(member_uuid, memberNickname);

    console.log('[create-channel] Upserting hospital user...');
    await upsertUser(hospital_id_uuid);

    console.log('[create-channel] Both users ready, creating channel...');
    // 2) 1:1 채널 생성 (is_distinct=true → 중복 생성 방지)
    const meta = {
      member_uuid,
      hospital_id_uuid,
      member_nickname: memberNickname,
      payload
    };
    const { channel_url } = await createDistinct1to1Channel(member_uuid, hospital_id_uuid, meta);

    console.log('[create-channel] Success! Channel URL:', channel_url);
    return NextResponse.json({ ok: true, channel_url });
  } catch (e: any) {
    console.error('[create-channel] Error:', e.response?.data || e.message);
    return NextResponse.json({
      ok: false,
      error: e.response?.data?.message || e.message
    }, { status: 400 });
  }
}
