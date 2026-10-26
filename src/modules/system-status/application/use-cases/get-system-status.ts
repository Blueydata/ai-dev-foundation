import type { DatabaseProbe } from "@/modules/system-status/application/ports";
import { buildSystemStatus, type SystemStatus } from "@/modules/system-status/domain/system-status";

type GetSystemStatusDependencies = {
  databaseProbe: DatabaseProbe;
};

export function createGetSystemStatus({ databaseProbe }: GetSystemStatusDependencies) {
  return async function getSystemStatus(): Promise<SystemStatus> {
    return buildSystemStatus(await databaseProbe.isReachable());
  };
}
