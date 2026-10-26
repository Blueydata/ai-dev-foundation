import { createGetSystemStatus } from "@/modules/system-status/application/use-cases/get-system-status";
import { postgresDatabaseProbe } from "@/modules/system-status/infrastructure/postgres-database-probe";

export const getSystemStatus = createGetSystemStatus({ databaseProbe: postgresDatabaseProbe });

export { isSystemHealthy, type SystemStatus } from "@/modules/system-status/domain/system-status";
