-- ================================================================
-- EVENT APPROVAL SYSTEM
-- Add approval workflow for organizer-created events
-- ================================================================

-- Add approval fields to tbl_events
ALTER TABLE tbl_events ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE tbl_events ADD COLUMN IF NOT EXISTS approved_by INTEGER DEFAULT NULL;
ALTER TABLE tbl_events ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE tbl_events ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT NULL;

-- Add foreign key for approved_by (references admin user_id)
ALTER TABLE tbl_events 
ADD CONSTRAINT fk_approved_by 
FOREIGN KEY (approved_by) REFERENCES tbl_users(user_id) ON DELETE SET NULL;

-- Create index for faster queries on approval status
CREATE INDEX IF NOT EXISTS idx_events_approval_status ON tbl_events(approval_status);

-- Set existing events to approved (they were created before approval system)
UPDATE tbl_events SET approval_status = 'approved' WHERE approval_status = 'pending';

COMMENT ON COLUMN tbl_events.approval_status IS 'Approval status: pending, approved, rejected';
COMMENT ON COLUMN tbl_events.approved_by IS 'User ID of admin who approved/rejected the event';
COMMENT ON COLUMN tbl_events.approved_at IS 'Timestamp when event was approved/rejected';
COMMENT ON COLUMN tbl_events.rejection_reason IS 'Reason for rejection (if rejected)';

SELECT '✅ Event approval system schema updated successfully!' AS status;
