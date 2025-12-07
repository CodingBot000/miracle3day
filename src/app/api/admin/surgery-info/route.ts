import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { TABLE_SURGERY_INFO } from '@/constants/tables';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/admin/api-utils';

/**
 * GET /api/surgery-info - Fetch surgery information
 * Query params: category (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let queryText = `SELECT * FROM ${TABLE_SURGERY_INFO}`;
    const queryParams: any[] = [];
    
    // Apply category filter if provided
    if (category) {
      queryText += ' WHERE category = $1';
      queryParams.push(category);
    }

    const { rows: data } = await pool.query(queryText, queryParams);

    return createSuccessResponse({ surgeryInfo: data || [] });

  } catch (error) {
    console.error('Surgery info API error:', error);
    return handleApiError(error);
  }
}

/**
 * OPTIONS /api/surgery-info - CORS preflight
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
