import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { TABLE_HOSPITAL_PREPARE } from '@/constants/tables';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/admin/api-utils';

/**
 * GET /api/hospital/name - Fetch hospital name by UUID
 * Query params: id_uuid (required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_uuid = searchParams.get('id_uuid');

    if (!id_uuid) {
      return createErrorResponse('Hospital ID is required', 400);
    }

    const { rows } = await pool.query(
      `SELECT name, name_en FROM ${TABLE_HOSPITAL_PREPARE} WHERE id_uuid = $1`,
      [id_uuid]
    );

    if (rows.length === 0) {
      return createErrorResponse('Hospital not found', 404);
    }
    
    const data = rows[0];

    return createSuccessResponse({
      name: data.name,
      name_en: data.name_en
    });

  } catch (error) {
    console.error('Hospital name API error:', error);
    return handleApiError(error);
  }
}

/**
 * OPTIONS /api/hospital/name - CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
