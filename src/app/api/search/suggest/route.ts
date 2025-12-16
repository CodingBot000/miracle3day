import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import {
  TABLE_TREATMENTS_ROOT,
  TABLE_HOSPITAL,
  TABLE_TREATMENT_PRODUCT,
} from '@/constants/tables'
import type {
  SearchSuggestion,
  SuggestResponse,
  TreatmentGroupSuggestion,
  TreatmentGroupHospital,
  BasicSuggestion
} from '@/models/search'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() || ''

    // Minimum 2 characters required
    if (query.length < 2) {
      return NextResponse.json<SuggestResponse>({
        suggestions: [],
        query,
        total: 0,
      })
    }

    const searchPattern = `%${query}%`

    // Parallel search across all tables
    const [treatmentHospitals, hospitals, products] = await Promise.all([
      // Search treatments (including aliases) → join with hospitals that offer them
      q<{
        treatment_id: string
        treatment_name: string
        treatment_name_ko: string
        hospital_id: string
        hospital_name: string
        hospital_name_ko: string
        thumbnail_url: string | null
        price: number
        product_name: string
        product_name_ko: string
      }>(
        `WITH matched_treatments AS (
          -- treatments_root direct search
          SELECT
            id as root_id,
            en as treatment_name,
            ko as treatment_name_ko
          FROM ${TABLE_TREATMENTS_ROOT}
          WHERE en ILIKE $1 OR ko ILIKE $1

          UNION

          -- treatments_alias indirect search (search by aliases)
          SELECT
            ta.root_id,
            tr.en as treatment_name,
            tr.ko as treatment_name_ko
          FROM treatments_alias ta
          INNER JOIN ${TABLE_TREATMENTS_ROOT} tr ON tr.id = ta.root_id
          WHERE ta.en ILIKE $1 OR ta.ko ILIKE $1
        )

        SELECT
          mt.root_id as treatment_id,
          mt.treatment_name,
          mt.treatment_name_ko,
          h.id_uuid as hospital_id,
          COALESCE(h.name_en, h.name) as hospital_name,
          COALESCE(h.name, h.name_en) as hospital_name_ko,
          h.thumbnail_url,
          tp.price,
          COALESCE(tp.name->>'en', tp.name->>'ko') as product_name,
          COALESCE(tp.name->>'ko', tp.name->>'en') as product_name_ko
        FROM matched_treatments mt
        INNER JOIN ${TABLE_TREATMENT_PRODUCT} tp
          ON mt.root_id = ANY(tp.matched_root_ids)
        INNER JOIN ${TABLE_HOSPITAL} h
          ON h.id_uuid = tp.id_uuid_hospital
        WHERE h.show = true
        ORDER BY h.favorite_count DESC NULLS LAST, tp.price ASC
        LIMIT 8`,
        [searchPattern]
      ),

      // Search hospitals directly
      q<{
        id: string
        label: string
        label_ko: string
        category: string
        thumbnail_url: string | null
      }>(
        `SELECT
          id_uuid as id,
          COALESCE(name_en, name) as label,
          COALESCE(name, name_en) as label_ko,
          COALESCE(address_gu_en, '') as category,
          thumbnail_url
        FROM ${TABLE_HOSPITAL}
        WHERE
          show = true AND
          (name_en ILIKE $1 OR name ILIKE $1)
        ORDER BY
          favorite_count DESC NULLS LAST,
          LENGTH(COALESCE(name_en, name)) ASC
        LIMIT 5`,
        [searchPattern]
      ),

      // Search treatment_product (expose condition removed)
      q<{
        id: string
        label: string
        label_ko: string
        category: string
        id_uuid_hospital: string
      }>(
        `SELECT
          tp.id::text as id,
          COALESCE(tp.name->>'en', tp.name->>'ko') as label,
          COALESCE(tp.name->>'ko', tp.name->>'en') as label_ko,
          COALESCE(tp.level1->>'en', '') as category,
          tp.id_uuid_hospital
        FROM ${TABLE_TREATMENT_PRODUCT} tp
        WHERE
          tp.name->>'en' ILIKE $1 OR
          tp.name->>'ko' ILIKE $1 OR
          tp.group_id ILIKE $1
        ORDER BY
          tp.match_score DESC NULLS LAST,
          LENGTH(COALESCE(tp.name->>'en', '')) ASC
        LIMIT 3`,
        [searchPattern]
      ),
    ])

    // Group treatment results by treatment_id
    const treatmentGroups = new Map<string, TreatmentGroupSuggestion>()

    treatmentHospitals.forEach(row => {
      if (!treatmentGroups.has(row.treatment_id)) {
        treatmentGroups.set(row.treatment_id, {
          type: 'treatment_group',
          treatment_id: row.treatment_id,
          treatment_name: row.treatment_name,
          treatment_name_ko: row.treatment_name_ko,
          hospitals: []
        })
      }

      const group = treatmentGroups.get(row.treatment_id)!
      // Avoid duplicate hospitals in the same group
      if (!group.hospitals.some(h => h.id === row.hospital_id)) {
        group.hospitals.push({
          id: row.hospital_id,
          name: row.hospital_name,
          name_ko: row.hospital_name_ko,
          thumbnail_url: row.thumbnail_url,
          price: row.price,
          product_name: row.product_name,
          product_name_ko: row.product_name_ko
        } as TreatmentGroupHospital)
      }
    })

    // Combine all suggestions
    const suggestions: SearchSuggestion[] = [
      ...hospitals.map((h): BasicSuggestion => ({
        ...h,
        type: 'hospital' as const
      })),
      ...Array.from(treatmentGroups.values()),
      ...products.map((p): BasicSuggestion => ({
        ...p,
        type: 'product' as const
      })),
    ]

    const total = suggestions.length

    // Log search asynchronously (fire and forget)
    logSearchAsync(query, total).catch(() => {})

    return NextResponse.json<SuggestResponse>({
      suggestions,
      query,
      total,
    })
  } catch (error) {
    console.error('[Search Suggest] Error:', error)
    return NextResponse.json<SuggestResponse>(
      { suggestions: [], query: '', total: 0 },
      { status: 500 }
    )
  }
}

async function logSearchAsync(query: string, resultCount: number): Promise<void> {
  try {
    await q(
      `INSERT INTO search_logs (query, result_count, created_at)
       VALUES ($1, $2, NOW())`,
      [query, resultCount]
    )
  } catch {
    // Silently ignore logging errors
  }
}
