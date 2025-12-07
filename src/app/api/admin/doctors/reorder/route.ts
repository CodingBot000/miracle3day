'use server';

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { TABLE_DOCTOR_PREPARE } from '@/constants/tables';
import { createSuccessResponse, createErrorResponse } from '@/lib/admin/api-utils';
import { log } from "@/utils/logger";
/**
 * PUT /api/doctors/reorder
 * 의사 순서를 업데이트합니다
 *
 * Request body:
 * {
 *   id_uuid_hospital: string,
 *   doctors: Array<{ id_uuid: string, display_order: number }>
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_uuid_hospital, doctors } = body;

    if (!id_uuid_hospital || !doctors || !Array.isArray(doctors)) {
      return createErrorResponse('id_uuid_hospital and doctors array are required', 400);
    }

    log.info('의사 순서 업데이트 시작:', {
      id_uuid_hospital,
      doctorCount: doctors.length,
    });

    // 트랜잭션으로 모든 업데이트 처리
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 각 의사의 display_order 업데이트
      for (const doctor of doctors) {
        const { id_uuid, display_order } = doctor;

        if (!id_uuid || display_order === undefined) {
          throw new Error(`Invalid doctor data: ${JSON.stringify(doctor)}`);
        }

        log.info('의사 업데이트:', {
          id_uuid,
          display_order,
        });

        await client.query(
          `UPDATE ${TABLE_DOCTOR_PREPARE}
           SET display_order = $1, updated_at = NOW()
           WHERE id_uuid = $2 AND id_uuid_hospital = $3`,
          [display_order, id_uuid, id_uuid_hospital]
        );
      }

      await client.query('COMMIT');

      log.info('의사 순서 업데이트 완료');

      return createSuccessResponse({
        message: '의사 순서가 업데이트되었습니다',
        updatedCount: doctors.length,
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('의사 순서 업데이트 실패:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : '의사 순서 업데이트에 실패했습니다',
      500
    );
  }
}
