-- Migration V006: Create transactions table for PayOS payment tracking
-- Author: NeuraPix Development Team
-- Date: 2024-01-01

CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_code BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    subscription_id BIGINT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    status ENUM('PENDING', 'PAID', 'CANCELLED', 'FAILED', 'EXPIRED', 'REFUNDED', 'PROCESSING') NOT NULL DEFAULT 'PENDING',
    type ENUM('SUBSCRIPTION_PAYMENT', 'SUBSCRIPTION_RENEWAL', 'SUBSCRIPTION_UPGRADE', 'SUBSCRIPTION_DOWNGRADE', 'ONE_TIME_PAYMENT', 'REFUND') NOT NULL,
    payment_provider VARCHAR(50) NOT NULL DEFAULT 'PAYOS',
    external_transaction_id VARCHAR(255) NULL,
    checkout_url VARCHAR(1000) NULL,
    qr_code TEXT NULL,
    description VARCHAR(500) NULL,
    buyer_name VARCHAR(100) NULL,
    buyer_email VARCHAR(100) NULL,
    payment_method VARCHAR(50) NULL,
    bank_code VARCHAR(20) NULL,
    account_number VARCHAR(50) NULL,
    reference_code VARCHAR(100) NULL,
    transaction_date_time DATETIME NULL,
    paid_at DATETIME NULL,
    cancelled_at DATETIME NULL,
    cancellation_reason VARCHAR(500) NULL,
    webhook_data TEXT NULL,
    failure_reason VARCHAR(500) NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_order_code (order_code),
    INDEX idx_user_id (user_id),
    INDEX idx_subscription_id (subscription_id),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_payment_provider (payment_provider),
    INDEX idx_created_at (created_at),
    INDEX idx_paid_at (paid_at),
    INDEX idx_user_status (user_id, status),
    INDEX idx_user_type (user_id, type),
    INDEX idx_subscription_status (subscription_id, status),
    
    -- Foreign key constraints
    CONSTRAINT fk_transactions_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
        
    CONSTRAINT fk_transactions_subscription_id 
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
        
    -- Check constraints
    CONSTRAINT chk_amount_positive CHECK (amount >= 0),
    CONSTRAINT chk_currency_format CHECK (currency REGEXP '^[A-Z]{3}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comments for documentation
ALTER TABLE transactions COMMENT = 'Table for storing payment transaction records from PayOS and other payment providers';

-- Add column comments
ALTER TABLE transactions 
    MODIFY order_code BIGINT NOT NULL UNIQUE COMMENT 'Unique order code from payment provider',
    MODIFY user_id BIGINT NOT NULL COMMENT 'User who initiated the transaction',
    MODIFY subscription_id BIGINT NULL COMMENT 'Related subscription if applicable',
    MODIFY amount DECIMAL(10,2) NOT NULL COMMENT 'Transaction amount',
    MODIFY currency VARCHAR(3) NOT NULL DEFAULT 'VND' COMMENT 'Currency code (ISO 4217)',
    MODIFY status ENUM('PENDING', 'PAID', 'CANCELLED', 'FAILED', 'EXPIRED', 'REFUNDED', 'PROCESSING') NOT NULL DEFAULT 'PENDING' COMMENT 'Transaction status',
    MODIFY type ENUM('SUBSCRIPTION_PAYMENT', 'SUBSCRIPTION_RENEWAL', 'SUBSCRIPTION_UPGRADE', 'SUBSCRIPTION_DOWNGRADE', 'ONE_TIME_PAYMENT', 'REFUND') NOT NULL COMMENT 'Type of transaction',
    MODIFY payment_provider VARCHAR(50) NOT NULL DEFAULT 'PAYOS' COMMENT 'Payment provider name',
    MODIFY external_transaction_id VARCHAR(255) NULL COMMENT 'Transaction ID from external payment provider',
    MODIFY checkout_url VARCHAR(1000) NULL COMMENT 'Payment checkout URL',
    MODIFY qr_code TEXT NULL COMMENT 'QR code for payment',
    MODIFY description VARCHAR(500) NULL COMMENT 'Transaction description',
    MODIFY buyer_name VARCHAR(100) NULL COMMENT 'Name of the buyer',
    MODIFY buyer_email VARCHAR(100) NULL COMMENT 'Email of the buyer',
    MODIFY payment_method VARCHAR(50) NULL COMMENT 'Payment method used',
    MODIFY bank_code VARCHAR(20) NULL COMMENT 'Bank code if applicable',
    MODIFY account_number VARCHAR(50) NULL COMMENT 'Account number if applicable',
    MODIFY reference_code VARCHAR(100) NULL COMMENT 'Reference code from payment provider',
    MODIFY transaction_date_time DATETIME NULL COMMENT 'Date and time when transaction was processed',
    MODIFY paid_at DATETIME NULL COMMENT 'Timestamp when payment was completed',
    MODIFY cancelled_at DATETIME NULL COMMENT 'Timestamp when transaction was cancelled',
    MODIFY cancellation_reason VARCHAR(500) NULL COMMENT 'Reason for cancellation',
    MODIFY webhook_data TEXT NULL COMMENT 'Raw webhook data from payment provider',
    MODIFY failure_reason VARCHAR(500) NULL COMMENT 'Reason for transaction failure',
    MODIFY notes TEXT NULL COMMENT 'Additional notes or metadata',
    MODIFY created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    MODIFY updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp';

-- Insert some initial data for testing (optional)
-- INSERT INTO transactions (order_code, user_id, amount, type, description, buyer_name, buyer_email) 
-- VALUES 
--     (1640995200, 1, 50000.00, 'SUBSCRIPTION_PAYMENT', 'NeuraPix Basic Subscription', 'Test User', 'test@example.com'),
--     (1640995201, 1, 100000.00, 'SUBSCRIPTION_UPGRADE', 'NeuraPix Pro Subscription', 'Test User', 'test@example.com');