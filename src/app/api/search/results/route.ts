import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import {
  TABLE_TREATMENTS_ROOT,
  TABLE_HOSPITAL,
  TABLE_TREATMENT_PRODUCT,
} from '@/constants/tables'
import type {
  SearchResults,
  TreatmentResult,
  HospitalResult,
  ProductResult,
} from '@/models/search'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() || ''

    if (!query) {
      return NextResponse.json<SearchResults>({
        treatments: [],
        hospitals: [],
        treatment_products: [],
        total: 0,
      })
    }

    const searchPattern = `%${query}%`
    const startsWithPattern = `${query.toLowerCase()}%`

    // Parallel search across all tables with more results
    const [treatments, hospitals, products] = await Promise.all([
      // Search treatments_root
      q<TreatmentResult>(
        `SELECT
          id,
          ko,
          en,
          COALESCE(group_id, '') as group_id,
          COALESCE(group_id, '') as category,
          summary,
          tags
        FROM ${TABLE_TREATMENTS_ROOT}
        WHERE
          en ILIKE $1 OR
          ko ILIKE $1 OR
          id ILIKE $1
        ORDER BY
          CASE WHEN LOWER(en) LIKE $2 THEN 1 ELSE 2 END,
          LENGTH(en) ASC
        LIMIT 20`,
        [searchPattern, startsWithPattern]
      ),

      // Search hospitals
      q<HospitalResult>(
        `SELECT
          id_uuid,
          name,
          COALESCE(name_en, name) as name_en,
          COALESCE(address_gu_en, '') as address_gu_en,
          thumbnail_url,
          COALESCE(favorite_count, 0) as favorite_count
        FROM ${TABLE_HOSPITAL}
        WHERE
          show = true AND
          (name_en ILIKE $1 OR name ILIKE $1)
        ORDER BY
          favorite_count DESC NULLS LAST,
          LENGTH(COALESCE(name_en, name)) ASC
        LIMIT 20`,
        [searchPattern]
      ),

      // Search treatment_product with hospital info
      q<ProductResult>(
        `SELECT
          tp.id,
          tp.id_uuid_hospital,
          tp.name,
          tp.level1,
          tp.department,
          COALESCE(tp.price, 0) as price,
          COALESCE(tp.group_id, '') as group_id,
          COALESCE(tp.matched_root_ids, ARRAY[]::text[]) as matched_root_ids,
          COALESCE(tp.match_score, 0) as match_score,
          COALESCE(h.name_en, h.name, '') as hospital_name,
          COALESCE(h.address_gu_en, '') as hospital_location
        FROM ${TABLE_TREATMENT_PRODUCT} tp
        LEFT JOIN ${TABLE_HOSPITAL} h ON h.id_uuid = tp.id_uuid_hospital
        WHERE
          tp.expose = true AND
          (
            tp.name->>'en' ILIKE $1 OR
            tp.name->>'ko' ILIKE $1 OR
            tp.group_id ILIKE $1
          )
        ORDER BY
          tp.match_score DESC NULLS LAST,
          LENGTH(COALESCE(tp.name->>'en', '')) ASC
        LIMIT 20`,
        [searchPattern]
      ),
    ])

    const total = treatments.length + hospitals.length + products.length

    // Log search asynchronously
    logSearchAsync(query, total).catch(() => {})

    return NextResponse.json<SearchResults>({
      treatments,
      hospitals,
      treatment_products: products,
      total,
    })
  } catch (error) {
    console.error('[Search Results] Error:', error)
    return NextResponse.json<SearchResults>(
      {
        treatments: [],
        hospitals: [],
        treatment_products: [],
        total: 0,
      },
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
