import { Pool } from 'pg';

let pool: Pool | undefined;

export function getPool(): Pool {
  if (process.env.NEXT_PUBLIC_LOCAL_PREVIEW === '1') {
    throw new Error('Database access is disabled in local preview');
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });
  return pool;
}
