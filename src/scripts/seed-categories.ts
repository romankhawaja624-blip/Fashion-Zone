import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

const categories = [
  {
    name: "Men",
    slug: "men",
    description: "FALCON men's collection.",
    sort_order: 1,
  },
  {
    name: "Women",
    slug: "women",
    description: "FALCON women's collection.",
    sort_order: 2,
  },
  {
    name: "New Arrivals",
    slug: "new-arrivals",
    description: "The latest arrivals from FALCON.",
    sort_order: 3,
  },
  {
    name: "Clothing",
    slug: "clothing",
    description: "FALCON clothing collection.",
    sort_order: 4,
  },
  {
    name: "Outerwear",
    slug: "outerwear",
    description: "FALCON outerwear collection.",
    sort_order: 5,
  },
  {
    name: "Tops",
    slug: "tops",
    description: "FALCON tops collection.",
    sort_order: 6,
  },
  {
    name: "Bottoms",
    slug: "bottoms",
    description: "FALCON bottoms collection.",
    sort_order: 7,
  },
  {
    name: "Dresses",
    slug: "dresses",
    description: "FALCON dresses collection.",
    sort_order: 8,
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "FALCON accessories collection.",
    sort_order: 9,
  },
];

async function seedCategories() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const category of categories) {
      await client.query(
        `
          INSERT INTO categories (
            name,
            slug,
            description,
            sort_order,
            is_active
          )
          VALUES ($1, $2, $3, $4, TRUE)
          ON CONFLICT (slug)
          DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            sort_order = EXCLUDED.sort_order,
            is_active = TRUE,
            updated_at = NOW()
        `,
        [
          category.name,
          category.slug,
          category.description,
          category.sort_order,
        ]
      );
    }

    await client.query("COMMIT");

    console.log("Categories seeded successfully.");

    const result = await client.query(`
      SELECT
        name,
        slug,
        sort_order
      FROM categories
      WHERE is_active = TRUE
      ORDER BY sort_order ASC
    `);

    console.table(result.rows);
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Category seeding failed:", error);

    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seedCategories();