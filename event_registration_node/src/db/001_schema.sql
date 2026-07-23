-- ================================================================
-- EVENT REGISTRATION SYSTEM — COMPLETE DATABASE SCHEMA
-- File: 001_schema.sql
-- Database: event_db (PostgreSQL 14+)
-- 
-- TABLE LIST:
--   1. tbl_users           — All registered users
--   2. tbl_event_categories — Event type lookup table
--   3. tbl_events          — All events
--   4. tbl_registrations   — User registrations for events
--   5. tbl_admin_logs      — Admin action audit trail
-- ================================================================

-- Drop existing tables (clean rebuild)
DROP TABLE IF EXISTS tbl_admin_logs    CASCADE;
DROP TABLE IF EXISTS tbl_registrations CASCADE;
DROP TABLE IF EXISTS tbl_events        CASCADE;
DROP TABLE IF EXISTS tbl_event_categories CASCADE;
DROP TABLE IF EXISTS tbl_users         CASCADE;

-- Also drop old tables if they exist
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events        CASCADE;
DROP TABLE IF EXISTS users         CASCADE;

-- ================================================================
-- TABLE 1: tbl_users
-- Stores all registered users (attendees, organizers, admins)
-- ================================================================
CREATE TABLE tbl_users (
    user_id       SERIAL          PRIMARY KEY,
    email         VARCHAR(255)    UNIQUE NOT NULL,
    first_name    VARCHAR(100)    NOT NULL,
    last_name     VARCHAR(100)    NOT NULL,
    phone         VARCHAR(25)     DEFAULT '',
    password_hash VARCHAR(255)    NOT NULL,
    profile_image VARCHAR(500)    DEFAULT '',
    bio           TEXT            DEFAULT '',
    city          VARCHAR(100)    DEFAULT '',
    country       VARCHAR(100)    DEFAULT 'Pakistan',
    is_organizer  BOOLEAN         NOT NULL DEFAULT false,
    is_staff      BOOLEAN         NOT NULL DEFAULT false,
    is_active     BOOLEAN         NOT NULL DEFAULT true,
    last_login    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Indexes on tbl_users
CREATE UNIQUE INDEX idx_users_email    ON tbl_users(email);
CREATE INDEX        idx_users_organizer ON tbl_users(is_organizer);
CREATE INDEX        idx_users_staff    ON tbl_users(is_staff);
CREATE INDEX        idx_users_active   ON tbl_users(is_active);

COMMENT ON TABLE  tbl_users               IS 'All registered users of the platform';
COMMENT ON COLUMN tbl_users.user_id       IS 'Primary key — auto increment';
COMMENT ON COLUMN tbl_users.email         IS 'Unique login identifier';
COMMENT ON COLUMN tbl_users.is_organizer  IS 'True = can create and manage events';
COMMENT ON COLUMN tbl_users.is_staff      IS 'True = has access to admin panel';
COMMENT ON COLUMN tbl_users.is_active     IS 'False = account disabled';

-- ================================================================
-- TABLE 2: tbl_event_categories
-- Lookup table for event types/categories
-- ================================================================
CREATE TABLE tbl_event_categories (
    category_id   SERIAL          PRIMARY KEY,
    name          VARCHAR(100)    UNIQUE NOT NULL,
    slug          VARCHAR(100)    UNIQUE NOT NULL,
    description   TEXT            DEFAULT '',
    icon          VARCHAR(10)     DEFAULT '🎫',
    color         VARCHAR(20)     DEFAULT '#4f46e5',
    sort_order    INTEGER         DEFAULT 0,
    is_active     BOOLEAN         NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tbl_event_categories IS 'Lookup table for event category types';

-- ================================================================
-- TABLE 3: tbl_events
-- Stores all events created by organizers
-- ================================================================
CREATE TABLE tbl_events (
    event_id      SERIAL          PRIMARY KEY,
    title         VARCHAR(300)    NOT NULL,
    description   TEXT            DEFAULT '',
    organizer_id  INTEGER         NOT NULL REFERENCES tbl_users(user_id) ON DELETE CASCADE,
    category_id   INTEGER         REFERENCES tbl_event_categories(category_id) ON DELETE SET NULL,
    venue_name    VARCHAR(255)    NOT NULL,
    address       VARCHAR(500)    DEFAULT '',
    city          VARCHAR(100)    NOT NULL DEFAULT '',
    country       VARCHAR(100)    NOT NULL DEFAULT 'Pakistan',
    latitude      DECIMAL(10,8),
    longitude     DECIMAL(11,8),
    banner_image  VARCHAR(500)    DEFAULT '',
    start_datetime TIMESTAMPTZ   NOT NULL,
    end_datetime  TIMESTAMPTZ     NOT NULL,
    capacity      INTEGER         NOT NULL CHECK (capacity >= 1),
    ticket_price  DECIMAL(10,2)   DEFAULT 0.00,
    currency      VARCHAR(10)     DEFAULT 'PKR',
    is_free       BOOLEAN         NOT NULL DEFAULT true,
    is_published  BOOLEAN         NOT NULL DEFAULT false,
    is_featured   BOOLEAN         NOT NULL DEFAULT false,
    is_cancelled  BOOLEAN         NOT NULL DEFAULT false,
    tags          TEXT            DEFAULT '',
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_event_dates CHECK (end_datetime > start_datetime),
    CONSTRAINT chk_ticket_price CHECK (ticket_price >= 0)
);

-- Indexes on tbl_events
CREATE INDEX idx_events_organizer   ON tbl_events(organizer_id);
CREATE INDEX idx_events_category    ON tbl_events(category_id);
CREATE INDEX idx_events_published   ON tbl_events(is_published);
CREATE INDEX idx_events_featured    ON tbl_events(is_featured);
CREATE INDEX idx_events_start       ON tbl_events(start_datetime);
CREATE INDEX idx_events_city        ON tbl_events(city);
CREATE INDEX idx_events_country     ON tbl_events(country);

COMMENT ON TABLE  tbl_events               IS 'All events created by organizers';
COMMENT ON COLUMN tbl_events.event_id      IS 'Primary key — auto increment';
COMMENT ON COLUMN tbl_events.organizer_id  IS 'FK → tbl_users(user_id)';
COMMENT ON COLUMN tbl_events.category_id   IS 'FK → tbl_event_categories(category_id)';
COMMENT ON COLUMN tbl_events.capacity      IS 'Maximum number of attendees';
COMMENT ON COLUMN tbl_events.is_published  IS 'True = visible to the public';
COMMENT ON COLUMN tbl_events.is_featured   IS 'True = shown in featured section';
COMMENT ON COLUMN tbl_events.is_free       IS 'True = no ticket price required';

-- ================================================================
-- TABLE 4: tbl_registrations
-- Links users to events they have registered for
-- ================================================================
CREATE TABLE tbl_registrations (
    registration_id  SERIAL       PRIMARY KEY,
    user_id          INTEGER      NOT NULL REFERENCES tbl_users(user_id) ON DELETE CASCADE,
    event_id         INTEGER      NOT NULL REFERENCES tbl_events(event_id) ON DELETE CASCADE,
    status           VARCHAR(20)  NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active', 'cancelled', 'attended', 'waitlisted')),
    ticket_code      VARCHAR(50)  UNIQUE DEFAULT 'TKT-' || floor(random()*9000000+1000000)::text,
    registered_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    cancelled_at     TIMESTAMPTZ,
    attended_at      TIMESTAMPTZ,
    notes            TEXT         DEFAULT '',
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_event UNIQUE (user_id, event_id)
);

-- Indexes on tbl_registrations
CREATE INDEX idx_reg_user     ON tbl_registrations(user_id);
CREATE INDEX idx_reg_event    ON tbl_registrations(event_id);
CREATE INDEX idx_reg_status   ON tbl_registrations(status);
CREATE INDEX idx_reg_date     ON tbl_registrations(registered_at);

COMMENT ON TABLE  tbl_registrations                IS 'User registrations for events';
COMMENT ON COLUMN tbl_registrations.registration_id IS 'Primary key — auto increment';
COMMENT ON COLUMN tbl_registrations.user_id         IS 'FK → tbl_users(user_id)';
COMMENT ON COLUMN tbl_registrations.event_id        IS 'FK → tbl_events(event_id)';
COMMENT ON COLUMN tbl_registrations.ticket_code     IS 'Unique ticket identifier';
COMMENT ON COLUMN tbl_registrations.status          IS 'active | cancelled | attended | waitlisted';

-- ================================================================
-- TABLE 5: tbl_admin_logs
-- Audit trail for all admin actions
-- ================================================================
CREATE TABLE tbl_admin_logs (
    log_id        SERIAL          PRIMARY KEY,
    admin_id      INTEGER         NOT NULL REFERENCES tbl_users(user_id) ON DELETE CASCADE,
    action        VARCHAR(100)    NOT NULL,
    target_table  VARCHAR(100)    NOT NULL,
    target_id     INTEGER,
    description   TEXT            DEFAULT '',
    ip_address    VARCHAR(50)     DEFAULT '',
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin  ON tbl_admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON tbl_admin_logs(action);
CREATE INDEX idx_admin_logs_date   ON tbl_admin_logs(created_at);

COMMENT ON TABLE tbl_admin_logs IS 'Audit log for all admin panel actions';

-- ================================================================
-- VERIFY SCHEMA
-- ================================================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c 
     WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
