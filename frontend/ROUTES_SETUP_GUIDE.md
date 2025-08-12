# 🛣️ Routes Setup Guide for Subscription Flow

## ✅ Routes Added to App.tsx

Tôi đã thêm các routes sau vào `src/App.tsx`:

```typescript
// Import statements added
import SubscriptionPlans from "./components/SubscriptionPlans";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";
import PaymentFailedPage from "./pages/PaymentFailedPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";

// Routes added inside <Routes> component:
<Route path="/pricing" element={<SubscriptionPlans />} />
<Route path="/subscription/plans" element={<SubscriptionPlans />} />
<Route path="/payment/success" element={<PaymentSuccessPage />} />
<Route path="/payment/cancel" element={<PaymentCancelPage />} />
<Route path="/payment/cancelled" element={<PaymentCancelPage />} />
<Route path="/payment/failed" element={<PaymentFailedPage />} />
<Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
<Route path="/subscription/cancel" element={<PaymentCancelPage />} />
```

## 🔄 Route Flow Mapping

### **User Journey Routes**
```
1. /pricing → User selects subscription plan
2. PayOS Payment → User completes payment
3. Return URLs:
   - /subscription/success?orderCode=123 → Subscription activated
   - /payment/success?orderCode=123 → General payment success
   - /payment/cancel?orderCode=123 → Payment cancelled
   - /payment/failed?orderCode=123 → Payment failed
```

### **Backend PayOS Configuration**
```properties
# In application.properties
payos.return-url=http://localhost:8080/api/v2/payments/payos/return
payos.cancel-url=http://localhost:8080/api/v2/payments/payos/cancel

# Backend handles redirect to frontend:
app.payment.frontend.base-url=http://localhost:5173
app.payment.frontend.subscription-success-path=/subscription/success
app.payment.frontend.payment-success-path=/payment/success
app.payment.frontend.payment-cancel-path=/payment/cancel
app.payment.frontend.payment-failed-path=/payment/failed
```

## 🚀 Navigation Usage

### **Direct Navigation**
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Go to subscription plans
navigate('/pricing');

// Go to specific success page
navigate('/subscription/success?orderCode=123');
```

### **Link Components**
```tsx
import { Link } from 'react-router-dom';

// Navigation links
<Link to="/pricing">View Plans</Link>
<Link to="/subscription/plans">Subscription Plans</Link>
```

## 🔧 AuthContext Enhancement

### **Added RefreshUser Method**
```typescript
// In AuthContext.tsx
const refreshUser = async () => {
  if (accessToken) {
    try {
      const userData = await getProfile();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }
};

// Usage in components
const { refreshUser } = useAuth();
await refreshUser(); // Updates user with latest subscription tier
```

## 📱 Component Integration

### **Header Navigation**
```tsx
// In Header component
<Link to="/pricing">Pricing</Link>
<Link to="/subscription/plans">Plans</Link>
```

### **Dashboard Integration**
```tsx
// In Dashboard/Profile pages
import { subscriptionApi } from '../services/subscriptionApi';

const [subscription, setSubscription] = useState(null);

useEffect(() => {
  if (user) {
    subscriptionApi.getUserSubscription(user.id)
      .then(setSubscription)
      .catch(console.error);
  }
}, [user]);

// Show current plan
{subscription && (
  <div>Current Plan: {subscription.tier}</div>
)}

// Link to manage subscription
<Link to="/pricing">Upgrade Plan</Link>
```

## 🔒 Protected Routes (Optional)

### **Add Authentication Guards**
```tsx
import ProtectedRoute from './components/ProtectedRoute';

// Protect subscription management
<Route 
  path="/subscription/manage" 
  element={
    <ProtectedRoute>
      <SubscriptionManagement />
    </ProtectedRoute>
  } 
/>
```

## 🎯 URL Parameters

### **Payment Status Pages**
```typescript
// These pages expect orderCode parameter
/payment/success?orderCode=1698765432
/subscription/success?orderCode=1698765432
/payment/cancel?orderCode=1698765432
/payment/failed?orderCode=1698765432

// Usage in components:
const [searchParams] = useSearchParams();
const orderCode = searchParams.get('orderCode');
```

## 📋 Testing Routes

### **Manual Testing**
```bash
# Test each route directly:
http://localhost:5173/pricing
http://localhost:5173/subscription/plans
http://localhost:5173/payment/success?orderCode=123
http://localhost:5173/payment/cancel?orderCode=123
http://localhost:5173/payment/failed?orderCode=123
http://localhost:5173/subscription/success?orderCode=123
```

### **Route Validation**
```typescript
// Check if all routes work
const testRoutes = [
  '/pricing',
  '/subscription/plans',
  '/payment/success?orderCode=123',
  '/payment/cancel?orderCode=123',
  '/payment/failed?orderCode=123',
  '/subscription/success?orderCode=123'
];

testRoutes.forEach(route => {
  console.log(`Testing route: ${route}`);
  // Navigate and verify component loads
});
```

## 🚨 Common Issues & Fixes

### **Issue 1: Route Not Found**
```bash
# Symptoms: 404 error on payment return
# Fix: Ensure route is added to App.tsx
# Check: <Route path="/payment/success" element={<PaymentSuccessPage />} />
```

### **Issue 2: Component Not Loading**
```bash
# Symptoms: Blank page on route access
# Fix: Check import path and component export
# Verify: import PaymentSuccessPage from "./pages/PaymentSuccessPage";
```

### **Issue 3: OrderCode Not Passed**
```bash
# Symptoms: "Invalid payment link - missing order code"
# Fix: Ensure PayOS redirect includes orderCode parameter
# Check: backend return URL configuration
```

### **Issue 4: AuthContext Error**
```bash
# Symptoms: "useAuth must be used within an AuthProvider"
# Fix: Ensure component is wrapped in AuthProvider
# Check: App.tsx has <AuthProvider> wrapper
```

## 📁 File Structure

```
src/
├── components/
│   └── SubscriptionPlans.tsx
├── pages/
│   ├── PaymentSuccessPage.tsx
│   ├── PaymentCancelPage.tsx
│   ├── PaymentFailedPage.tsx
│   └── SubscriptionSuccessPage.tsx
├── services/
│   ├── paymentApi.ts
│   ├── subscriptionApi.ts
│   └── authApi.ts
├── context/
│   └── AuthContext.tsx
└── App.tsx (routes configured here)
```

## ✅ Deployment Checklist

- [ ] Routes added to App.tsx
- [ ] All components imported correctly
- [ ] AuthContext has refreshUser method
- [ ] Backend return URLs configured
- [ ] Frontend environment variables set
- [ ] PayOS webhook URLs updated
- [ ] Test all routes manually
- [ ] Verify payment flow end-to-end

---

## 🎉 Ready to Test!

All routes are now configured and ready for testing. Start your development servers and test the complete payment flow:

1. **Frontend:** `npm run dev` → http://localhost:5173
2. **Backend:** `./mvnw spring-boot:run` → http://localhost:8080
3. **Navigate to:** http://localhost:5173/pricing
4. **Test subscription purchase flow**

**Happy coding! 🚀**