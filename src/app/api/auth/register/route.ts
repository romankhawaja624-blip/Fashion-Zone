import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/api-response";
import { hashPassword } from "@/lib/password";
import { createAuthToken } from "@/lib/auth";
import { requireEmail, requireString } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const client = await db.connect();

  try {
    const body = await request.json();

    const firstName = requireString(body.firstName, "First name", {
      minLength: 1,
      maxLength: 100,
    });

    const lastName = requireString(body.lastName, "Last name", {
      minLength: 1,
      maxLength: 100,
    });

    const email = requireEmail(body.email);

    const password = requireString(body.password, "Password", {
      minLength: 8,
      maxLength: 128,
    });

    await client.query("BEGIN");

    const existingUser = await client.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );

    if (existingUser.rowCount && existingUser.rowCount > 0) {
      throw new ApiError(
        "An account with this email already exists",
        409
      );
    }

    const passwordHash = await hashPassword(password);

    const userResult = await client.query(
      `
        INSERT INTO users (
          email,
          password_hash,
          role,
          status
        )
        VALUES ($1, $2, 'customer', 'active')
        RETURNING id, email, role, status, email_verified, created_at
      `,
      [email, passwordHash]
    );

    const user = userResult.rows[0];

    const profileResult = await client.query(
      `
        INSERT INTO user_profiles (
          user_id,
          first_name,
          last_name
        )
        VALUES ($1, $2, $3)
        RETURNING
          first_name,
          last_name,
          preferred_language,
          preferred_currency
      `,
      [user.id, firstName, lastName]
    );

    await client.query("COMMIT");

    const profile = profileResult.rows[0];

    const token = createAuthToken({
      userId: user.id,
      email: user.email,
    });

    return successResponse(
      {
        user: {
          ...user,
          profile,
        },
        token,
      },
      201
    );
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Transaction may not have started.
    }

    return handleApiError(error);
  } finally {
    client.release();
  }
}