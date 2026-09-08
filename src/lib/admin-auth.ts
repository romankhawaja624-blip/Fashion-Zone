import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";
import { verifyAuthToken } from "@/lib/auth";

export async function requireAdmin(
  request: NextRequest
) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization) {
    throw new ApiError(
      "Authentication token is required",
      401
    );
  }

  const [scheme, token] =
    authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(
      "Authorization header must use Bearer token",
      401
    );
  }

  const authUser = verifyAuthToken(token);

  const result = await db.query(
    `
      SELECT
        id,
        email,
        role,
        status
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [authUser.userId]
  );

  if (result.rowCount === 0) {
    throw new ApiError(
      "User not found",
      404
    );
  }

  const user = result.rows[0];

  if (user.status !== "active") {
    throw new ApiError(
      "This account is not currently active",
      403
    );
  }

  if (user.role !== "admin") {
    throw new ApiError(
      "Admin access is required",
      403
    );
  }

  return user;
}