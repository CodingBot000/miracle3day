import { Pool, PoolConfig } from "pg";

const sanitizePassword = (password?: string) => {
  if (!password) return password;
  if (password.startsWith("'") && password.endsWith("'")) {
    return password.slice(1, -1);
  }
  return password;
};

const getSslConfig = () => {
  const disable = process.env.PGSSLMODE?.toLowerCase() === "disable" || process.env.PGSSL === "false";
  if (disable) return false;

  if (process.env.PGSSL_CA) {
    const ca = process.env.PGSSL_CA.replace(/\\n/g, "\n");
    return { rejectUnauthorized: true, ca };
  }

  return { rejectUnauthorized: false };
};

const config: PoolConfig = {
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: sanitizePassword(process.env.PGPASSWORD),
  ssl: getSslConfig(),
};

if (!config.host && process.env.POSTGRES_URL) {
  config.connectionString = process.env.POSTGRES_URL;
}

export const pool = new Pool(config);
