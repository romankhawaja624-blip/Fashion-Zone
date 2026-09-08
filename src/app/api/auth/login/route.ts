import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/api-response";
import { verifyPassword } from "@/lib/password";
import { createAuthToken } from "@/lib/auth";
import { requireEmail, requireString } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = requireEmail(body.email);

    const password = requireString(body.password, "Password", {
      minLength: 1,
      maxLength: 128,
    });

    const userResult = await db.query(
      `
        SELECT
          u.id,
          u.email,
          u.password_hash,
          u.role,
          u.status,
          u.email_verified,
          u.created_at,
          p.first_name,
          p.last_name,
          p.preferred_language,
          p.preferred_currency
        FROM users u
        LEFT JOIN user_profiles p
          ON p.user_id = u.id
        WHERE u.email = $1
        LIMIT 1
      `,
      [email]
    );

    if (userResult.rowCount === 0) {
      throw new ApiError("Invalid email or password", 401);
    }

    const user = userResult.rows[0];

    if (!user.password_hash) {
      throw new ApiError(
        "Password login is not available for this account",
        400
      );
    }

    if (user.status !== "active") {
      throw new ApiError(
        "This account is not currently active",
        403
      );
    }

    const passwordValid = await verifyPassword(
      password,
      user.password_hash
    );

    if (!passwordValid) {
      throw new ApiError("Invalid email or password", 401);
    }

    const token = createAuthToken({
      userId: user.id,
      email: user.email,
    });

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        email_verified: user.email_verified,
        created_at: user.created_at,
        profile: {
          first_name: user.first_name,
          last_name: user.last_name,
          preferred_language: user.preferred_language,
          preferred_currency: user.preferred_currency,
        },
      },
      token,
    });
  } catch (error) {
    return handleApiError(error);
  }
}