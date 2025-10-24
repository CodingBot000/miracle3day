import { TABLE_DOCTOR, TABLE_HOSPITAL, TABLE_HOSPITAL_BUSINESS_HOUR, TABLE_HOSPITAL_DETAIL, TABLE_HOSPITAL_TREATMENT } from "@/constants/tables";
import { query } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id_uuid = params.id;

  try {
    const hospitalSql = `
      SELECT

        id,
        id_uuid,
        name,
        name_en,
        address_full_road,
        address_full_road_en,
        address_full_jibun,
        address_full_jibun_en,
        address_si,
        address_si_en,
        address_gu,
        address_gu_en,
        address_dong,
        address_dong_en,
        zipcode,
        latitude,
        longitude,
        address_detail,
        address_detail_en,
        directions_to_clinic,
        directions_to_clinic_en,
        location,
        imageurls,
        thumbnail_url,
        created_at,
        searchkey,
        id_unique,
        id_surgeries,
        show,
        favorite_count
      FROM ${TABLE_HOSPITAL}
      WHERE id_uuid = $1
      LIMIT 1
    `;
    const hospitalResult = await query(hospitalSql, [id_uuid]);
    const hospital = hospitalResult.rows[0];
    if (!hospital) {
      return Response.json({ data: null }, { status: 404, statusText: "Not Found" });
    }

    const detailSql = `SELECT * FROM ${TABLE_HOSPITAL_DETAIL} WHERE id_uuid_hospital = $1 LIMIT 1`;
    const businessSql = `SELECT * FROM ${TABLE_HOSPITAL_BUSINESS_HOUR} WHERE id_uuid_hospital = $1 ORDER BY day_of_week`;
    const treatmentSql = `SELECT * FROM ${TABLE_HOSPITAL_TREATMENT} WHERE id_uuid_hospital = $1`;
    const doctorSql = `SELECT * FROM ${TABLE_DOCTOR} WHERE id_uuid_hospital = $1`;

    const [detailRes, businessRes, treatmentRes, doctorRes] = await Promise.all([
      query(detailSql, [id_uuid]),
      query(businessSql, [id_uuid]),
      query(treatmentSql, [id_uuid]),
      query(doctorSql, [id_uuid]),
    ]);

    const data = {
      hospital_info: hospital,
      hospital_details: detailRes.rows[0] ?? null,
      business_hours: businessRes.rows,
      treatments: treatmentRes.rows,
      doctors: doctorRes.rows,
      favorite: [],
      favorite_count: hospital.favorite_count ?? 0,
    };

    return Response.json(data, { status: 200, statusText: "success", headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/hospital/[id]/main error:", error);
    return Response.json(
      { data: null, error: message },
      { status: 500, statusText: message, headers: { "Cache-Control": "no-store" } }
    );
  }
}
