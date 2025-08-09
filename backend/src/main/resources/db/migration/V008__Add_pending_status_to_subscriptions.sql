-- Add PENDING status to subscriptions table
ALTER TABLE subscriptions 
MODIFY COLUMN status ENUM('pending', 'active', 'cancelled', 'expired', 'past_due') DEFAULT 'pending';