# 🧪 Hướng Dẫn Test Flow Thanh Toán PayOS

## 📋 Tổng Quan

Hướng dẫn step-by-step để test complete payment flow từ frontend đến backend với PayOS integration.

---

## 🚀 Setup Environment

### **1. Backend Setup**

#### **Cấu hình PayOS Credentials**
```bash
# Tạo file .env trong backend directory
cd D:\NeuraPix\backend

# Thêm vào .env:
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key  
PAYOS_CHECKSUM_KEY=your_payos_checksum_key
```

#### **Start Backend**
```bash
# Trong backend directory
./mvnw spring-boot:run

# Hoặc nếu đã build:
java -jar target/neuralpix-backend.jar
```

#### **Verify Backend Endpoints**
```bash
# Test subscription plans endpoint
curl http://localhost:8080/api/v1/plans/active

# Test payment endpoint
curl -X POST http://localhost:8080/api/v2/payments/payos/create-payment-link \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": 1,
    "productName": "Test Product",
    "price": 100000,
    "buyerEmail": "test@example.com"
  }'
```

### **2. Frontend Setup**

#### **Cấu hình Environment**
```bash
# Tạo .env trong frontend directory
cd D:\NeuraPix\frontend

# Thêm vào .env:
VITE_API_BASE_URL=http://localhost:8080
```

#### **Install Dependencies & Start**
```bash
npm install
npm run dev
```

#### **Verify Frontend Access**
- Frontend: http://localhost:5173
- Login với user account
- Navigate đến pricing page

---

## 🔧 PayOS Test Configuration

### **1. PayOS Sandbox Setup**

#### **Đăng ký PayOS Sandbox**
1. Truy cập: https://payos.vn/
2. Đăng ký tài khoản developer
3. Tạo application trong sandbox
4. Lấy credentials: Client ID, API Key, Checksum Key

#### **Webhook Configuration**
```bash
# PayOS Webhook URL (cho local testing)
# Sử dụng ngrok để expose local backend
ngrok http 8080

# Webhook URL sẽ là:
https://your-ngrok-url.ngrok.io/api/v2/payments/payos/webhook
```

### **2. Database Preparation**

#### **Tạo Test Data**
```sql
-- Tạo test subscription plans
INSERT INTO subscription_plans (name, description, tier, monthly_price, yearly_price, daily_generation_limit, monthly_generation_limit, is_active, sort_order, created_at, updated_at) VALUES
('Basic Plan', 'Perfect for individuals', 'BASIC', 99000, 990000, 50, 1500, 'TRUE', 1, NOW(), NOW()),
('Premium Plan', 'Best for professionals', 'PREMIUM', 299000, 2990000, 0, 0, 'TRUE', 2, NOW(), NOW());

-- Tạo test user (nếu chưa có)
INSERT INTO users (username, email, password, subscription_tier, created_at, updated_at) VALUES
('testuser', 'test@example.com', '$2a$10$encoded_password', 'FREE', NOW(), NOW());
```

---

## 🧪 Test Scenarios

### **Test Case 1: Successful Payment Flow**

#### **Step 1: Navigate to Subscription Plans**
```bash
# Truy cập frontend
http://localhost:5173/pricing

# Verify:
✅ Subscription plans load từ backend
✅ Pricing hiển thị đúng (VND format)
✅ Monthly/Yearly toggle hoạt động
✅ User authentication status
```

#### **Step 2: Select Plan**
```bash
# Actions:
1. Login vào system
2. Select "Basic" plan
3. Choose "Monthly" billing
4. Click "Choose Basic"

# Verify:
✅ Loading state appears
✅ No JavaScript errors in console
✅ API calls successful in Network tab
```

#### **Step 3: Payment Link Creation**
```bash
# Monitor Network Tab:
POST /api/v2/payments/payos/create-payment-link
{
  "userId": 1,
  "productName": "Basic Plan - Monthly Subscription",
  "price": 99000,
  "buyerEmail": "test@example.com",
  "subscriptionId": 123
}

# Expected Response:
{
  "success": true,
  "data": {
    "orderCode": 1698765432,
    "paymentLinkId": "pl_xxx",
    "checkoutUrl": "https://pay.payos.vn/web/xxx",
    "qrCode": "https://img.payos.vn/qr/xxx"
  },
  "orderCode": 1698765432
}

# Verify:
✅ Subscription created with PENDING status
✅ Transaction record created
✅ Redirect to PayOS checkout
```

