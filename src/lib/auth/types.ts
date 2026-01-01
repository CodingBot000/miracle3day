/**
 * JWT 인증 시스템 타입 정의
 */

// 사용자 역할
export type UserRole = "user" | "hospital_admin" | "super_admin" | "admin";

// 사용자 상태
export type UserStatus = "pending" | "active";

// 인증 제공자
export type AuthProvider = "google" | "apple" | "facebook" | "email";

// 병원 접근 권한
export interface HospitalAccess {
  hospital_id: string;
  hospital_name?: string;
}

// Access Token Payload
export interface AccessTokenPayload {
  sub: string;              // User ID (id_uuid) 또는 Admin ID
  type: "access";
  email: string | null;
  role: UserRole;
  status: UserStatus;
  provider: AuthProvider;
  providerUserId?: string;  // OAuth provider user ID (pending 상태에서 필요)
  name?: string | null;
  avatar?: string | null;
  hospitalAccess?: HospitalAccess[];
  iat?: number;
  exp?: number;
}

// Refresh Token Payload
export interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
  role: UserRole;
  iat?: number;
  exp?: number;
}

// 세션 사용자 정보 (토큰에서 추출된 정보)
export interface SessionUser {
  id: string;               // sub에서 추출
  email: string | null;
  role: UserRole;
  status: UserStatus;
  provider: AuthProvider;
  providerUserId?: string;
  name?: string | null;
  avatar?: string | null;
  hospitalAccess?: HospitalAccess[];
}

// 토큰 발급 입력
export interface TokenPayloadInput {
  sub: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  provider: AuthProvider;
  providerUserId?: string;
  name?: string | null;
  avatar?: string | null;
  hospitalAccess?: HospitalAccess[];
}
