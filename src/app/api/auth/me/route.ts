import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/api-response";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      throw new ApiError("Authentication token is required", 401);
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(
        "Authorization header must use Bearer token",
        401
      );
    }

    const authUser = verifyAuthToken(token);

    const userResult = await db.query(
      `
        SELECT
          u.id,
          u.email,
          u.role,
          u.status,
          u.email_verified,
          u.created_at,
          u.updated_at,
          p.first_name,
          p.last_name,
          p.phone,
          p.avatar_url,
          p.date_of_birth,
          p.gender,
          p.preferred_language,
          p.preferred_currency
        FROM users u
        LEFT JOIN user_profiles p
          ON p.user_id = u.id
        WHERE u.id = $1
        LIMIT 1
      `,
      [authUser.userId]
    );

    if (userResult.rowCount === 0) {
      throw new ApiError("User not found", 404);
    }

    const user = userResult.rows[0];

    if (user.status !== "active") {
      throw new ApiError(
        "This account is not currently active",
        403
      );
    }

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
        profile: {
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          avatar_url: user.avatar_url,
          date_of_birth: user.date_of_birth,
          gender: user.gender,
          preferred_language: user.preferred_language,
          preferred_currency: user.preferred_currency,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}