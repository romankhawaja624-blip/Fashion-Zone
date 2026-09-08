import { db } from "@/lib/db";
import {
  successResponse,
} from "@/lib/api-response";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const result = await db.query(`
      SELECT
        id,
        parent_id,
        name,
        slug,
        description,
        image_url,
        sort_order
      FROM categories
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `);

    const categories = result.rows;

    const categoryMap = new Map(
      categories.map((category) => [
        category.id,
        {
          ...category,
          children: [],
        },
      ])
    );

    const rootCategories: typeof categories = [];

    for (const category of categoryMap.values()) {
      if (
        category.parent_id &&
        categoryMap.has(category.parent_id)
      ) {
        categoryMap
          .get(category.parent_id)
          .children.push(category);
      } else {
        rootCategories.push(category);
      }
    }

    return successResponse({
      categories: rootCategories,
    });
  } catch (error) {
    return handleApiError(error);
  }
}