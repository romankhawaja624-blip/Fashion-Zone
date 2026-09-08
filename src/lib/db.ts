import { Pool } from "pg";

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

export const db =
  globalForDb.pool ??
  new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = db;
}