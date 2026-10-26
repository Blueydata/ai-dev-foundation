import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { errorResponse, parseJsonBody, withErrorHandling } from "@/shared/http/responses";
import { NotFoundError, ValidationError } from "@/shared/kernel/errors";

const jsonRequest = (body: string) => new Request("http://localhost/api/test", { method: "POST", body });

describe("parseJsonBody", () => {
  const schema = z.object({ name: z.string().min(1) });

  it("returns the parsed body when it matches the schema", async () => {
    await expect(parseJsonBody(jsonRequest('{"name":"Ana"}'), schema)).resolves.toEqual({ name: "Ana" });
  });

  it("throws a validation error for invalid JSON", async () => {
    await expect(parseJsonBody(jsonRequest("{"), schema)).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws a validation error when the body does not match the schema", async () => {
    await expect(parseJsonBody(jsonRequest('{"name":""}'), schema)).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("errorResponse", () => {
  it("maps application errors to their status", async () => {
    const response = errorResponse(new NotFoundError("Order", "8f3a"));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: { code: "not_found", message: "Order 8f3a not found" } });
  });

  it("hides unexpected errors behind a 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = errorResponse(new Error("connection string leaked"));
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("leaked");
  });
});

describe("withErrorHandling", () => {
  it("turns thrown errors into responses", async () => {
    const handler = withErrorHandling(async () => {
      throw new ValidationError("Invalid");
    });
    expect((await handler()).status).toBe(400);
  });
});
