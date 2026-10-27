import { getPool } from "@/shared/database/client";

export async function countQueries<T>(run: () => Promise<T>): Promise<{ result: T; queries: number }> {
  const pool = getPool();
  const originalQuery = pool.query;
  let queries = 0;
  pool.query = ((...args: unknown[]) => {
    queries += 1;
    return Reflect.apply(originalQuery, pool, args);
  }) as typeof originalQuery;
  try {
    const result = await run();
    return { result, queries };
  } finally {
    pool.query = originalQuery;
  }
}
