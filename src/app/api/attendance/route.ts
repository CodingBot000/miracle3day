// app/api/attendance/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/session/server"; 
import { TABLE_ATTENDANCE_MONTHLY, TABLE_MEMBERS, TABLE_POINT_TRANSACTIONS } from "@/constants/tables";

/** GET /api/attendance?ym=2025-09 또는 ym=2025-09-01
 *  반환: { ym: 'YYYY-MM-01', attendedDays: number[] }
 */
export async function GET(req: Request) {
  const backendClient = createClient();

  // 로그인 확인
  const {
    data: { user },
    error: userErr,
  } = await backendClient.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const ymRaw = searchParams.get("ym");
  if (!ymRaw) {
    return NextResponse.json({ error: "Missing ym" }, { status: 400 });
  }

  const ymDate = new Date(ymRaw.length === 7 ? `${ymRaw}-01` : ymRaw);
  if (Number.isNaN(ymDate.getTime())) {
    return NextResponse.json({ error: "Invalid ym" }, { status: 400 });
  }

  const ym = ymDate.toISOString().slice(0, 10); // YYYY-MM-DD 형태
  
  // 해당 월의 출석 데이터 조회
  const { data, error } = await backendClient
    .from(TABLE_ATTENDANCE_MONTHLY)
    .select("days")
    .eq("user_id", user.id)
    .eq("ym", ym)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const year = ymDate.getFullYear();
  const month = ymDate.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();

  const attendedDays: number[] = [];
  const days: boolean[] = data?.days || new Array(31).fill(false);
  
  for (let i = 0; i < Math.min(days.length, lastDay); i++) {
    if (days[i]) attendedDays.push(i + 1);
  }

  return NextResponse.json({
    ym: `${year}-${String(month).padStart(2, "0")}-01`,
    attendedDays,
  });
}

/** POST /api/attendance/check_in
 *  body: { tz?: "Asia/Seoul" }
 *  반환: { ym, day, was_already, points_awarded, attended_today }
 */
export async function POST(req: Request) {
  const backendClient = createClient();

  const {
    data: { user },
    error: userErr,
  } = await backendClient.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let tz: string | null = null;
  try {
    const body = (await req.json()) as { tz?: string | null };
    tz = body?.tz ?? null;
  } catch {
    // body 없이 호출 가능
  }

  // 현재 날짜 계산 (사용자 타임존 고려)
  const now = new Date();
  const userTz = tz || 'UTC';
  
  // 사용자 시간대로 현재 날짜 구하기
  const todayInUserTz = new Date(now.toLocaleString("en-US", { timeZone: userTz }));
  const year = todayInUserTz.getFullYear();
  const month = todayInUserTz.getMonth() + 1;
  const day = todayInUserTz.getDate();
  
  const ym = `${year}-${String(month).padStart(2, "0")}-01`;
  
  // 기존 출석 데이터 조회
  const { data: existing, error: selectError } = await backendClient
    .from(TABLE_ATTENDANCE_MONTHLY)
    .select("days")
    .eq("user_id", user.id)
    .eq("ym", ym)
    .single();

  let days: boolean[] = new Array(31).fill(false);
  let wasAlready = false;
  
  if (existing?.days) {
    days = existing.days;
    wasAlready = days[day - 1]; // 0-based index
  }
  
  // 이미 출석했다면 반환
  if (wasAlready) {
    return NextResponse.json({
      ym,
      day,
      was_already: true,
      points_awarded: 0,
      attended_today: true
    });
  }
  
  // 출석 처리
  days[day - 1] = true;
  
  const { error: upsertError } = await backendClient
    .from(TABLE_ATTENDANCE_MONTHLY)
    .upsert({
      user_id: user.id,
      ym,
      days,
      user_tz: userTz,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,ym'
    });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  // 포인트 적립 (idempotency_key로 중복 방지)
  const idempotencyKey = `attendance:${user.id}:${ym}:${day}`;
  const pointsAwarded = 10;
  
  const { error: pointError } = await backendClient
    .from(TABLE_POINT_TRANSACTIONS)
    .insert({
      user_id: user.id,
      amount: pointsAwarded,
      type: 'attendance',
      idempotency_key: idempotencyKey,
      meta: { ym, day }
    });

  // 포인트 삽입 에러는 무시 (이미 존재하는 경우)
  if (!pointError) {
    // TABLE_MEMBERS.point_balance 누적 업데이트
    const { data: memberRow, error: memberSelectError } = await backendClient
      .from(TABLE_MEMBERS)
      .select("point_balance")
      .eq("user_id", user.id)
      .single();

    if (!memberSelectError) {
      const currentBalance = (memberRow?.point_balance as number | null) ?? 0;
      const { error: memberUpdateError } = await backendClient
        .from(TABLE_MEMBERS)
        .update({ point_balance: currentBalance + pointsAwarded })
        .eq("user_id", user.id);
      // 업데이트 실패시에도 흐름은 계속 진행
    }
  }

  return NextResponse.json({
    ym,
    day,
    was_already: false,
    points_awarded: pointsAwarded,
    attended_today: true
  });
}