#### **Step 4: PayOS Payment**
```bash
# PayOS Sandbox Payment:
1. Complete payment form
2. Use test card: 9704 0000 0000 0018
3. CVV: 123, Expiry: any future date
4. OTP: 123456

# Expected Behavior:
✅ Payment processes successfully
✅ Webhook sent to backend
✅ Redirect to success page
```

#### **Step 5: Webhook Processing**
```bash
# Backend Logs to Monitor:
INFO: Received PayOS webhook for order: 1698765432
INFO: Processing webhook for transaction ID: 123 with status: 00
INFO: Activating subscription: 123
INFO: Subscription confirmation email sent for subscription: 123
INFO: PayOS webhook processed successfully for order: 1698765432

# Database Verification:
SELECT * FROM transactions WHERE order_code = 1698765432;
-- status should be 'PAID'

SELECT * FROM subscriptions WHERE id = 123;
-- status should be 'ACTIVE'

SELECT * FROM users WHERE id = 1;
-- subscription_tier should be 'BASIC'
```

#### **Step 6: Success Page**
```bash
# URL: http://localhost:5173/subscription/success?orderCode=1698765432

# Verify:
✅ Payment details displayed
✅ Subscription info shown
✅ User tier updated
✅ Next steps guidance
✅ Email confirmation mentioned
```

### **Test Case 2: Payment Cancellation**

#### **Steps:**
```bash
1. Start payment flow
2. At PayOS page, click "Hủy" or close window
3. Should redirect to: /payment/cancel?orderCode=xxx

# Verify:
✅ Cancel page displays correctly
✅ Transaction marked as CANCELLED
✅ Subscription remains PENDING
✅ Retry payment option available
```

### **Test Case 3: Payment Failure**

#### **Steps:**
```bash
1. Start payment flow
2. Use invalid card at PayOS
3. Should redirect to: /payment/failed?orderCode=xxx

# Verify:
✅ Failure page displays
✅ Error troubleshooting shown
✅ Transaction marked as FAILED
✅ Subscription remains PENDING
✅ Support contact information
```

### **Test Case 4: Network Error Handling**

#### **Steps:**
```bash
1. Stop backend server
2. Try to select subscription plan
3. Start backend, retry

# Verify:
✅ Error message displays
✅ Retry functionality works
✅ No app crashes
✅ User can recover gracefully
```

---

## 🔍 Testing Tools & Commands

### **1. API Testing với cURL**

#### **Create Payment Link**
```bash
curl -X POST http://localhost:8080/api/v2/payments/payos/create-payment-link \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "userId": 1,
    "productName": "Test Subscription",
    "description": "Test payment",
    "price": 100000,
    "buyerEmail": "test@example.com",
    "subscriptionId": 1
  }'
```

#### **Get Payment Info**
```bash
curl http://localhost:8080/api/v2/payments/payos/payment-info/1698765432 \
  -H "Authorization: Bearer $JWT_TOKEN"
```

#### **Cancel Payment**
```bash
curl -X POST http://localhost:8080/api/v2/payments/payos/cancel-payment/1698765432 \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "reason=Test cancellation"
```

### **2. Database Monitoring**

#### **Monitor Transactions**
```sql
-- Watch transaction status changes
SELECT order_code, status, type, amount, created_at, updated_at 
FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;

-- Check subscription activations
SELECT id, user_id, status, tier, created_at, updated_at 
FROM subscriptions 
WHERE status = 'ACTIVE' 
ORDER BY updated_at DESC;
```

#### **Monitor User Updates**
```sql
-- Check user tier changes
SELECT id, username, email, subscription_tier, updated_at 
FROM users 
WHERE subscription_tier != 'FREE';
```

### **3. Log Monitoring**

