import { db } from "@/lib/db";
import {
  successResponse,
} from "@/lib/api-response";
import { handleApiError } from "@/lib/api-error";

type Category = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

type CategoryNode = Category & {
  children: CategoryNode[];
};

export async function GET() {
  try {
    const result = await db.query<Category>(`
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

    const categoryMap = new Map<string, CategoryNode>(
      categories.map((category) => [
        category.id,
        {
          ...category,
          children: [],
        },
      ])
    );

    const rootCategories: CategoryNode[] = [];

    for (const category of categoryMap.values()) {
      if (
        category.parent_id &&
        categoryMap.has(category.parent_id)
      ) {
        categoryMap
          .get(category.parent_id)!
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