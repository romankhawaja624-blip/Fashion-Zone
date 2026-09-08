import jwt from "jsonwebtoken";
import { ApiError } from "./api-error";

export type AuthTokenPayload = {
  userId: string;
  email: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim().length < 32) {
    throw new Error(
      "JWT_SECRET is missing or must be at least 32 characters long"
    );
  }

  return secret;
}

export function createAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  try {
    const decoded = jwt.verify(
      token,
      getJwtSecret()
    ) as AuthTokenPayload;

    if (!decoded.userId || !decoded.email) {
      throw new ApiError("Invalid authentication token", 401);
    }

    return decoded;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("Invalid or expired authentication token", 401);
  }
}