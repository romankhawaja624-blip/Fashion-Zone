-- ============================================================
-- FALCON ATELIER DATABASE
-- Migration: 002_commerce_foundation
-- Purpose: Core commerce catalog, variants, images and inventory
-- ============================================================

-- ------------------------------------------------------------
-- CATEGORIES
-- Supports hierarchical Men / Women / Collections structure
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    parent_id UUID
        REFERENCES categories(id)
        ON DELETE SET NULL,

    name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,

    description TEXT,

    image_url TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id
ON categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_categories_slug
ON categories(slug);


-- ------------------------------------------------------------
-- PRODUCTS
-- Main fashion product catalog
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_id UUID
        REFERENCES categories(id)
        ON DELETE SET NULL,

    name VARCHAR(255) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,

    short_description TEXT,
    description TEXT,

    brand VARCHAR(150) DEFAULT 'FALCON',

    gender VARCHAR(30)
        CHECK (gender IN ('men', 'women', 'unisex', 'kids')),

    product_type VARCHAR(100),

    status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'active', 'archived')),

    is_featured BOOLEAN NOT NULL DEFAULT FALSE,

    base_price NUMERIC(12,2) NOT NULL
        CHECK (base_price >= 0),

    compare_at_price NUMERIC(12,2)
        CHECK (compare_at_price IS NULL OR compare_at_price >= 0),

    currency VARCHAR(10) NOT NULL DEFAULT 'PKR',

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id
ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_products_slug
ON products(slug);

CREATE INDEX IF NOT EXISTS idx_products_status
ON products(status);

CREATE INDEX IF NOT EXISTS idx_products_gender
ON products(gender);

CREATE INDEX IF NOT EXISTS idx_products_featured
ON products(is_featured);


-- ------------------------------------------------------------
-- PRODUCT VARIANTS
-- Size / color / SKU combinations
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    sku VARCHAR(150) NOT NULL UNIQUE,

    name VARCHAR(255),

    size VARCHAR(50),
    color VARCHAR(100),

    price NUMERIC(12,2)
        CHECK (price IS NULL OR price >= 0),

    compare_at_price NUMERIC(12,2)
        CHECK (compare_at_price IS NULL OR compare_at_price >= 0),

    barcode VARCHAR(150),

    weight_grams INTEGER
        CHECK (weight_grams IS NULL OR weight_grams >= 0),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id
ON product_variants(product_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_sku
ON product_variants(sku);


-- ------------------------------------------------------------
-- PRODUCT IMAGES
-- Multiple images per product
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    variant_id UUID
        REFERENCES product_variants(id)
        ON DELETE CASCADE,

    image_url TEXT NOT NULL,

    alt_text VARCHAR(255),

    sort_order INTEGER NOT NULL DEFAULT 0,

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id
ON product_images(product_id);

CREATE INDEX IF NOT EXISTS idx_product_images_variant_id
ON product_images(variant_id);


-- ------------------------------------------------------------
-- INVENTORY
-- Stock management per product variant
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    variant_id UUID NOT NULL UNIQUE
        REFERENCES product_variants(id)
        ON DELETE CASCADE,

    quantity INTEGER NOT NULL DEFAULT 0
        CHECK (quantity >= 0),

    reserved_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (reserved_quantity >= 0),

    reorder_level INTEGER NOT NULL DEFAULT 0
        CHECK (reorder_level >= 0),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_variant_id
ON inventory(variant_id);