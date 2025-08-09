# Subscription Renewal Implementation with PayOS

## Overview

The subscription renewal system automatically handles subscription renewals using PayOS payment processing. It supports both manual renewal triggering and automatic renewal via webhooks.

## Components

### 1. Core Renewal Logic
- **SubscriptionServiceImpl.renewSubscription()**: Main renewal method with PayOS integration
- **PayOS Integration**: Handles payment link creation and processing
- **Webhook Support**: Automatic confirmation via PayOS webhooks

### 2. PayOS Integration Features
- **Payment Link Creation**: Generates renewal payment links
- **Order Code Tracking**: Links payments to subscriptions
- **Webhook Processing**: Automatic renewal confirmation
- **Error Handling**: Graceful handling of payment failures

## Key Methods

### renewSubscription(Long subscriptionId)
```java
// Main renewal method
public void renewSubscription(Long subscriptionId) {
    // 1. Validate subscription and auto-renew status
    // 2. Create PayOS payment link
    // 3. Track payment and update subscription
    // 4. Send notifications
}
```

### processRenewalPayment(Subscription subscription, User user)
```java
// PayOS payment processing
private boolean processRenewalPayment(Subscription subscription, User user) {
    // 1. Generate unique order code
    // 2. Create PayOS payment link
    // 3. Update external subscription ID
    // 4. Return payment status
}
```

## API Endpoints

### Manual Renewal
```
POST /api/subscriptions/{subscriptionId}/renew
```
Manually trigger subscription renewal for testing or admin purposes.

### Webhook Endpoints
```
POST /api/payos/webhook/subscription-renewal
POST /api/payos/webhook/subscription-payment
```
Handle PayOS webhook notifications for automatic renewal confirmation.

## Usage Examples

### 1. Manual Renewal Trigger
```bash
curl -X POST http://localhost:8080/api/subscriptions/123/renew \
  -H "Content-Type: application/json"
```

### 2. Check Renewal Status
```bash
curl -X GET http://localhost:8080/api/subscriptions/123
```

### 3. Webhook Processing
PayOS will automatically call webhooks when payments are completed.

## PayOS Integration Details

### 1. Payment Link Creation
```java
vn.payos.type.CheckoutResponseData paymentResponse = payOSPaymentService.createPaymentLink(
    orderCode, subscription.getPrice(), description, user.getEmail(), user.getUsername());
```

### 2. Order Code Generation
```java
Long orderCode = System.currentTimeMillis() / 1000;
String description = "Renewal for " + subscription.getTier() + " subscription - " + subscription.getBillingCycle();
```

### 3. External ID Tracking
```java
subscription.setExternalSubscriptionId(paymentResponse.getPaymentLinkId());
```

## Renewal Flow

### Automatic Renewal Process:
1. **Trigger**: Scheduled job or manual trigger
2. **Validation**: Check auto-renew status and subscription validity
3. **Payment**: Create PayOS payment link
4. **Tracking**: Store external payment ID
5. **Notification**: Log payment link creation
6. **Webhook**: PayOS calls webhook on payment completion
7. **Confirmation**: Update subscription dates and status
8. **Email**: Send renewal confirmation

### Manual Renewal Process:
1. **API Call**: POST to `/api/subscriptions/{id}/renew`
2. **Processing**: Same as automatic renewal
3. **Response**: JSON with success/failure status

## Configuration

### PayOS Settings
Ensure PayOS service is properly configured with:
- API credentials
- Webhook URLs
- Payment processing settings

### Webhook URLs
Configure these URLs in PayOS dashboard:
- `https://your-domain.com/api/payos/webhook/subscription-renewal`
- `https://your-domain.com/api/payos/webhook/subscription-payment`

## Error Handling

### Payment Failures
- **Failed Payment**: Subscription marked as `PAST_DUE`
- **Invalid Subscription**: Exception thrown with clear message
- **PayOS Errors**: Logged and returned as false

### Webhook Errors
- **Invalid Signature**: Returns 400 Bad Request
- **Missing Subscription**: Returns 400 Bad Request
- **Processing Errors**: Returns 500 Internal Server Error

## Status Management

### Subscription Statuses:
- **ACTIVE**: Subscription is active and valid
- **PAST_DUE**: Payment failed, subscription at risk
- **EXPIRED**: Subscription has expired
- **CANCELLED**: User cancelled subscription

