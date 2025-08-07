-- Migration V007: Remove unused fields from transactions table
-- Author: NeuraPix Development Team
-- Date: 2024-01-01

-- Remove columns that are no longer needed
ALTER TABLE transactions DROP COLUMN IF EXISTS external_transaction_id;
ALTER TABLE transactions DROP COLUMN IF EXISTS checkout_url;
ALTER TABLE transactions DROP COLUMN IF EXISTS qr_code;
ALTER TABLE transactions DROP COLUMN IF EXISTS buyer_name;
ALTER TABLE transactions DROP COLUMN IF EXISTS bank_code;
ALTER TABLE transactions DROP COLUMN IF EXISTS account_number;
ALTER TABLE transactions DROP COLUMN IF EXISTS reference_code;
ALTER TABLE transactions DROP COLUMN IF EXISTS transaction_date_time;
ALTER TABLE transactions DROP COLUMN IF EXISTS paid_at;
ALTER TABLE transactions DROP COLUMN IF EXISTS cancelled_at;
ALTER TABLE transactions DROP COLUMN IF EXISTS cancellation_reason;
ALTER TABLE transactions DROP COLUMN IF EXISTS webhook_data;
ALTER TABLE transactions DROP COLUMN IF EXISTS failure_reason;
ALTER TABLE transactions DROP COLUMN IF EXISTS notes;