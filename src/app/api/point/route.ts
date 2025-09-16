import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; 
import { TABLE_POINT_TRANSACTIONS } from "@/constants/tables";

/** GET /api/point
 *  반환: { point: number }
 */
export async function GET(req: Request) {
  const supabase = createClient();

  // 로그인 확인
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  

  const { data: pointTransaction, error: pointTransactionError } = await supabase
    .from(TABLE_POINT_TRANSACTIONS)
    .select("point_balance")
    .eq("user_id", user.id)
    .single();


  if (pointTransactionError && pointTransactionError.code !== 'PGRST116') { // PGRST116 is "not found"
    return NextResponse.json({ error: pointTransactionError.message }, { status: 500 });
  }
  return NextResponse.json({
    point_balance: pointTransaction?.point_balance,
  });
}
