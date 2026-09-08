import { ApiError } from "./api-error";

export function requireString(
  value: unknown,
  fieldName: string,
  options?: {
    minLength?: number;
    maxLength?: number;
  }
): string {
  if (typeof value !== "string") {
    throw new ApiError(`${fieldName} is required`, 400);
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new ApiError(`${fieldName} cannot be empty`, 400);
  }

  if (
    options?.minLength !== undefined &&
    trimmedValue.length < options.minLength
  ) {
    throw new ApiError(
      `${fieldName} must be at least ${options.minLength} characters`,
      400
    );
  }

  if (
    options?.maxLength !== undefined &&
    trimmedValue.length > options.maxLength
  ) {
    throw new ApiError(
      `${fieldName} must be at most ${options.maxLength} characters`,
      400
    );
  }

  return trimmedValue;
}

export function requireEmail(
  value: unknown,
  fieldName = "Email"
): string {
  const email = requireString(value, fieldName, {
    maxLength: 255,
  }).toLowerCase();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new ApiError(`${fieldName} must be valid`, 400);
  }

  return email;
}

export function requirePositiveInteger(
  value: unknown,
  fieldName: string
): number {
  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  if (
    !Number.isInteger(numberValue) ||
    numberValue <= 0
  ) {
    throw new ApiError(
      `${fieldName} must be a positive integer`,
      400
    );
  }

  return numberValue;
}

export function optionalString(
  value: unknown,
  fieldName: string,
  options?: {
    maxLength?: number;
  }
): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ApiError(`${fieldName} must be a string`, 400);
  }

  const trimmedValue = value.trim();

  if (
    options?.maxLength !== undefined &&
    trimmedValue.length > options.maxLength
  ) {
    throw new ApiError(
      `${fieldName} must be at most ${options.maxLength} characters`,
      400
    );
  }

  return trimmedValue || undefined;
}

export function requireUuid(
  value: unknown,
  fieldName: string
): string {
  const uuid = requireString(value, fieldName);

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(uuid)) {
    throw new ApiError(`${fieldName} must be a valid UUID`, 400);
  }

  return uuid;
}