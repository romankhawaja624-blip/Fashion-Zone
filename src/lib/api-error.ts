import { NextResponse } from "next/server";

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    details?: unknown
  ) {
    super(message);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          ...(error.details !== undefined
            ? { details: error.details }
            : {}),
        },
      },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        message: "Internal server error",
      },
    },
    { status: 500 }
  );
}