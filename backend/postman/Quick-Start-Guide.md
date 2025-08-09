# 🚀 Quick Start Guide - Subscription Payment Flow Testing

## ⚡ 5-Minute Setup

### 1. Prerequisites
- ✅ Postman installed
- ✅ NeuraPix backend running on `http://localhost:8080`
- ✅ Database connected and migrated
- ✅ PayOS webhook endpoints accessible

### 2. Import Files
```bash
# Download collection files
1. Download NeuraPix-Subscription-Payment-Flow.postman_collection.json
2. Download NeuraPix-Environment.postman_environment.json

# Import to Postman
1. Open Postman
2. Click Import → Upload Files
3. Select both downloaded files
4. Click Import
```

### 3. Set Environment
```bash
1. Click Environment dropdown (top right)
2. Select "NeuraPix Environment"
3. Verify base_url = http://localhost:8080
```

### 4. Run Complete Test
```bash
1. Click on "NeuraPix - Subscription Payment Flow" collection
2. Click "Run" button
3. Select all folders/requests
4. Click "Run NeuraPix - Subscription Payment Flow"
5. Watch magic happen! ✨
```

## 🎯 What You'll See

### ✅ Successful Flow:
```
📋 Setup & Authentication
├── ✅ 1. Register New User (200 OK)
├── ✅ 2. Login User (200 OK) 
└── ✅ 3. Get User Profile (200 OK) - tier: FREE

📦 Subscription Plans  
└── ✅ 1. Get All Active Plans (200 OK)

💳 Subscription Creation & Payment
├── ✅ 1. Create Subscription (200 OK) - status: PENDING
├── ✅ 2. Verify Subscription Status (200 OK) - status: PENDING
└── ✅ 3. Verify User Still FREE Tier (200 OK) - tier: FREE

✅ Payment Success Flow
├── ✅ 1. Mock PayOS Webhook - Payment SUCCESS (200 OK)
├── ✅ 2. Verify Subscription ACTIVE (200 OK) - status: ACTIVE
├── ✅ 3. Verify User Tier Upgraded (200 OK) - tier: BASIC/PREMIUM
└── ✅ 4. Get User's Active Subscription (200 OK)

❌ Payment Failed Flow
├── ⚠️ 1. Create Another Subscription (400/409) - Expected failure
└── ✅ 2. Mock PayOS Webhook - Payment FAILED (200 OK)

📊 Verification & Status Check
├── ✅ 1. Get All Subscriptions - ACTIVE (200 OK)
├── ✅ 2. Get All Subscriptions - PENDING (200 OK)
└── ✅ 3. Get All Subscriptions - CANCELLED (200 OK)
```

## 🔍 Key Checkpoints

### 🎯 Critical Success Indicators:

1. **User starts with FREE tier** ✅
   ```json
   GET /api/v1/users/{id}
   Response: { "subscriptionTier": "FREE" }
   ```

2. **Subscription created as PENDING** ✅
   ```json
   POST /api/v1/subscriptions
   Response: { "status": "PENDING" }
   ```

3. **User tier unchanged before payment** ✅
   ```json
   GET /api/v1/users/{id}  
   Response: { "subscriptionTier": "FREE" }
   ```

4. **Subscription activated after payment** ✅
   ```json
   Webhook: { "status": "PAID" }
   GET /api/v1/subscriptions/{id}
   Response: { "status": "ACTIVE" }
   ```

5. **User tier upgraded after payment** ✅
   ```json
   GET /api/v1/users/{id}
   Response: { "subscriptionTier": "BASIC" }
   ```

## 🐛 Troubleshooting

### ❌ Common Issues & Solutions:

#### Issue: "Connection refused"
**Solution**: 
```bash
# Check if backend is running
curl http://localhost:8080/actuator/health
# Expected: {"status":"UP"}
```

#### Issue: "401 Unauthorized"  
**Solution**: 
```bash
# Re-run login request to get fresh JWT token
# Check if token is correctly set in environment variables
```

#### Issue: "User already has active subscription"
**Solution**:
```bash
# This is expected behavior! ✅
# Our fix is working - users can't create duplicate subscriptions
```

#### Issue: "Subscription not found" in webhook
**Solution**:
```bash
# Check if external_subscription_id is set correctly
# Verify webhook payload matches subscription data
```

## 📱 Mobile/Manual Testing

### If you prefer manual step-by-step:

1. **Register User**:
   ```bash
   POST http://localhost:8080/api/v1/auth/register
   Body: { "username": "testuser", "email": "test@example.com", "password": "password123" }
   ```

2. **Login & Get Token**:
   ```bash
   POST http://localhost:8080/api/v1/auth/login  
   Body: { "email": "test@example.com", "password": "password123" }
   Save: token from response
   ```

3. **Create Subscription**:
   ```bash
   POST http://localhost:8080/api/v1/subscriptions
   Headers: { "Authorization": "Bearer {token}" }
   Body: { "userId": 1, "tier": "BASIC", "billingCycle": "MONTHLY", "paymentProvider": "payos" }
   ```

4. **Simulate Payment Success**:
   ```bash
   POST http://localhost:8080/api/payos/webhook/subscription-payment
   Body: { "data": { "status": "PAID", "orderCode": 123456 } }
   ```

## ⏱️ Expected Timing

| Step | Expected Time |
|------|---------------|
| Full collection run | 30-60 seconds |
| Setup & Auth | 5-10 seconds |
| Subscription flow | 10-15 seconds |
| Payment simulation | 5-10 seconds |
| Verification | 10-15 seconds |

## 🎉 Success Confirmation

### You'll know it's working when:
- ✅ All green checkmarks in Postman test results
- ✅ User starts FREE → ends with upgraded tier  
- ✅ Subscription starts PENDING → ends ACTIVE
- ✅ No 500 errors or crashes
- ✅ Server logs show payment processing

### 🏆 Victory Screenshot:
Take a screenshot of Postman with all tests green and share with the team! 📸

## 🔄 Reset for Re-testing

### To run tests again:
1. **Option A**: Use different email (automatic in collection)
2. **Option B**: Reset database
3. **Option C**: Delete test user and run again

### Database Reset (if needed):
```sql
-- Reset test data
DELETE FROM user_subscription_history WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test.user.%@example.com');
DELETE FROM subscriptions WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test.user.%@example.com');  
DELETE FROM users WHERE email LIKE 'test.user.%@example.com';
```

## 📞 Support

### Need Help?
- 🐛 **Bug Reports**: Check server logs first
- ❓ **Questions**: Review README.md and Test-Scenarios.md  
- 💡 **Improvements**: Submit PR with enhanced test cases
- 🚨 **Critical Issues**: Contact dev team immediately

Happy Testing! 🚀🎯✨