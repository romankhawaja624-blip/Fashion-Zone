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

const products = [
  {
    name: "Obsidian Trench Coat",
    slug: "obsidian-trench-coat",
    short_description: "A refined architectural trench coat for modern wardrobes.",
    description:
      "A premium tailored trench coat designed around FALCON's obsidian aesthetic. Structured proportions meet timeless utility for a sophisticated everyday silhouette.",
    category: "outerwear",
    gender: "unisex",
    product_type: "trench coat",
    price: 48000,
    compare_at_price: 56000,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=85",
    variants: [
      { sku: "FAL-OTC-BLK-S", size: "S", color: "Obsidian Black" },
      { sku: "FAL-OTC-BLK-M", size: "M", color: "Obsidian Black" },
      { sku: "FAL-OTC-BLK-L", size: "L", color: "Obsidian Black" },
    ],
  },
  {
    name: "Obsidian Silk Gown",
    slug: "obsidian-silk-gown",
    short_description: "An elegant silk silhouette with a refined evening finish.",
    description:
      "A sophisticated evening gown designed with fluid movement, refined proportions and an understated luxury aesthetic.",
    category: "dresses",
    gender: "women",
    product_type: "silk gown",
    price: 52000,
    compare_at_price: 62000,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85",
    variants: [
      { sku: "FAL-OSG-BLK-S", size: "S", color: "Obsidian Black" },
      { sku: "FAL-OSG-BLK-M", size: "M", color: "Obsidian Black" },
      { sku: "FAL-OSG-BLK-L", size: "L", color: "Obsidian Black" },
    ],
  },
  {
    name: "Tailored Obsidian Coat",
    slug: "tailored-obsidian-coat",
    short_description: "A sharply tailored coat built for elevated everyday dressing.",
    description:
      "A clean architectural coat with a structured silhouette, designed to transition effortlessly between formal and contemporary wardrobes.",
    category: "outerwear",
    gender: "men",
    product_type: "tailored coat",
    price: 61000,
    compare_at_price: 72000,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=85",
    variants: [
      { sku: "FAL-TOC-BLK-M", size: "M", color: "Obsidian Black" },
      { sku: "FAL-TOC-BLK-L", size: "L", color: "Obsidian Black" },
      { sku: "FAL-TOC-BLK-XL", size: "XL", color: "Obsidian Black" },
    ],
  },
  {
    name: "Essential Tapered Trousers",
    slug: "essential-tapered-trousers",
    short_description: "Precision-cut tapered trousers for effortless daily styling.",
    description:
      "A versatile pair of tailored trousers with a refined tapered profile, designed as a foundational piece for the modern FALCON wardrobe.",
    category: "bottoms",
    gender: "unisex",
    product_type: "tailored trousers",
    price: 18500,
    compare_at_price: 22000,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=85",
    variants: [
      { sku: "FAL-ETT-BLK-S", size: "S", color: "Obsidian Black" },
      { sku: "FAL-ETT-BLK-M", size: "M", color: "Obsidian Black" },
      { sku: "FAL-ETT-BLK-L", size: "L", color: "Obsidian Black" },
    ],
  },
  {
    name: "Obsidian Structured Blazer",
    slug: "obsidian-structured-blazer",
    short_description: "A structured blazer with a sharp contemporary silhouette.",
    description:
      "A modern statement blazer balancing precise tailoring with FALCON's understated luxury language.",
    category: "tops",
    gender: "men",
    product_type: "blazer",
    price: 39000,
    compare_at_price: 46000,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85",
    variants: [
      { sku: "FAL-OSB-BLK-M", size: "M", color: "Obsidian Black" },
      { sku: "FAL-OSB-BLK-L", size: "L", color: "Obsidian Black" },
      { sku: "FAL-OSB-BLK-XL", size: "XL", color: "Obsidian Black" },
    ],
  },
];

async function seedProducts() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const product of products) {
      const categoryResult = await client.query(
        `
          SELECT id
          FROM categories
          WHERE slug = $1
          LIMIT 1
        `,
        [product.category]
      );

      if (categoryResult.rowCount === 0) {
        throw new Error(
          `Category not found: ${product.category}`
        );
      }

      const categoryId = categoryResult.rows[0].id;

      const productResult = await client.query(
        `
          INSERT INTO products (
            category_id,
            name,
            slug,
            short_description,
            description,
            brand,
            gender,
            product_type,
            status,
            is_featured,
            base_price,
            compare_at_price,
            currency
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            'FALCON',
            $6,
            $7,
            'active',
            $8,
            $9,
            $10,
            'PKR'
          )
          ON CONFLICT (slug)
          DO UPDATE SET
            category_id = EXCLUDED.category_id,
            name = EXCLUDED.name,
            short_description = EXCLUDED.short_description,
            description = EXCLUDED.description,
            brand = EXCLUDED.brand,
            gender = EXCLUDED.gender,
            product_type = EXCLUDED.product_type,
            status = EXCLUDED.status,
            is_featured = EXCLUDED.is_featured,
            base_price = EXCLUDED.base_price,
            compare_at_price = EXCLUDED.compare_at_price,
            currency = EXCLUDED.currency,
            updated_at = NOW()
          RETURNING id
        `,
        [
          categoryId,
          product.name,
          product.slug,
          product.short_description,
          product.description,
          product.gender,
          product.product_type,
          product.featured,
          product.price,
          product.compare_at_price,
        ]
      );

      const productId = productResult.rows[0].id;

      for (const variant of product.variants) {
        const variantResult = await client.query(
          `
            INSERT INTO product_variants (
              product_id,
              sku,
              name,
              size,
              color,
              price,
              compare_at_price,
              is_active
            )
            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7,
              TRUE
            )
            ON CONFLICT (sku)
            DO UPDATE SET
              product_id = EXCLUDED.product_id,
              name = EXCLUDED.name,
              size = EXCLUDED.size,
              color = EXCLUDED.color,
              price = EXCLUDED.price,
              compare_at_price = EXCLUDED.compare_at_price,
              is_active = TRUE,
              updated_at = NOW()
            RETURNING id
          `,
          [
            productId,
            variant.sku,
            `${product.name} - ${variant.size}`,
            variant.size,
            variant.color,
            product.price,
            product.compare_at_price,
          ]
        );

        const variantId = variantResult.rows[0].id;

        await client.query(
          `
            INSERT INTO inventory (
              variant_id,
              quantity,
              reserved_quantity,
              reorder_level
            )
            VALUES ($1, 20, 0, 5)
            ON CONFLICT (variant_id)
            DO UPDATE SET
              quantity = EXCLUDED.quantity,
              reorder_level = EXCLUDED.reorder_level,
              updated_at = NOW()
          `,
          [variantId]
        );
      }

      await client.query(
        `
          DELETE FROM product_images
          WHERE product_id = $1
        `,
        [productId]
      );

      await client.query(
        `
          INSERT INTO product_images (
            product_id,
            image_url,
            alt_text,
            sort_order,
            is_primary
          )
          VALUES ($1, $2, $3, 0, TRUE)
        `,
        [
          productId,
          product.image,
          `${product.name} — FALCON`,
        ]
      );
    }

    await client.query("COMMIT");

    console.log("Products seeded successfully.");

    const result = await client.query(`
      SELECT
        p.name,
        p.slug,
        c.name AS category,
        p.gender,
        p.base_price,
        p.currency,
        p.is_featured
      FROM products p
      LEFT JOIN categories c
        ON c.id = p.category_id
      WHERE p.status = 'active'
      ORDER BY p.created_at ASC
    `);

    console.table(result.rows);
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Product seeding failed:", error);

    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seedProducts();