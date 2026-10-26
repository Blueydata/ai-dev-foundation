import { Pool } from "pg";
import { getServerEnv } from "@/shared/config/env";

let pool: Pool | undefined;

export function getPool(): Pool {
  pool ??= new Pool({ connectionString: getServerEnv().DATABASE_URL });
  return pool;
}
