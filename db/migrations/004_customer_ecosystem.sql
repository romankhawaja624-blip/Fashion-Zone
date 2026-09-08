-- ============================================================
-- FALCON ATELIER DATABASE
-- Migration: 004_customer_ecosystem
-- Purpose: Cart, wishlist, orders, loyalty, coins and membership
-- ============================================================


-- ------------------------------------------------------------
-- CARTS
-- One active shopping cart per user
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,

    currency VARCHAR(10) NOT NULL DEFAULT 'PKR',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- CART ITEMS
-- Products/variants currently added to a cart
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cart_id UUID NOT NULL
        REFERENCES carts(id)
        ON DELETE CASCADE,

    variant_id UUID NOT NULL
        REFERENCES product_variants(id)
        ON DELETE CASCADE,

    quantity INTEGER NOT NULL DEFAULT 1
        CHECK (quantity > 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(cart_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id
ON cart_items(cart_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id
ON cart_items(variant_id);


-- ------------------------------------------------------------
-- WISHLISTS
-- User's saved/favorite products
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id
ON wishlist_items(user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id
ON wishlist_items(product_id);


-- ------------------------------------------------------------
-- ORDERS
-- Core order record
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    order_number VARCHAR(100) NOT NULL UNIQUE,

    status VARCHAR(40) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
                'refunded'
            )
        ),

    currency VARCHAR(10) NOT NULL DEFAULT 'PKR',

    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (subtotal >= 0),

    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (discount_amount >= 0),

    shipping_amount NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (shipping_amount >= 0),

    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (tax_amount >= 0),

    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (total_amount >= 0),

    shipping_address JSONB,

    billing_address JSONB,

    notes TEXT,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id
ON orders(user_id);

CREATE INDEX IF NOT EXISTS idx_orders_order_number
ON orders(order_number);

CREATE INDEX IF NOT EXISTS idx_orders_status
ON orders(status);


-- ------------------------------------------------------------
-- ORDER ITEMS
-- Snapshot of purchased product data
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    product_id UUID
        REFERENCES products(id)
        ON DELETE SET NULL,

    variant_id UUID
        REFERENCES product_variants(id)
        ON DELETE SET NULL,

    product_name VARCHAR(255) NOT NULL,

    sku VARCHAR(150),

    quantity INTEGER NOT NULL
        CHECK (quantity > 0),

    unit_price NUMERIC(12,2) NOT NULL
        CHECK (unit_price >= 0),

    total_price NUMERIC(12,2) NOT NULL
        CHECK (total_price >= 0),

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
ON order_items(order_id);


-- ------------------------------------------------------------
-- LOYALTY ACCOUNTS
-- XP and loyalty level per user
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,

    xp INTEGER NOT NULL DEFAULT 0
        CHECK (xp >= 0),

    level INTEGER NOT NULL DEFAULT 1
        CHECK (level >= 1),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- LOYALTY TRANSACTIONS
-- Audit trail for XP changes
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    loyalty_account_id UUID NOT NULL
        REFERENCES loyalty_accounts(id)
        ON DELETE CASCADE,

    amount INTEGER NOT NULL,

    type VARCHAR(40) NOT NULL
        CHECK (
            type IN (
                'earned',
                'redeemed',
                'adjustment',
                'bonus'
            )
        ),

    description TEXT,

    reference_type VARCHAR(50),
    reference_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_account_id
ON loyalty_transactions(loyalty_account_id);


-- ------------------------------------------------------------
-- FALCON COIN WALLETS
-- Current coin balance per user
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS coin_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,

    balance INTEGER NOT NULL DEFAULT 0
        CHECK (balance >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- COIN TRANSACTIONS
-- Immutable history of Falcon Coin activity
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    wallet_id UUID NOT NULL
        REFERENCES coin_wallets(id)
        ON DELETE CASCADE,

    amount INTEGER NOT NULL,

    type VARCHAR(40) NOT NULL
        CHECK (
            type IN (
                'earned',
                'spent',
                'adjustment',
                'bonus'
            )
        ),

    description TEXT,

    reference_type VARCHAR(50),
    reference_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_wallet_id
ON coin_transactions(wallet_id);


-- ------------------------------------------------------------
-- MEMBERSHIP PLANS
-- Supports Free / Pro and future membership tiers
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL UNIQUE,

    slug VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    price NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (price >= 0),

    currency VARCHAR(10) NOT NULL DEFAULT 'PKR',

    billing_interval VARCHAR(20) NOT NULL DEFAULT 'monthly'
        CHECK (billing_interval IN ('monthly', 'yearly', 'lifetime')),

    features JSONB NOT NULL DEFAULT '{}'::jsonb,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- USER MEMBERSHIPS
-- Membership state for each customer
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    membership_plan_id UUID NOT NULL
        REFERENCES membership_plans(id)
        ON DELETE RESTRICT,

    status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),

    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    expires_at TIMESTAMPTZ,

    cancelled_at TIMESTAMPTZ,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id
ON user_memberships(user_id);

CREATE INDEX IF NOT EXISTS idx_user_memberships_plan_id
ON user_memberships(membership_plan_id);

CREATE INDEX IF NOT EXISTS idx_user_memberships_status
ON user_memberships(status);