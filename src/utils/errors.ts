export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, "BAD_REQUEST", message, details);

export const unauthorized = (message: string, details?: unknown) =>
  new AppError(401, "UNAUTHORIZED", message, details);

export const notFound = (message: string, details?: unknown) =>
  new AppError(404, "NOT_FOUND", message, details);

export const conflict = (message: string, details?: unknown) =>
  new AppError(409, "CONFLICT", message, details);
