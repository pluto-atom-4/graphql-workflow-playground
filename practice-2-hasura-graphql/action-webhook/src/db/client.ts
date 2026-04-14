import { Pool, PoolClient, QueryResult } from "pg";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ?? "postgres://boltline:boltline@localhost:5432/boltline_dev",
});

pool.on("error", (err: Error): void => {
  console.error("Unexpected error on idle client", err);
});

export async function query(
  text: string,
  params?: (string | number | null)[]
): Promise<QueryResult> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("Database query error", { text, error });
    throw error;
  }
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

export async function close(): Promise<void> {
  await pool.end();
}
