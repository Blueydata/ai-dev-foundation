import type { DatabaseProbe } from "@/modules/system-status/application/ports";
import { getPool } from "@/shared/database/client";

export const postgresDatabaseProbe: DatabaseProbe = {
  async isReachable() {
    try {
      await getPool().query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  },
};
