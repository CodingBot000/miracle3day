import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { TABLE_TREATMENT_PRODUCT } from '@/constants/tables';
import { TreatmentProductData } from '@/models/treatmentProduct.dto';

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

    // Fetch treatment products for this hospital
    // Filter by expose = true and order by department, group_id
    const sql = `
      SELECT
        id,
        id_uuid_hospital,
        department,
        level1,
        name,
        option_value,
        unit,
        price,
        group_id,
        expose,
        meta
      FROM ${TABLE_TREATMENT_PRODUCT}
      WHERE id_uuid_hospital = $1
      ORDER BY department ASC, group_id ASC
    `;

    const result = await query(sql, [id]);

    const products: TreatmentProductData[] = result.rows.map((row) => ({
      id: row.id,
      id_uuid_hospital: row.id_uuid_hospital,
      department: row.department ?? '',
      level1: row.level1 ?? { ko: '', en: '' },
      name: row.name ?? { ko: '', en: '' },
      option_value: row.option_value ?? '',
      unit: row.unit ?? { ko: '', en: '' },
      price: Number(row.price ?? 0),
      group_id: row.group_id ?? '',
      expose: Boolean(row.expose ?? false),
      meta: row.meta ?? undefined,
    }));

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/hospital/[id]/treatment-products error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message },
      { status: 500 }
    );
  }
}
