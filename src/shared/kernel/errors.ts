export type AppErrorCode = "validation" | "unauthorized" | "forbidden" | "not_found" | "conflict" | "unavailable";

export class AppError extends Error {
  constructor(
    readonly code: AppErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("validation", message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super("unauthorized", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Not allowed") {
    super("forbidden", message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super("not_found", id ? `${resource} ${id} not found` : `${resource} not found`, { resource, id });
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("conflict", message);
  }
}

export class UnavailableError extends AppError {
  constructor(service: string) {
    super("unavailable", `${service} is unavailable`, { service });
  }
}
