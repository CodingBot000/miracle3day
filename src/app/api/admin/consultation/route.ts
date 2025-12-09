import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { TABLE_CONSULTATION_SUBMISSIONS } from '@/constants/tables';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/admin/api-utils';

/**
 * GET /api/consultation - Fetch all consultation submissions
 * Query params: status (optional), limit (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    let queryText = `SELECT * FROM ${TABLE_CONSULTATION_SUBMISSIONS}`;
    const queryParams: any[] = [];
    
    // Apply filters
    if (status) {
      queryText += ' WHERE status = $1';
      queryParams.push(status);
    }
    
    queryText += ' ORDER BY created_at DESC';
    
    if (limit) {
      queryText += ` LIMIT $${queryParams.length + 1}`;
      queryParams.push(parseInt(limit, 10));
    }

    const { rows: data } = await pool.query(queryText, queryParams);

    // Sort data by status priority (New > Retry > Done) and then by date
    const sortedData = (data || []).sort((a, b) => {
      const statusOrder = { 'New': 0, 'Retry': 1, 'Done': 2 };
      const statusA = a.status || 'New';
      const statusB = b.status || 'New';

      const orderA = statusOrder[statusA as keyof typeof statusOrder] ?? 0;
      const orderB = statusOrder[statusB as keyof typeof statusOrder] ?? 0;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return createSuccessResponse({ submissions: sortedData });

  } catch (error) {
    console.error('Consultation API error:', error);
    return handleApiError(error);
  }
}

/**
 * PATCH /api/consultation - Update consultation submission
 * Body: { id_uuid: string, doctor_notes?: string, status?: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_uuid, doctor_notes, status } = body;

    if (!id_uuid) {
      return createErrorResponse('Consultation ID is required', 400);
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (doctor_notes !== undefined) {
      updateData.doctor_notes = doctor_notes;
    }

    if (status !== undefined) {
      // Validate status
      const validStatuses = ['New', 'Done', 'Retry'];
      if (!validStatuses.includes(status)) {
        return createErrorResponse('Invalid status value', 400);
      }
      updateData.status = status;
    }

    const entries = Object.entries(updateData);
    const sets = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const params = entries.map(([, v]) => v);
    
    const { rows } = await pool.query(
      `UPDATE ${TABLE_CONSULTATION_SUBMISSIONS} SET ${sets} WHERE id_uuid = $${params.length + 1} RETURNING *`,
      [...params, id_uuid]
    );
    
    if (rows.length === 0) {
      return createErrorResponse('Consultation not found', 404);
    }
    
    const data = rows[0];

    return createSuccessResponse(
      { consultation: data },
      'Consultation updated successfully'
    );

  } catch (error) {
    console.error('Consultation update error:', error);
    return handleApiError(error);
  }
}

/**
 * OPTIONS /api/consultation - CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
