import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import { Pool } from "pg";

const migrationsDirectory = path.join(process.cwd(), "db", "migrations");

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

async function runMigrations() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const files = fs
      .readdirSync(migrationsDirectory)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const migrationResult = await client.query(
        `SELECT filename FROM schema_migrations WHERE filename = $1`,
        [file]
      );

      if ((migrationResult.rowCount ?? 0) > 0) {
        console.log(`Skipping already executed migration: ${file}`);
        continue;
      }

      console.log(`Running migration: ${file}`);

      const filePath = path.join(migrationsDirectory, file);
      const sql = fs.readFileSync(filePath, "utf8");

      await client.query(sql);

      await client.query(
        `INSERT INTO schema_migrations (filename) VALUES ($1)`,
        [file]
      );

      console.log(`Completed migration: ${file}`);
    }

    await client.query("COMMIT");

    console.log("All migrations completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Migration failed:", error);

    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();