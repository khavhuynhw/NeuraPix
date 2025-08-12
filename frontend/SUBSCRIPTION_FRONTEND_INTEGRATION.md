# 🚀 Frontend Subscription Flow Integration Guide

## 📋 Overview

Complete frontend implementation for PayOS subscription payment flow with:
- Subscription plans display
- PayOS payment integration
- Payment status handling
- Subscription activation
- Error handling and retry mechanisms

## 🗂️ Files Created/Updated

### **API Services**
- `src/services/paymentApi.ts` - PayOS payment integration
- `src/services/subscriptionApi.ts` - Updated for correct endpoints

### **Components**
- `src/components/SubscriptionPlans.tsx` - Main subscription plans display

### **Pages**
- `src/pages/PaymentSuccessPage.tsx` - General payment success
- `src/pages/PaymentCancelPage.tsx` - Payment cancellation
- `src/pages/PaymentFailedPage.tsx` - Payment failure with troubleshooting
- `src/pages/SubscriptionSuccessPage.tsx` - Subscription-specific success

## 🔗 Required Routes

Add these routes to your React Router configuration:

```typescript
// In your main router file (e.g., App.tsx or routes.tsx)
import SubscriptionPlans from './components/SubscriptionPlans';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import PaymentFailedPage from './pages/PaymentFailedPage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';

// Add these routes:
<Route path="/pricing" element={<SubscriptionPlans />} />
<Route path="/subscription/plans" element={<SubscriptionPlans />} />
<Route path="/payment/success" element={<PaymentSuccessPage />} />
<Route path="/payment/cancel" element={<PaymentCancelPage />} />
<Route path="/payment/cancelled" element={<PaymentCancelPage />} />
<Route path="/payment/failed" element={<PaymentFailedPage />} />
<Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
<Route path="/subscription/cancel" element={<PaymentCancelPage />} />
```

## 🔧 Environment Variables

Ensure these environment variables are set:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## 📱 Usage Examples

### 1. Display Subscription Plans
```tsx
import SubscriptionPlans from '../components/SubscriptionPlans';

function PricingPage() {
  return (
    <div>
      <h1>Choose Your Plan</h1>
      <SubscriptionPlans />
    </div>
  );
}
```

### 2. Handle Current User's Plan
```tsx
import { useAuth } from '../context/AuthContext';
import { subscriptionApi } from '../services/subscriptionApi';

function Dashboard() {
  const { user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    if (user) {
      subscriptionApi.getUserSubscription(user.id)
        .then(setCurrentSubscription)
        .catch(console.error);
    }
  }, [user]);

  return (
    <div>
      <SubscriptionPlans currentPlan={currentSubscription} />
    </div>
  );
}
```

### 3. Manual Payment Creation
```tsx
import { paymentApi, CreatePaymentLinkRequest } from '../services/paymentApi';

async function createCustomPayment() {
  const request: CreatePaymentLinkRequest = {
    userId: user.id,
    productName: 'Premium Subscription',
    description: 'Monthly premium subscription',
    price: 299000,
    buyerEmail: user.email,
    subscriptionId: subscriptionId, // optional
  };

  try {
    const response = await paymentApi.createPaymentLink(request);
    if (response.success) {
      // Redirect to PayOS
      window.location.href = response.data.checkoutUrl;
    }
  } catch (error) {
    console.error('Payment creation failed:', error);
  }
}
```

## 🎯 Payment Flow Sequence

```
1. User selects plan → SubscriptionPlans component
2. User clicks "Choose Plan" → Creates subscription (PENDING status)
3. Creates PayOS payment link → Redirects to PayOS
4. User completes payment → PayOS webhook to backend
5. Backend activates subscription → Sends email
6. PayOS redirects to return URL → Payment status pages
7. Frontend shows success → User sees subscription details
```

## 🔄 PayOS Integration Details

