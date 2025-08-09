# NeuraPix Subscription Payment Flow - Postman Testing

## 📋 Mô tả
Collection này test toàn bộ quy trình thanh toán subscription từ A đến Z, bao gồm:
- Đăng ký user và đăng nhập
- Tạo subscription với status PENDING 
- Mock webhook PayOS để confirm payment
- Verify subscription được active và user tier được upgrade

## 🚀 Cách sử dụng

### 1. Import Collection & Environment
1. Import `NeuraPix-Subscription-Payment-Flow.postman_collection.json` vào Postman
2. Import `NeuraPix-Environment.postman_environment.json` làm environment
3. Chọn environment "NeuraPix Environment" trong Postman

### 2. Cấu hình Environment
Đảm bảo các biến sau được set đúng:
- `base_url`: URL của backend (mặc định: `http://localhost:8080`)
- Các biến khác sẽ được tự động set trong quá trình test

### 3. Chạy Test Flow

#### 🔄 Chạy toàn bộ Collection
Click vào Collection → Run → chạy tất cả requests theo thứ tự

#### 📋 Chạy từng folder theo thứ tự:

1. **📋 Setup & Authentication**
   - `1. Register New User` - Tạo user mới với email random
   - `2. Login User` - Đăng nhập và lấy JWT token
   - `3. Get User Profile` - Verify user có tier FREE ban đầu

2. **📦 Subscription Plans**
   - `1. Get All Active Plans` - Lấy danh sách plans có sẵn

3. **💳 Subscription Creation & Payment**
   - `1. Create Subscription (PENDING)` - Tạo subscription với status PENDING
   - `2. Verify Subscription Status (PENDING)` - Kiểm tra subscription vẫn PENDING
   - `3. Verify User Still FREE Tier` - Verify user chưa được upgrade

4. **✅ Payment Success Flow**
   - `1. Mock PayOS Webhook - Payment SUCCESS` - Simulate payment thành công
   - `2. Verify Subscription ACTIVE` - Kiểm tra subscription đã ACTIVE
   - `3. Verify User Tier Upgraded` - Verify user đã được upgrade tier
   - `4. Get User's Active Subscription` - Lấy subscription active của user

5. **❌ Payment Failed Flow**
   - `1. Create Another Subscription for Failed Test` - Test tạo subscription khi đã có active
   - `2. Mock PayOS Webhook - Payment FAILED` - Simulate payment failed

6. **📊 Verification & Status Check**
   - Kiểm tra subscriptions theo các status khác nhau

## 🔍 Test Cases được Cover

### ✅ Happy Path
- ✅ User register thành công
- ✅ User login và lấy JWT token
- ✅ User có tier FREE ban đầu
- ✅ Tạo subscription với status PENDING
- ✅ User tier KHÔNG được upgrade ngay lập tức
- ✅ Mock webhook payment SUCCESS
- ✅ Subscription chuyển thành ACTIVE
- ✅ User tier được upgrade sau khi payment thành công

### ❌ Error Cases  
- ❌ Tạo subscription khi đã có active subscription
- ❌ Payment failed scenario
- ❌ Invalid webhook data

## 🧪 Expected Results

### Sau khi chạy xong collection:
1. **User được tạo thành công** với tier `FREE`
2. **Subscription được tạo** với status `PENDING`
3. **User tier vẫn là `FREE`** cho đến khi payment thành công
4. **Sau webhook success**: 
   - Subscription status = `ACTIVE`
   - User tier = `BASIC/PREMIUM` (tùy theo plan được chọn)
5. **Email confirmation được gửi** (check logs)
6. **Subscription history được ghi nhận**

## 🐛 Troubleshooting

### Nếu requests fail:
1. **Check server đang chạy**: `http://localhost:8080`
2. **Check database connection**: Đảm bảo DB đã migrate
3. **Check authentication**: JWT token có expire không
4. **Check logs**: Xem server logs để debug

### Common Issues:
- **401 Unauthorized**: JWT token expired hoặc invalid
- **400 Bad Request**: Request body sai format
- **404 Not Found**: Endpoint không tồn tại
- **500 Internal Server Error**: Lỗi server side (check logs)

## 📝 Variables được sử dụng

| Variable | Mô tả | Auto Set |
|----------|--------|----------|
| `base_url` | URL backend | Manual |
| `jwt_token` | JWT authentication token | ✅ Auto |
| `user_id` | ID của user được tạo | ✅ Auto |
| `subscription_id` | ID của subscription | ✅ Auto |
| `test_email` | Email random cho test | ✅ Auto |
| `test_tier` | Tier để test (BASIC/PREMIUM) | ✅ Auto |
| `order_code` | PayOS order code | ✅ Auto |

## 🔧 Customization

### Thay đổi test data:
- Sửa tier trong `Create Subscription` request
- Thay đổi billing cycle (MONTHLY/YEARLY)
- Sửa payment provider nếu cần

### Thêm test cases:
- Thêm requests để test renewal flow
- Test cancellation flow
- Test expired subscriptions

## 📚 API Endpoints được test

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/v1/auth/register` | Đăng ký user |
| POST | `/api/v1/auth/login` | Đăng nhập |
| GET | `/api/v1/users/{id}` | Lấy user profile |
| GET | `/api/v1/plans/active` | Lấy subscription plans |
| POST | `/api/v1/subscriptions` | Tạo subscription |
| GET | `/api/v1/subscriptions/{id}` | Lấy subscription by ID |
| GET | `/api/v1/subscriptions/user/{userId}` | Lấy subscription của user |
| POST | `/api/payos/webhook/subscription-payment` | Mock PayOS webhook |
| GET | `/api/v1/subscriptions/status/{status}` | Lấy subscriptions theo status |

## 🎯 Kết luận

Collection này đảm bảo rằng:
- **User KHÔNG thể sử dụng premium features trước khi thanh toán**
- **Subscription chỉ active sau khi payment thành công**
- **Quy trình thanh toán hoạt động đúng với PayOS integration**
- **Data integrity được đảm bảo trong toàn bộ flow**