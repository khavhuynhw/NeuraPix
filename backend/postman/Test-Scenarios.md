# 🧪 Test Scenarios - Subscription Payment Flow

## 📋 Test Case Matrix

| Test ID | Scenario | Input | Expected Output | Status |
|---------|----------|-------|-----------------|---------|
| TC001 | User Registration | Valid user data | User created with FREE tier | ✅ |
| TC002 | User Login | Valid credentials | JWT token returned | ✅ |
| TC003 | Create Subscription | Valid subscription data | Subscription PENDING status | ✅ |
| TC004 | Verify Subscription Pending | Get subscription by ID | Status = PENDING | ✅ |
| TC005 | Verify User Tier Unchanged | Get user profile | Tier = FREE | ✅ |
| TC006 | Payment Success Webhook | Mock PayOS SUCCESS webhook | Webhook processed | ✅ |
| TC007 | Subscription Activated | Get subscription after payment | Status = ACTIVE | ✅ |
| TC008 | User Tier Upgraded | Get user after payment | Tier = BASIC/PREMIUM | ✅ |
| TC009 | Duplicate Subscription | Create second subscription | Error 400/409 | ⚠️ |
| TC010 | Payment Failed Webhook | Mock PayOS FAILED webhook | Subscription CANCELLED | ❌ |

## 📝 Detailed Test Scenarios

### 🟢 TC001: User Registration
**Objective**: Verify new user can be registered successfully

**Pre-conditions**: None

**Test Steps**:
1. Send POST to `/api/v1/auth/register` with valid user data
2. Verify response status 200
3. Verify user can login afterwards

**Expected Results**:
- Response: HTTP 200
- User created in database
- User has default FREE subscription tier

---

### 🟢 TC002: User Login  
**Objective**: Verify registered user can login and receive JWT token

**Pre-conditions**: User must be registered (TC001)

**Test Steps**:
1. Send POST to `/api/v1/auth/login` with valid credentials
2. Extract JWT token from response
3. Verify token is valid

**Expected Results**:
- Response: HTTP 200
- Response contains valid JWT token
- Token can be used for subsequent authenticated requests

---

### 🟢 TC003: Create Subscription
**Objective**: Verify subscription is created with PENDING status

**Pre-conditions**: 
- User logged in (TC002)
- Valid subscription plan exists

**Test Steps**:
1. Send POST to `/api/v1/subscriptions` with valid data
2. Verify response contains subscription ID
3. Verify subscription status is PENDING

**Expected Results**:
- Response: HTTP 200
- Subscription created with status PENDING
- PayOS payment link created
- User tier NOT upgraded yet

---

### 🟢 TC004: Verify Subscription Pending
**Objective**: Confirm subscription remains PENDING before payment

**Pre-conditions**: Subscription created (TC003)

**Test Steps**:
1. Send GET to `/api/v1/subscriptions/{id}`
2. Verify status is PENDING
3. Verify all subscription details

**Expected Results**:
- Response: HTTP 200
- Subscription status = PENDING
- All subscription details correct

---

### 🟢 TC005: Verify User Tier Unchanged
**Objective**: Confirm user tier remains FREE before payment

**Pre-conditions**: Subscription created (TC003)

**Test Steps**:
1. Send GET to `/api/v1/users/{id}`
2. Verify subscriptionTier is still FREE

**Expected Results**:
- Response: HTTP 200
- User subscriptionTier = FREE
- User can't access premium features

---

### 🟢 TC006: Payment Success Webhook
**Objective**: Simulate successful PayOS payment notification

**Pre-conditions**: Subscription in PENDING status (TC003)

**Test Steps**:
1. Send POST to `/api/payos/webhook/subscription-payment`
2. Include webhook data with status "PAID"
3. Verify webhook processed successfully

**Expected Results**:
- Response: HTTP 200
- Response message: "Payment confirmed"
- No errors in processing

---

### 🟢 TC007: Subscription Activated
**Objective**: Verify subscription becomes ACTIVE after successful payment

**Pre-conditions**: Payment success webhook sent (TC006)

**Test Steps**:
1. Send GET to `/api/v1/subscriptions/{id}`
2. Verify status changed to ACTIVE
3. Verify activation timestamp updated

**Expected Results**:
- Response: HTTP 200
- Subscription status = ACTIVE
- updatedAt timestamp reflects activation time

---

### 🟢 TC008: User Tier Upgraded
**Objective**: Verify user tier upgraded after successful payment

**Pre-conditions**: Subscription activated (TC007)

**Test Steps**:
1. Send GET to `/api/v1/users/{id}`
2. Verify subscriptionTier matches subscription tier
3. Test access to premium features

**Expected Results**:
- Response: HTTP 200
- User subscriptionTier = subscription tier (BASIC/PREMIUM)
- User can access premium features

---

### ⚠️ TC009: Duplicate Subscription
**Objective**: Verify system prevents multiple active subscriptions

**Pre-conditions**: User has active subscription (TC008)

**Test Steps**:
1. Try to create another subscription for same user
2. Verify request is rejected

**Expected Results**:
- Response: HTTP 400 or 409
- Error message about existing active subscription
- No duplicate subscription created

---

### ❌ TC010: Payment Failed Webhook  
**Objective**: Verify handling of failed payment notifications

**Pre-conditions**: Subscription in PENDING status

**Test Steps**:
1. Send POST to `/api/payos/webhook/subscription-payment`
2. Include webhook data with status "CANCELLED"
3. Verify subscription is cancelled

**Expected Results**:
- Response: HTTP 200
- Subscription status = CANCELLED
- User tier remains FREE

## 🔄 Test Execution Order

### Happy Path Flow:
1. TC001 → TC002 → TC003 → TC004 → TC005 → TC006 → TC007 → TC008

### Error Scenarios:
1. TC009 (after TC008)
2. TC010 (with new subscription)

## 📊 Success Criteria

### Overall Success Rate: 90%+
- All critical path tests (TC001-TC008) must pass
- At least 1 error scenario test must pass
- No data corruption or inconsistencies

### Performance Criteria:
- Each API call < 2 seconds response time
- Webhook processing < 1 second
- No memory leaks during test execution

## 🚨 Critical Validations

### Security Validations:
- ✅ JWT token required for protected endpoints
- ✅ User can only access own subscriptions
- ✅ Webhook signature validation (if implemented)

### Business Logic Validations:
- ✅ User cannot access premium features without payment
- ✅ Subscription tier matches user tier after activation
- ✅ No subscription activation without payment confirmation

### Data Integrity Validations:
- ✅ Subscription history recorded correctly
- ✅ User tier updated atomically with subscription
- ✅ Payment records linked to subscriptions

## 📈 Test Reports

### Execution Summary Template:
```
Test Execution Date: [DATE]
Environment: [LOCAL/DEV/STAGING]
Total Test Cases: 10
Passed: X
Failed: Y
Skipped: Z
Success Rate: X%

Critical Issues Found:
- [List any critical failures]

Recommendations:
- [List improvements needed]
```

### Test Evidence:
- Screenshots of Postman results
- Server logs during test execution
- Database state before/after tests
- Performance metrics