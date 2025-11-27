const IS_SERVER = typeof window === 'undefined';

const ENABLE_CLIENT_LOG =
  !IS_SERVER && process.env.NEXT_PUBLIC_ENABLE_CLIENT_LOG === 'true';

const ENABLE_SERVER_LOG =
  IS_SERVER && process.env.ENABLE_SERVER_LOG === 'true';

const isLogEnabled = IS_SERVER ? ENABLE_SERVER_LOG : ENABLE_CLIENT_LOG;

export const log = {
  info: (...args: any[]) => {
    if (!isLogEnabled) return;
    log.debug(`[${IS_SERVER ? 'SERVER' : 'CLIENT'}][INFO]`, ...args);
  },
  warn: (...args: any[]) => {
    if (!isLogEnabled) return;
    console.warn(`[${IS_SERVER ? 'SERVER' : 'CLIENT'}][WARN]`, ...args);
  },
  error: (...args: any[]) => {
    if (!isLogEnabled) return;
    console.error(`[${IS_SERVER ? 'SERVER' : 'CLIENT'}][ERROR]`, ...args);
  },
  debug: (...args: any[]) => {
    if (!isLogEnabled) return;
    console.debug(`[${IS_SERVER ? 'SERVER' : 'CLIENT'}][DEBUG]`, ...args);
  }
};

// 타입 내보내기
export type Logger = typeof log;

// 전역 타입 선언
declare global {
  var log: Logger;
}

// 전역 등록 (서버와 클라이언트 공통)
if (typeof globalThis !== 'undefined') {
  (globalThis as any).log = log;
}