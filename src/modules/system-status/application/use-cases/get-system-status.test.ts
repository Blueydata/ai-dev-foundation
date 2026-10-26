import { describe, expect, it } from "vitest";
import type { DatabaseProbe } from "@/modules/system-status/application/ports";
import { createGetSystemStatus } from "@/modules/system-status/application/use-cases/get-system-status";

const probeReturning = (reachable: boolean): DatabaseProbe => ({ isReachable: async () => reachable });

describe("getSystemStatus", () => {
  it("reports the database as ok when the probe reaches it", async () => {
    const getSystemStatus = createGetSystemStatus({ databaseProbe: probeReturning(true) });
    expect(await getSystemStatus()).toEqual({ app: "ok", database: "ok" });
  });

  it("reports the database as unavailable when the probe cannot reach it", async () => {
    const getSystemStatus = createGetSystemStatus({ databaseProbe: probeReturning(false) });
    expect(await getSystemStatus()).toEqual({ app: "ok", database: "unavailable" });
  });
});
