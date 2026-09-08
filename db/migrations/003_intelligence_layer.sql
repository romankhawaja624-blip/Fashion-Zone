-- ============================================================
-- FALCON ATELIER DATABASE
-- Migration: 003_intelligence_layer
-- Purpose: AI conversations, digital wardrobe and saved looks
-- ============================================================


-- ------------------------------------------------------------
-- AI CONVERSATIONS
-- Stores each user's conversation with FALCON AI
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    title VARCHAR(255),

    context JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id
ON ai_conversations(user_id);


-- ------------------------------------------------------------
-- AI MESSAGES
-- Stores user and AI messages inside conversations
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL
        REFERENCES ai_conversations(id)
        ON DELETE CASCADE,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('user', 'assistant', 'system')),

    content TEXT NOT NULL,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id
ON ai_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at
ON ai_messages(created_at);


-- ------------------------------------------------------------
-- DIGITAL WARDROBES
-- Each user can maintain one or more wardrobes
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wardrobes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL DEFAULT 'My Wardrobe',

    description TEXT,

    is_default BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wardrobes_user_id
ON wardrobes(user_id);


-- ------------------------------------------------------------
-- WARDROBE ITEMS
-- User-owned clothing and fashion items
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wardrobe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    wardrobe_id UUID NOT NULL
        REFERENCES wardrobes(id)
        ON DELETE CASCADE,

    name VARCHAR(255),

    category VARCHAR(100),

    color VARCHAR(100),

    brand VARCHAR(150),

    image_url TEXT,

    season VARCHAR(50),

    occasion VARCHAR(100),

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wardrobe_items_wardrobe_id
ON wardrobe_items(wardrobe_id);

CREATE INDEX IF NOT EXISTS idx_wardrobe_items_category
ON wardrobe_items(category);


-- ------------------------------------------------------------
-- SAVED LOOKS / OUTFITS
-- AI-generated or user-created outfit combinations
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS saved_looks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    name VARCHAR(255),

    description TEXT,

    source VARCHAR(30) NOT NULL DEFAULT 'user'
        CHECK (source IN ('user', 'ai', 'stylist')),

    image_url TEXT,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_looks_user_id
ON saved_looks(user_id);


-- ------------------------------------------------------------
-- SAVED LOOK ITEMS
-- Links products and wardrobe items to an outfit
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS saved_look_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    saved_look_id UUID NOT NULL
        REFERENCES saved_looks(id)
        ON DELETE CASCADE,

    product_id UUID
        REFERENCES products(id)
        ON DELETE SET NULL,

    wardrobe_item_id UUID
        REFERENCES wardrobe_items(id)
        ON DELETE SET NULL,

    position INTEGER NOT NULL DEFAULT 0,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (
        product_id IS NOT NULL
        OR wardrobe_item_id IS NOT NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_saved_look_items_saved_look_id
ON saved_look_items(saved_look_id);

CREATE INDEX IF NOT EXISTS idx_saved_look_items_product_id
ON saved_look_items(product_id);

CREATE INDEX IF NOT EXISTS idx_saved_look_items_wardrobe_item_id
ON saved_look_items(wardrobe_item_id);