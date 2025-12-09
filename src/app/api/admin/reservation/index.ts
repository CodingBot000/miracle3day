import { pool } from "@/lib/db";
import { ReservationOutputDto } from "@/models/admin/reservation.dto";
import { TABLE_RESERVATIONS } from "@/constants/tables";

export const getReservationDatas = async (
    id_uuid_hospital: string
): Promise<ReservationOutputDto | null> => {
  try {
    // status_code	의미	프론트 표현 (UI)
    // 0	pending	대기 중
    // 1	approved	승인됨
    // 2	denied	거절됨
    // 3	completed	시술 완료
    const { rows: data } = await pool.query(
      `SELECT * FROM ${TABLE_RESERVATIONS} WHERE id_uuid_hospital = $1 ORDER BY status_code ASC, created_at DESC`,
      [id_uuid_hospital]
    );

    console.log("getReservationDatas data:", JSON.stringify(data, null, 2));

    return {
      data: data || [],
    };
  } catch (error) {
    console.error("getReservationDatas error:", error);
    return null;
  }
};
