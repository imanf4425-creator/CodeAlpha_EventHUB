-- ================================================================
-- PAYMENT SYSTEM & TICKET VERIFICATION
-- Add payment fields to existing tables
-- ================================================================

-- Add payment method fields to tbl_events
ALTER TABLE tbl_events ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'bank_transfer';
ALTER TABLE tbl_events ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT '{}';
-- payment_details will store: { bank_name, account_number, account_title, mobile_wallet, wallet_number }

-- Add payment proof and verification fields to tbl_registrations
ALTER TABLE tbl_registrations ADD COLUMN IF NOT EXISTS payment_proof_url VARCHAR(500) DEFAULT NULL;
ALTER TABLE tbl_registrations ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE tbl_registrations ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE tbl_registrations ADD COLUMN IF NOT EXISTS verified_by INTEGER DEFAULT NULL;
ALTER TABLE tbl_registrations ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT NULL;

-- Add foreign key for verified_by (references organizer user_id)
ALTER TABLE tbl_registrations 
ADD CONSTRAINT fk_verified_by 
FOREIGN KEY (verified_by) REFERENCES tbl_users(user_id) ON DELETE SET NULL;

-- Create notifications table for organizer alerts
CREATE TABLE IF NOT EXISTS tbl_notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES tbl_users(user_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,  -- 'new_registration', 'payment_verified', 'ticket_purchased'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50),  -- 'registration', 'event'
    related_entity_id INTEGER,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON tbl_notifications(user_id, is_read);

-- Sample update for existing events to add payment details
UPDATE tbl_events 
SET payment_details = jsonb_build_object(
    'bank_name', 'Meezan Bank',
    'account_number', '01234567890123',
    'account_title', 'Sarah Ahmed',
    'mobile_wallet', 'JazzCash',
    'wallet_number', '03001234567'
)
WHERE organizer_id = 2 AND payment_details = '{}';

UPDATE tbl_events 
SET payment_details = jsonb_build_object(
    'bank_name', 'HBL',
    'account_number', '98765432109876',
    'account_title', 'Omar Khan',
    'mobile_wallet', 'Easypaisa',
    'wallet_number', '03219876543'
)
WHERE organizer_id = 3 AND payment_details = '{}';

COMMENT ON COLUMN tbl_events.payment_method IS 'Payment method: bank_transfer, mobile_wallet, both';
COMMENT ON COLUMN tbl_events.payment_details IS 'JSON containing bank/wallet details';
COMMENT ON COLUMN tbl_registrations.payment_proof_url IS 'URL to uploaded payment screenshot';
COMMENT ON COLUMN tbl_registrations.is_verified IS 'Whether organizer verified the payment';
COMMENT ON COLUMN tbl_registrations.verified_at IS 'Timestamp when payment was verified';
COMMENT ON COLUMN tbl_registrations.verified_by IS 'User ID of organizer who verified';

SELECT '✅ Payment system schema updated successfully!' AS status;
