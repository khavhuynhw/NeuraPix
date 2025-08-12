# 🔧 Base URL Standardization

## 📅 Ngày cập nhật: $(date)

### 🎯 Mục tiêu
Chuẩn hóa tất cả các base URL trong các API services để đảm bảo tính nhất quán và dễ dàng quản lý.

## 📋 Chuẩn mới được áp dụng

### ✅ **Base URL Pattern:**
```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const SPECIFIC_BASE_URL = `${BASE_URL}/api/vX/endpoint`;
```

## 📊 Tóm tắt các API Services

| Service | File | Base URL Pattern | Endpoints |
|---------|------|------------------|-----------|
| **Auth API** | `authApi.ts` | `${BASE_URL}/api/v1/auth` | `/login`, `/register`, `/reset-password`, `/me` |
| **User API** | `userApi.ts` | `${BASE_URL}/api/v1/users` | `/email/{email}`, `/{id}`, `/bulk`, `/status` |
| **Subscription API** | `subscriptionApi.ts` | `${BASE_URL}/api/v1/subscriptions`<br>`${BASE_URL}/api/v1/plans` | `/active`, `/user/{id}`, `/me`, `/cancel` |
| **Payment API** | `paymentApi.ts` | `${BASE_URL}/api/v2/payments/payos`<br>`${BASE_URL}/api/v1/transactions` | `/create-payment-link`, `/payment-info`, `/cancel-payment` |
| **Gemini API** | `geminiApi.ts` | `${BASE_URL}/api` | `/gemini/chat`, `/gemini/image-analysis` |
| **PixelCut API** | `pixelcutApi.ts` | `${BASE_URL}/api` | `/pixelcut/generate`, `/pixelcut/upscale` |
| **File Upload API** | `fileUploadApi.ts` | `${BASE_URL}/api` | `/upload`, `/files` |

## 🔄 Thay đổi cụ thể

### 1. **Auth API** (`src/services/authApi.ts`)
```typescript
// Trước
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

// Sau
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const AUTH_BASE_URL = `${BASE_URL}/api/v1/auth`;
```

**Endpoints được cập nhật:**
- `${AUTH_BASE_URL}/login`
- `${AUTH_BASE_URL}/register`
- `${AUTH_BASE_URL}/reset-password`
- `${AUTH_BASE_URL}/reset-password/confirm`
- `${AUTH_BASE_URL}/me`
- `${AUTH_BASE_URL}/profile`

### 2. **User API** (`src/services/userApi.ts`)
```typescript
// Trước
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

// Sau
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const USERS_BASE_URL = `${BASE_URL}/api/v1/users`;
```

**Endpoints được cập nhật:**
- `${USERS_BASE_URL}/email/{email}`
- `${USERS_BASE_URL}/{id}`
- `${USERS_BASE_URL}` (GET/POST/PUT)
- `${USERS_BASE_URL}/{id}/status`
- `${USERS_BASE_URL}/bulk`

### 3. **Subscription API** (`src/services/subscriptionApi.ts`)
```typescript
// Đã chuẩn hóa từ trước
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const SUBSCRIPTION_BASE_URL = `${BASE_URL}/api/v1/subscriptions`;
const PLANS_BASE_URL = `${BASE_URL}/api/v1/plans`;
```

### 4. **Payment API** (`src/services/paymentApi.ts`)
```typescript
// Đã chuẩn hóa từ trước
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const PAYMENT_BASE_URL = `${BASE_URL}/api/v2/payments/payos`;
const TRANSACTION_BASE_URL = `${BASE_URL}/api/v1/transactions`;
```

### 5. **Gemini API** (`src/services/geminiApi.ts`)
```typescript
// Trước
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/v1', '') || 'http://localhost:8080/api';

// Sau
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_BASE_URL = `${BASE_URL}/api`;
```

### 6. **PixelCut API** (`src/services/pixelcutApi.ts`)
```typescript
// Trước
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/v1', '') || 'http://localhost:8080/api';

// Sau
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_BASE_URL = `${BASE_URL}/api`;
```

### 7. **File Upload API** (`src/services/fileUploadApi.ts`)
```typescript
// Trước
const API_BASE_URL = 'http://localhost:8080/api';

// Sau
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_BASE_URL = `${BASE_URL}/api`;
```

## 🎯 Lợi ích

### 1. **Consistency (Tính nhất quán)**
- Tất cả services đều sử dụng cùng pattern
- Dễ dàng thay đổi base URL thông qua environment variable
- Giảm confusion khi develop

### 2. **Maintainability (Dễ bảo trì)**
- Chỉ cần thay đổi `VITE_API_BASE_URL` để switch environment
- Code dễ đọc và hiểu
- Standardized naming convention

### 3. **Flexibility (Tính linh hoạt)**
- Support multiple API versions (v1, v2)
- Easy to add new endpoints
- Environment-specific configurations

## 🔧 Environment Configuration

### Development
```env
VITE_API_BASE_URL=http://localhost:8080
```

### Production
```env
VITE_API_BASE_URL=https://api.neurapix.com
```

### Staging
```env
VITE_API_BASE_URL=https://staging-api.neurapix.com
```

## 🚀 Migration Status

| Service | Status | Notes |
|---------|--------|--------|
| Auth API | ✅ Completed | All endpoints updated |
| User API | ✅ Completed | All endpoints updated |
| Subscription API | ✅ Completed | Already standardized |
| Payment API | ✅ Completed | Already standardized |
| Gemini API | ✅ Completed | Base URL pattern updated |
| PixelCut API | ✅ Completed | Base URL pattern updated |
| File Upload API | ✅ Completed | Base URL pattern updated |

## 🧪 Testing Checklist

- [ ] All API calls work with new base URLs
- [ ] Environment variable override works correctly
- [ ] TypeScript compilation passes
- [ ] No broken imports or references
- [ ] Backward compatibility maintained

## 📝 Notes

- Tất cả services giờ đây đều respect `VITE_API_BASE_URL` environment variable
- Fallback to `http://localhost:8080` nếu env var không được set
- Consistent naming pattern: `{SERVICE}_BASE_URL`
- API versioning được support thông qua specific base URLs