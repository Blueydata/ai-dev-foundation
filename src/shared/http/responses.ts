import { z } from "zod";
import { AppError, ValidationError, type AppErrorCode } from "@/shared/kernel/errors";

const STATUS_BY_CODE: Record<AppErrorCode, number> = {
  validation: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  unavailable: 503,
};

export async function parseJsonBody<SCHEMA extends z.ZodType>(request: Request, schema: SCHEMA): Promise<z.infer<SCHEMA>> {
  const body: unknown = await request.json().catch(() => {
    throw new ValidationError("Request body must be valid JSON");
  });
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError("Invalid request body", { issues: z.treeifyError(result.error) });
  }
  return result.data;
}

export function errorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json({ error: { code: error.code, message: error.message } }, { status: STATUS_BY_CODE[error.code] });
  }
  console.error(error instanceof Error ? error.name : "Unknown error");
  return Response.json({ error: { code: "internal", message: "Something went wrong" } }, { status: 500 });
}

export function withErrorHandling<ARGS extends unknown[]>(handler: (...args: ARGS) => Promise<Response>) {
  return async (...args: ARGS): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
