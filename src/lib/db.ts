import { Pool } from "pg";
import type { QueryResult, QueryResultRow } from "pg";

const createPool = () => {
  // Remove surrounding quotes from password if present
  const password = process.env.PGPASSWORD?.replace(/^['"]|['"]$/g, '');

  // console.log('[DB] Creating pool with config:');
  // console.log('  Host:', process.env.PGHOST);
  // console.log('  Port:', process.env.PGPORT);
  // console.log('  Database:', process.env.PGDATABASE);
  // console.log('  User:', process.env.PGUSER);
  // console.log('  Password length:', password?.length);
  // console.log('  SSL:', process.env.PGSSL);

  return new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
};

const g = globalThis as unknown as { __pgPool?: Pool };

export const pool = g.__pgPool ?? (g.__pgPool = createPool());

export async function q<T = any>(sql: string, params: any[] = []) {
  const { rows } = await pool.query(sql, params);
  return rows as T[];
}

export async function one<T = any>(sql: string, params: any[] = []) {
  const rows = await q<T>(sql, params);
  return rows[0] ?? null;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  const result = await pool.query(sql, params);
  return result as QueryResult<T>;
}
