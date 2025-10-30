import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { TABLE_TREATMENT_INFO, TABLE_HOSPITAL_TREATMENT } from '@/constants/tables';
import { TreatmentProductData } from '@/app/models/treatmentProduct.dto';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Hospital ID is required' },
        { status: 400 }
      );
    }

    // JOIN hospital_treatment with treatment_info
    // hospital_treatment.id_uuid_hospital = hospital.id_uuid (passed as $1)
    // hospital_treatment.id_uuid = treatment_info.id_uuid
    const sql = `
      SELECT
        ht.id_uuid_hospital,
        ht.option_value,
        ht.price as ht_price,
        ti.department,
        ti.level1,
        ti.name,
        ti.unit,
        ti.price as ti_price,
        ti.group_id
      FROM ${TABLE_HOSPITAL_TREATMENT} ht
      INNER JOIN ${TABLE_TREATMENT_INFO} ti ON ht.id_uuid_treatment = ti.id_uuid
      WHERE ht.id_uuid_hospital = $1
      ORDER BY ti.department ASC, ti.group_id ASC
    `;

    const result = await query(sql, [id]);

    // Convert text fields to JSONB format (set both ko and en to the same value)
    const products: TreatmentProductData[] = result.rows.map((row, index) => ({
      id: index + 1, // Generate sequential id
      id_uuid_hospital: row.id_uuid_hospital ?? id,
      department: row.department ?? '',
      level1: { ko: row.level1 ?? '', en: row.level1 ?? '' },
      name: { ko: row.name ?? '', en: row.name ?? '' },
      option_value: row.option_value ?? '',
      unit: { ko: row.unit ?? '', en: row.unit ?? '' },
      price: Number(row.ti_price ?? 0), // Use treatment_info price
      group_id: row.group_id ?? '',
      expose: false, // Set to false as specified
    }));

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/hospital/[id]/treatment-products-other error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message },
      { status: 500 }
    );
  }
}
