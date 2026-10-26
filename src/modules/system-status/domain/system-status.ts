export type DatabaseStatus = "ok" | "unavailable";

export type SystemStatus = {
  app: "ok";
  database: DatabaseStatus;
};

export function buildSystemStatus(databaseReachable: boolean): SystemStatus {
  return { app: "ok", database: databaseReachable ? "ok" : "unavailable" };
}

export function isSystemHealthy(status: SystemStatus): boolean {
  return status.database === "ok";
}
