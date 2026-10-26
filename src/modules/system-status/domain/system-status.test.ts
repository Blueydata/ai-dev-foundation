import { describe, expect, it } from "vitest";
import { buildSystemStatus, isSystemHealthy } from "@/modules/system-status/domain/system-status";

describe("system status", () => {
  it("is healthy when the database is reachable", () => {
    const status = buildSystemStatus(true);
    expect(status).toEqual({ app: "ok", database: "ok" });
    expect(isSystemHealthy(status)).toBe(true);
  });

  it("is unhealthy when the database is not reachable", () => {
    const status = buildSystemStatus(false);
    expect(status).toEqual({ app: "ok", database: "unavailable" });
    expect(isSystemHealthy(status)).toBe(false);
  });
});
