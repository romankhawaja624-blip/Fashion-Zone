-- ============================================================
-- FALCON ATELIER DATABASE
-- Migration: 005_platform_operations
-- Purpose: Payments, notifications, support and audit logging
-- ============================================================


-- ------------------------------------------------------------
-- PAYMENTS
-- Provider-agnostic payment architecture
-- Pakistan-first launch: JazzCash, Easypaisa, Bank Transfer
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES orders(id)
        ON DELETE RESTRICT,

    user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    provider VARCHAR(50) NOT NULL
        CHECK (
            provider IN (
                'jazzcash',
                'easypaisa',
                'bank_transfer',
                'cash_on_delivery',
                'other'
            )
        ),

    payment_method VARCHAR(100),

    status VARCHAR(40) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'processing',
                'authorized',
                'paid',
                'failed',
                'cancelled',
                'refunded',
                'partially_refunded'
            )
        ),

    amount NUMERIC(12,2) NOT NULL
        CHECK (amount >= 0),

    currency VARCHAR(10) NOT NULL DEFAULT 'PKR',

    provider_reference VARCHAR(255),

    provider_response JSONB NOT NULL DEFAULT '{}'::jsonb,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    paid_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id
ON payments(order_id);

CREATE INDEX IF NOT EXISTS idx_payments_user_id
ON payments(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_status
ON payments(status);

CREATE INDEX IF NOT EXISTS idx_payments_provider_reference
ON payments(provider_reference);


-- ------------------------------------------------------------
-- PAYMENT TRANSACTIONS
-- Immutable provider event / transaction history
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    payment_id UUID NOT NULL
        REFERENCES payments(id)
        ON DELETE CASCADE,

    transaction_type VARCHAR(50) NOT NULL
        CHECK (
            transaction_type IN (
                'created',
                'authorization',
                'capture',
                'payment',
                'refund',
                'failure',
                'adjustment'
            )
        ),

    amount NUMERIC(12,2)
        CHECK (amount IS NULL OR amount >= 0),

    provider_transaction_id VARCHAR(255),

    status VARCHAR(40),

    payload JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id
ON payment_transactions(payment_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_transaction_id
ON payment_transactions(provider_transaction_id);


-- ------------------------------------------------------------
-- NOTIFICATIONS
-- In-app notification foundation
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    type VARCHAR(100) NOT NULL,

    title VARCHAR(255) NOT NULL,

    message TEXT,

    data JSONB NOT NULL DEFAULT '{}'::jsonb,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    read_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
ON notifications(user_id, is_read);


-- ------------------------------------------------------------
-- NOTIFICATION PREFERENCES
-- User communication preferences
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,

    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    order_updates BOOLEAN NOT NULL DEFAULT TRUE,

    promotions BOOLEAN NOT NULL DEFAULT TRUE,

    ai_updates BOOLEAN NOT NULL DEFAULT TRUE,

    loyalty_updates BOOLEAN NOT NULL DEFAULT TRUE,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- SUPPORT TICKETS
-- Customer support / issue tracking
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    ticket_number VARCHAR(100) NOT NULL UNIQUE,

    subject VARCHAR(255) NOT NULL,

    category VARCHAR(100),

    priority VARCHAR(20) NOT NULL DEFAULT 'normal'
        CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

    status VARCHAR(30) NOT NULL DEFAULT 'open'
        CHECK (
            status IN (
                'open',
                'in_progress',
                'waiting_customer',
                'resolved',
                'closed'
            )
        ),

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id
ON support_tickets(user_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status
ON support_tickets(status);

CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number
ON support_tickets(ticket_number);


-- ------------------------------------------------------------
-- SUPPORT TICKET MESSAGES
-- Conversation inside a support ticket
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    ticket_id UUID NOT NULL
        REFERENCES support_tickets(id)
        ON DELETE CASCADE,

    sender_user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    sender_type VARCHAR(20) NOT NULL
        CHECK (sender_type IN ('customer', 'staff', 'system')),

    message TEXT NOT NULL,

    attachments JSONB NOT NULL DEFAULT '[]'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id
ON support_ticket_messages(ticket_id);


-- ------------------------------------------------------------
-- AUDIT LOGS
-- Important security, admin and system activity
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    actor_user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    action VARCHAR(150) NOT NULL,

    entity_type VARCHAR(100),

    entity_id UUID,

    old_data JSONB,

    new_data JSONB,

    ip_address INET,

    user_agent TEXT,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id
ON audit_logs(actor_user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
ON audit_logs(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
ON audit_logs(created_at);