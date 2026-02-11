import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { readAccessToken, readAdminSession } from '@/lib/auth/jwt';
import { TABLE_ADMIN, TABLE_HOSPITAL_PREPARE } from '@/constants/tables';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/admin/api-utils';

/**
 * GET /api/admin/auth - Verify admin authentication and fetch hospital data
 * Query params: id or uid (admin user ID) - optional, will use session if not provided
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let adminId = searchParams.get('id') || searchParams.get('uid');

    // If no ID in query params or invalid, try to get from session
    if (!adminId || adminId === '' || adminId === 'undefined' || adminId === 'null') {
      // 통합 JWT 우선, 기존 Admin JWT 호환
      const accessToken = await readAccessToken();
      const oldAdminSession = await readAdminSession();
      const session = accessToken || oldAdminSession;

      if (!session || !session.sub) {
        return createErrorResponse('Admin ID is required and no valid session found', 401);
      }

      adminId = session.sub.toString();
      console.log('[ADMIN-AUTH] Using ID from session:', adminId);
    }

    // Check admin table (using primary id) - MUST include id_uuid_hospital
    const { rows: adminRows } = await pool.query(
      `SELECT id, email, is_active, id_uuid_hospital FROM ${TABLE_ADMIN} WHERE id = $1`,
      [adminId]
    );

    const admin = adminRows[0] || null;
    console.log('[ADMIN-AUTH] Admin 데이터:', admin);

    // If admin doesn't exist, return appropriate response
    if (!admin) {
      return createSuccessResponse({
        adminExists: false,
        hasClinicInfo: false,
        admin: null,
        hospital: null
      });
    }

    // If admin exists and has hospital UUID, check hospital data
    let hasClinicInfo = false;
    let hospitalData = null;

    const { rows: hospitalRows } = await pool.query(
      `SELECT id_uuid, id_uuid_admin FROM ${TABLE_HOSPITAL_PREPARE} WHERE id_uuid_admin = $1 LIMIT 1`,
      [admin.id]
    );
    hasClinicInfo = hospitalRows.length > 0;
    hospitalData = hospitalRows[0] ?? null;

    return createSuccessResponse({
      adminExists: true,
      hasClinicInfo,
      admin,
      hospital: hospitalData
    });

  } catch (error) {
    console.error('Admin auth verification error:', error);
    return handleApiError(error);
  }
}

/**
 * POST /api/admin/auth - Create new admin entry
 * Body: { uid: string, email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, passwordHash = null } = body;

    if (!email) {
      return createErrorResponse('Email is required', 400);
    }

    const { rows: existingEmailRows } = await pool.query(
      `SELECT id FROM ${TABLE_ADMIN} WHERE email = $1`,
      [email]
    );

    if (existingEmailRows.length > 0) {
      return createErrorResponse('Admin already exists', 409);
    }

    const { rows: newAdminRows } = await pool.query(
      `INSERT INTO ${TABLE_ADMIN} (id_auth_user, email, is_active, password_hash, id_uuid_hospital)
       VALUES (NULL, $1, $2, $3, $4)
       RETURNING *`,
      [email, true, passwordHash, null]
    );
    
    const newAdmin = newAdminRows[0];

    return createSuccessResponse(
      { admin: newAdmin },
      'Admin created successfully'
    );

  } catch (error) {
    console.error('Admin creation error:', error);
    return handleApiError(error);
  }
}