### **Payment Creation**
- Creates subscription in PENDING status
- Generates unique orderCode (thread-safe)
- Links payment to subscription via `subscriptionId`
- Handles both monthly and yearly billing

### **Webhook Handling**
- Backend receives PayOS webhook
- Verifies signature for security
- Updates transaction status
- Activates subscription if payment successful
- Sends confirmation email

### **Return URL Handling**
- Different pages for different scenarios:
  - `/subscription/success` - Subscription payments
  - `/payment/success` - One-time payments
  - `/payment/cancel` - Cancelled payments
  - `/payment/failed` - Failed payments

## 🛡️ Security Features

### **Input Validation**
- Email format validation
- Amount range validation (1,000 - 500,000,000 VND)
- Required field validation
- User authentication checks

### **Error Handling**
- Network error retry mechanisms
- Payment polling with timeout
- Graceful error messages
- Support contact information

### **User Experience**
- Loading states during payment
- Payment status polling
- Automatic redirects
- Mobile-responsive design

## 📊 Subscription Status Management

### **Status Types**
- `PENDING` - Payment not completed
- `ACTIVE` - Subscription active
- `PAST_DUE` - Payment failed
- `CANCELLED` - User cancelled
- `EXPIRED` - Subscription ended

### **Status Checking**
```tsx
// Check if user has active subscription
const hasActiveSubscription = subscription?.status === 'ACTIVE';

// Get subscription tier
const tier = user?.subscriptionTier || 'FREE';

// Check subscription expiry
const isExpired = subscription?.endDate && new Date(subscription.endDate) < new Date();
```

## 🎨 Styling & Theming

### **Plan Card Colors**
- Free: Gray theme
- Basic: Blue theme  
- Premium: Purple/gradient theme

### **Status Indicators**
- Success: Green
- Warning: Yellow
- Error: Red
- Info: Blue

### **Responsive Design**
- Mobile-first approach
- Grid layouts for plans
- Responsive button groups
- Mobile-optimized forms

## 🔍 Testing Guide

### **Test Scenarios**
1. **Successful Payment Flow**
   - Select plan → Pay → Verify activation
2. **Payment Cancellation**
   - Start payment → Cancel → Return to plans
3. **Payment Failure**
   - Invalid card → Error handling → Retry option
4. **Subscription Management**
   - View current plan → Upgrade/downgrade → Cancellation

### **Test Data**
```typescript
// Test subscription plans
const testPlans = [
  { tier: 'BASIC', monthlyPrice: 99000, yearlyPrice: 990000 },
  { tier: 'PREMIUM', monthlyPrice: 299000, yearlyPrice: 2990000 }
];

// Test payment amounts
const validAmounts = [99000, 299000, 990000, 2990000];
const invalidAmounts = [500, 600000000]; // Below min, above max
```

## 📞 Support Integration

### **Error Contact**
- In-app support links
- Order code reference for support
- FAQ and documentation links
- Phone support for payment issues

### **User Guidance**
- Payment troubleshooting steps
- Common error explanations
- Next steps after subscription
- Feature usage guides

## 🚀 Deployment Notes

### **Production Checklist**
- [ ] Update API URLs for production
- [ ] Configure PayOS production credentials
- [ ] Test webhook endpoints
- [ ] Verify email templates
- [ ] Test payment flows end-to-end
- [ ] Set up monitoring and alerting

### **Environment Configs**
```typescript
// Development
VITE_API_BASE_URL=http://localhost:8080

// Production
VITE_API_BASE_URL=https://api.neuralpix.com
```

---

## 📋 Integration Checklist

- ✅ PayOS payment service implemented
- ✅ Subscription plans component created
- ✅ Payment status pages added
- ✅ Error handling implemented
- ✅ Mobile responsive design
- ✅ Security validation added
- ✅ API integration completed
- ✅ Routes configuration documented

**Frontend subscription flow is now complete and ready for integration!** 🎉