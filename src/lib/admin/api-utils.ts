import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/admin/db';
import { TABLE_ADMIN } from '@/constants/tables';
import { ApiResponse } from '@/models/admin/api';
import { readSession } from '@/lib/admin/auth';
import { log } from "@/utils/logger";

export type { ApiResponse };

// 성공 응답 생성
export function createSuccessResponse<T>(data?: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message: message || '성공적으로 처리되었습니다.',
    status: 'success'
  } as ApiResponse<T>);
}

// 에러 응답 생성
export function createErrorResponse(
  error: string, 
  statusCode: number = 400,
  details?: any
): NextResponse {
  return NextResponse.json({
    success: false,
    error,
    status: 'error',
    ...(details && { details })
  } as ApiResponse, { status: statusCode });
}

// 사용자 인증 검사
export async function authenticateUser(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  user?: any;
  error?: string;
}> {
  try {
    const session = await readSession();
    
    if (!session) {
      return { isAuthenticated: false, error: 'No session found' };
    }

    return { isAuthenticated: true, user: session };
  } catch (error) {
    return { isAuthenticated: false, error: 'Authentication failed' };
  }
}

// FormData에서 사용자 UID 추출 및 검증
export async function extractAndValidateUser(formData: FormData): Promise<{
  isValid: boolean;
  userId?: string;
  adminData?: any;
  error?: string;
}> {
  try {
    const adminId = (formData.get("current_user_id") || formData.get("current_user_uid")) as string;

    if (!adminId) {
      return { isValid: false, error: 'Admin ID not provided' };
    }

    // admin 테이블에서 사용자 확인 (id 기준)
    const { rows } = await pool.query(
      `SELECT id FROM ${TABLE_ADMIN} WHERE id = $1`,
      [adminId]
    );

    if (rows.length === 0) {
      return { isValid: false, error: 'Admin user not found' };
    }

    return {
      isValid: true,
      userId: adminId,
      adminData: rows[0],
    };
  } catch (error) {
    return { isValid: false, error: 'User validation failed' };
  }
}

// 공통 에러 핸들러
export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error);
  
  // Supabase 에러 처리
  if (error?.code) {
    switch (error.code) {
      case '23505':
        return createErrorResponse('이미 등록된 병원 정보입니다.', 409);
      case '22P02':
        return createErrorResponse('잘못된 데이터 형식입니다.', 400);
      default:
        return createErrorResponse(error.message || '데이터베이스 오류가 발생했습니다.', 500);
    }
  }
  
  // 일반 에러 처리
  if (error instanceof Error) {
    return createErrorResponse(error.message, 500);
  }
  
  return createErrorResponse('알 수 없는 오류가 발생했습니다. api-utils', 500);
}

// Rate limiting (간단한 구현)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);
  
  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userRequests.count >= maxRequests) {
    return false;
  }
  
  userRequests.count++;
  return true;
}

// CORS 헤더 설정
export function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// 요청 로깅
export function logRequest(request: NextRequest, additionalInfo?: any) {
  log.info(`[API] ${request.method} ${request.url}`, {
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
    ...additionalInfo
  });
} 