#### **Backend Logs**
```bash
# Tail logs real-time
tail -f logs/neuralpix.log

# Filter payment related logs
grep -i "payos\|payment\|webhook" logs/neuralpix.log

# Filter subscription logs
grep -i "subscription\|activate" logs/neuralpix.log
```

#### **Frontend Console**
```bash
# In browser DevTools Console:
# Enable verbose logging
localStorage.setItem('debug', 'payment:*');

# Monitor API calls
console.log('Payment API calls', window.performance.getEntriesByType('navigation'));
```

---

## 🐛 Common Issues & Troubleshooting

### **Issue 1: PayOS Credentials Invalid**
```bash
# Symptoms:
- "Failed to create payment link"
- 401 Unauthorized from PayOS

# Fix:
1. Verify credentials in .env file
2. Check PayOS dashboard for correct keys
3. Ensure sandbox mode is enabled
```

### **Issue 2: Webhook Not Received**
```bash
# Symptoms:
- Payment successful at PayOS
- Subscription not activated
- No webhook logs

# Fix:
1. Check ngrok is running: ngrok http 8080
2. Verify webhook URL in PayOS dashboard
3. Check firewall settings
4. Test webhook endpoint manually
```

### **Issue 3: CORS Errors**
```bash
# Symptoms:
- API calls blocked by browser
- "CORS policy" errors

# Fix:
1. Verify @CrossOrigin annotation in controllers
2. Check frontend URL in CORS configuration
3. Ensure credentials: true in frontend
```

### **Issue 4: Database Connection**
```bash
# Symptoms:
- 500 errors from backend
- "Connection refused" logs

# Fix:
1. Check MySQL is running
2. Verify database credentials
3. Check database exists and accessible
```

---

## 📊 Test Results Checklist

### **✅ Frontend Tests**
- [ ] Subscription plans load correctly
- [ ] Payment form validation works
- [ ] Loading states display properly
- [ ] Error messages show correctly
- [ ] Success page displays payment details
- [ ] Cancel page shows retry options
- [ ] Failed page shows troubleshooting

### **✅ Backend Tests**
- [ ] Payment links created successfully
- [ ] Webhooks processed correctly
- [ ] Subscriptions activated automatically
- [ ] Transactions recorded accurately
- [ ] User tiers updated properly
- [ ] Emails sent successfully

### **✅ Integration Tests**
- [ ] End-to-end payment flow works
- [ ] PayOS redirects handled correctly
- [ ] Database consistency maintained
- [ ] Error recovery functions properly
- [ ] Security validations pass

### **✅ PayOS Integration**
- [ ] Sandbox payments process
- [ ] Webhooks delivered reliably
- [ ] Status codes handled correctly
- [ ] Order codes generated uniquely
- [ ] Payment info retrievable

---

## 🎯 Performance Testing

### **Load Testing**
```bash
# Test multiple concurrent payments
for i in {1..10}; do
  curl -X POST http://localhost:8080/api/v2/payments/payos/create-payment-link \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -d "{\"userId\": $i, \"productName\": \"Test $i\", \"price\": 100000}" &
done
wait
```

### **Memory Monitoring**
```bash
# Monitor backend memory usage
jstat -gc -t $(jps | grep NeuralPixApplication | cut -d' ' -f1) 5s

# Monitor database connections
SHOW PROCESSLIST;
```

---

## 📝 Test Report Template

```markdown
## Payment Flow Test Report

**Date:** [DATE]
**Tester:** [NAME]
**Environment:** Sandbox

### Test Results
- ✅ Subscription plans loading: PASS
- ✅ Payment link creation: PASS  
- ✅ PayOS payment processing: PASS
- ✅ Webhook handling: PASS
- ✅ Subscription activation: PASS
- ✅ Email notifications: PASS
- ✅ Error handling: PASS

### Issues Found
1. [Issue description]
   - Severity: [High/Medium/Low]
   - Steps to reproduce: [Steps]
   - Fix applied: [Fix description]

### Performance Metrics
- Payment link creation: [X]ms
- Webhook processing: [X]ms
- Database operations: [X]ms

### Recommendations
- [Recommendation 1]
- [Recommendation 2]
```

---

**Happy Testing! 🚀 Chúc bạn test thành công payment flow!**