### Auto-Renew Logic:
- **Enabled**: Creates payment link and processes renewal
- **Disabled**: Automatically expires the subscription

## Database Updates

### Subscription Extension:
```java
// Extend subscription dates
subscription.setStartDate(LocalDateTime.now());
subscription.setEndDate(calculateEndDate(subscription.getBillingCycle()));
subscription.setNextBillingDate(calculateNextBillingDate(subscription.getBillingCycle()));
subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
```

### History Tracking:
```java
// Record renewal in history
recordSubscriptionHistory(subscription.getUserId(), subscriptionId, "RENEWED",
    subscription.getTier().name(), subscription.getTier().name(), subscription.getPrice());
```

## Testing

### 1. Test Manual Renewal
```bash
# Test renewal endpoint
curl -X POST http://localhost:8080/api/subscriptions/1/renew

# Expected response:
{
  "success": true,
  "message": "Subscription renewed successfully",
  "subscriptionId": 1
}
```

### 2. Test Webhook Processing
```bash
# Simulate PayOS webhook
curl -X POST http://localhost:8080/api/payos/webhook/subscription-renewal \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "orderCode": "1234567890",
      "status": "PAID"
    }
  }'
```

### 3. Test Error Cases
- Invalid subscription ID
- Disabled auto-renew
- PayOS service unavailable

## Monitoring

### Log Messages to Monitor:
- `"Renewing subscription: {}"`
- `"PayOS renewal payment link created"`
- `"Successfully renewed subscription"`
- `"Payment failed for subscription renewal"`

### Key Metrics:
- Renewal success rate
- Payment processing time
- Webhook response time
- Failed renewals count

## Security Considerations

### Webhook Validation:
- Implement proper signature verification
- Validate webhook source
- Rate limiting on webhook endpoints

### Payment Security:
- Secure PayOS credential storage
- HTTPS for all payment communications
- Audit logging for all payment activities

## Future Enhancements

1. **Retry Logic**: Automatic retry for failed payments
2. **Grace Periods**: Allow temporary access during payment issues
3. **Notification System**: Email/SMS alerts for renewal events
4. **Analytics**: Detailed renewal analytics and reporting
5. **Multi-Payment**: Support for multiple payment providers

## Troubleshooting

### Common Issues:
1. **"PayOS service unavailable"**: Check PayOS configuration
2. **"Subscription not found"**: Verify subscription ID exists
3. **"Auto-renew disabled"**: Check subscription settings
4. **"Webhook signature invalid"**: Verify webhook configuration

### Debug Steps:
1. Check application logs for errors
2. Verify PayOS service status
3. Test webhook endpoints manually
4. Validate subscription data in database

## Production Deployment

### Required Environment Variables:
```bash
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
PAYOS_WEBHOOK_URL=https://your-domain.com/api/payos/webhook
```

### Database Migrations:
Ensure subscription tables have:
- `external_subscription_id` column
- `auto_renew` column
- `next_billing_date` column

### Monitoring Setup:
- Set up alerts for failed renewals
- Monitor webhook endpoint health
- Track renewal success rates
- Log payment processing metrics 

## Test Scenarios

### **Subscription Renewal Scenarios:**
1. Happy Path:
   - Active subscription with auto-renew enabled
   - PayOS payment link creation succeeds
   - Webhook confirms payment
   - Subscription extended correctly

2. Auto-Renew Disabled:
   - Subscription should expire instead of renew
   - User downgraded to FREE tier

3. Payment Failures:
   - PayOS service unavailable
   - Payment declined
   - Webhook indicates failed payment
   - Subscription marked as PAST_DUE

4. Edge Cases:
   - Invalid subscription ID
   - Subscription already expired
   - Missing user data
   - Concurrent renewal attempts

### **Usage Tracking Scenarios:**
1. Limit Enforcement:
   - User at daily limit cannot generate
   - User at monthly limit cannot generate
   - Unlimited subscription allows generation

2. Usage Calculation:
   - Daily usage count accuracy
   - Monthly usage count accuracy
   - Cross-month boundary handling

3. Image Generation:
   - Successful generation with tracking
   - Generation blocked by limits
   - Error handling during tracking

4. Scheduled Tasks:
   - Daily reset at midnight
   - Monthly reset on 1st day
   - Cleanup of old records