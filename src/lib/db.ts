import { Pool } from "pg";
import fs from "node:fs";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool__: Pool | undefined;
}

function getSslConfig() {
  // 1) 환경변수 PGSSL_CA가 있으면 그걸 사용 (Vercel 권장)
  if (process.env.PGSSL_CA) {
    return {
      rejectUnauthorized: true,
      ca: process.env.PGSSL_CA.replace(/\\n/g, "\n"),
    };
  }
  // 2) 로컬에서 파일을 두었다면 (선택)
  const pemPath = "./certs/us-west-2-bundle.pem";
  if (fs.existsSync(pemPath)) {
    return {
      rejectUnauthorized: true,
      ca: fs.readFileSync(pemPath, "utf8"),
    };
  }
  // 3) 최후의 보루(비권장): SSL은 강제하지만 CA 미지정
  return { rejectUnauthorized: false };
}

export function getPool() {
  if (!global.__pgPool__) {
    global.__pgPool__ = new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT ?? 5432),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: getSslConfig(),
      max: 5, // Vercel 서버리스에서 과도한 연결 방지
      idleTimeoutMillis: 5_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return global.__pgPool__;
}

export function query<T = any>(text: string, params?: any[]) {
  const pool = getPool();
  return pool.query<T>(text, params);
}
