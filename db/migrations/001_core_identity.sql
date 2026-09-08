-- ============================================================
-- FALCON ATELIER DATABASE
-- Migration: 001_core_identity
-- Purpose: Core user identity and profile foundation
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- USERS
-- Core authentication and account identity
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT,

    role VARCHAR(30) NOT NULL DEFAULT 'customer'
        CHECK (role IN ('customer', 'admin', 'staff')),

    status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'suspended')),

    email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_role
ON users(role);

CREATE INDEX IF NOT EXISTS idx_users_status
ON users(status);


-- ------------------------------------------------------------
-- USER PROFILES
-- Extended customer information
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,

    first_name VARCHAR(100),
    last_name VARCHAR(100),

    phone VARCHAR(30),

    avatar_url TEXT,

    date_of_birth DATE,

    gender VARCHAR(30),

    preferred_language VARCHAR(10) DEFAULT 'en',

    preferred_currency VARCHAR(10) DEFAULT 'PKR',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id
ON user_profiles(user_id);


-- ------------------------------------------------------------
-- USER ADDRESSES
-- Supports Pakistan-first launch and future global expansion
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    label VARCHAR(50),

    recipient_name VARCHAR(200) NOT NULL,
    phone VARCHAR(30) NOT NULL,

    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),

    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),

    postal_code VARCHAR(30),

    country VARCHAR(100) NOT NULL DEFAULT 'Pakistan',
    country_code VARCHAR(10) NOT NULL DEFAULT 'PK',

    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id
ON user_addresses(user_id);


-- ------------------------------------------------------------
-- Ensure only ONE default address per user
-- ------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_default_address_per_user
ON user_addresses(user_id)
WHERE is_default = TRUE;