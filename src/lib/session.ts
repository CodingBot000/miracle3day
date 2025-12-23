import { SessionOptions } from "iron-session";
import { AuthOnlyDto } from "@/models/auth-only.dto";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "app_session",
  cookieOptions: {
    // secure flag는 요청 프로토콜에 따라 결정됨 (middleware에서 동적 설정)
    // 기본값: production이면 true, 개발 환경이면 false
    secure: process.env.NODE_ENV === "production",
    httpOnly: true, // XSS 방지
    sameSite: "lax",
    path: "/", // 모든 경로에서 접근 가능
    maxAge: 60 * 60 * 24 * 365, // 1년 (초 단위)
  },
};

// 요청별로 dynamic secure flag 설정 헬퍼
export const getSessionOptions = (isSecure: boolean): SessionOptions => ({
  ...sessionOptions,
  cookieOptions: {
    ...sessionOptions.cookieOptions,
    secure: isSecure || process.env.NODE_ENV === "production",
    httpOnly: true,
    path: "/",
  },
});

// Export SessionData type for explicit use
export interface SessionData {
  auth?: AuthOnlyDto;
}

declare module "iron-session" {
  interface IronSessionData extends SessionData {}
}