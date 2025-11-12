// app/api/attendance/route.ts
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-helper";
import { q, query } from "@/lib/db";
import {
  TABLE_ATTENDANCE_MONTHLY,
  TABLE_MEMBERS,
  TABLE_POINT_TRANSACTIONS,
} from "@/constants/tables";
import { processActivity, ACTIVITY_TYPES } from '@/services/badges';

const POINTS_PER_CHECK_IN = 10;
const DAYS_IN_MONTH = 31;

function normalizeDays(source?: boolean[] | null) {
  return Array.from({ length: DAYS_IN_MONTH }, (_, idx) => source?.[idx] ?? false);
}



/** GET /api/attendance?ym=2025-09 또는 ym=2025-09-01
 *  반환: { ym: 'YYYY-MM-01', attendedDays: number[] }
 */
export async function GET(req: Request) {
  const authSession = await getAuthSession(req);
  if (!authSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId } = authSession;
  const memberUuid = userId;

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
  
  try {
    const rows = await q<{ days: boolean[] | null }>(
      `
        SELECT days
        FROM ${TABLE_ATTENDANCE_MONTHLY}
        WHERE user_id = $1 AND ym = $2
        LIMIT 1
      `,
      [memberUuid, ym]
    );

    const year = ymDate.getFullYear();
    const month = ymDate.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();

    const recordDays = normalizeDays(rows[0]?.days);
    const attendedDays: number[] = [];
    for (let i = 0; i < Math.min(recordDays.length, lastDay); i += 1) {
      if (recordDays[i]) attendedDays.push(i + 1);
    }

    return NextResponse.json({
      ym: `${year}-${String(month).padStart(2, "0")}-01`,
      attendedDays,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch attendance";
    console.error("GET /api/attendance error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
  
}

/** POST /api/attendance/check_in
 *  body: { tz?: "Asia/Seoul" }
 *  반환: { ym, day, was_already, points_awarded, attended_today }
 */
export async function POST(req: Request) {
  const authSession = await getAuthSession(req);
  if (!authSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId } = authSession;
  const memberUuid = userId;

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
  try {
    const existingRows = await q<{ days: boolean[] | null }>(
      `
        SELECT days
        FROM ${TABLE_ATTENDANCE_MONTHLY}
        WHERE user_id = $1 AND ym = $2
        LIMIT 1
      `,
      [memberUuid, ym]
    );

    const currentDays = normalizeDays(existingRows[0]?.days);
    const wasAlready = currentDays[day - 1] === true;
  
    // 이미 출석했다면 반환
    if (wasAlready) {
      return NextResponse.json({
        ym,
        day,
        was_already: true,
        points_awarded: 0,
        attended_today: true,
      });
    }
  
    // 출석 처리
    const updatedDays = [...currentDays];
    updatedDays[day - 1] = true;

    await q(
      `
        INSERT INTO ${TABLE_ATTENDANCE_MONTHLY} (user_id, ym, days, user_tz, created_at, updated_at)
        VALUES ($1, $2, $3::boolean[], $4, now(), now())
        ON CONFLICT (user_id, ym)
        DO UPDATE
          SET days = EXCLUDED.days,
              user_tz = EXCLUDED.user_tz,
              updated_at = now()
      `,
      [memberUuid, ym, updatedDays, userTz]
    );

    const idempotencyKey = `attendance:${memberUuid}:${ym}:${day}`;

    let awardedPoints = false;
    try {
      await q(
        `
          INSERT INTO ${TABLE_POINT_TRANSACTIONS} (
            user_id,
            amount,
            type,
            idempotency_key,
            meta
          ) VALUES ($1, $2, $3, $4, $5::jsonb)
        `,
        [memberUuid, POINTS_PER_CHECK_IN, "attendance", idempotencyKey, JSON.stringify({ ym, day })]
      );
      awardedPoints = true;
    } catch (error) {
      const isDuplicate =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "23505";
      if (!isDuplicate) {
        console.error("Failed to insert point transaction:", error);
      }
    }

    if (awardedPoints) {
      const updateAttempts: Array<{ sql: string; value: string }> = [
        {
          sql: `UPDATE ${TABLE_MEMBERS}
                SET point_balance = COALESCE(point_balance, 0) + $1
                WHERE id_uuid = $2`,
          value: memberUuid,
        },
        {
          sql: `UPDATE ${TABLE_MEMBERS}
                SET point_balance = COALESCE(point_balance, 0) + $1
                WHERE uuid = $2`,
          value: memberUuid,
        },
      ];

      for (const attempt of updateAttempts) {
        if (!attempt.value) continue;
        try {
          const result = await query(attempt.sql, [POINTS_PER_CHECK_IN, attempt.value]);
          if (result.rowCount && result.rowCount > 0) {
            break;
          }
        } catch (error) {
          // Ignore column mismatch; try next variant
        }
      }
    }

    // Process badge activity for daily check-in
    const notifications = await processActivity({
      userId: memberUuid,
      activityType: ACTIVITY_TYPES.DAILY_CHECKIN,
      metadata: { ym, day },
      referenceId: `${ym}:${day}`,
    }).catch(err => {
      console.error('Badge error:', err);
      return [];
    });

    return NextResponse.json({
      success: true,
      ym,
      day,
      was_already: false,
      points_awarded: awardedPoints ? POINTS_PER_CHECK_IN : 0,
      attended_today: true,
      notifications,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check in";
    console.error("POST /api/attendance error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
