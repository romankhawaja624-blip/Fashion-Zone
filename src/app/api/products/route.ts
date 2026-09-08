import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const gender = searchParams.get("gender");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");

    const values: unknown[] = [];
    const conditions: string[] = [
      "p.status = 'active'",
    ];

    if (category) {
      values.push(category);
      conditions.push(
        `c.slug = $${values.length}`
      );
    }

    if (gender) {
      values.push(gender);
      conditions.push(
        `p.gender = $${values.length}`
      );
    }

    if (featured === "true") {
      conditions.push(
        "p.is_featured = true"
      );
    }

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          p.name ILIKE $${values.length}
          OR p.brand ILIKE $${values.length}
          OR p.product_type ILIKE $${values.length}
        )
      `);
    }

    const whereClause = conditions.join(" AND ");

    const result = await db.query(
      `
        SELECT
          p.id,
          p.name,
          p.slug,
          p.short_description,
          p.brand,
          p.gender,
          p.product_type,
          p.is_featured,
          p.base_price,
          p.compare_at_price,
          p.currency,

          c.id AS category_id,
          c.name AS category_name,
          c.slug AS category_slug,

          (
            SELECT pi.image_url
            FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY
              pi.is_primary DESC,
              pi.sort_order ASC
            LIMIT 1
          ) AS image_url

        FROM products p

        LEFT JOIN categories c
          ON c.id = p.category_id

        WHERE ${whereClause}

        ORDER BY
          p.is_featured DESC,
          p.created_at DESC
      `,
      values
    );

    return successResponse({
      products: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}