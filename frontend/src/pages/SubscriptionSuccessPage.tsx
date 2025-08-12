import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentApi, type PaymentInfo } from '../services/paymentApi';
import { subscriptionApi, type Subscription } from '../services/subscriptionApi';
import { useAuth } from '../context/AuthContext';

const SubscriptionSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    if (!orderCode) {
      setError('Invalid subscription link - missing order code');
      setLoading(false);
      return;
    }

    verifySubscriptionPayment();
  }, [orderCode]);

  const verifySubscriptionPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get payment information
      const paymentResponse = await paymentApi.getPaymentInfo(Number(orderCode));
      
      if (!paymentResponse.success) {
        throw new Error('Failed to get payment information');
      }

      const payment = paymentResponse.data;
      setPaymentInfo(payment);

      // Check if payment is actually successful
      if (payment.status !== 'PAID') {
        setError(`Subscription payment not completed. Status: ${payment.status}`);
        setLoading(false);
        return;
      }

      // Refresh user to get updated subscription info
      if (user) {
        try {
          await refreshUser();
          const userSubscription = await subscriptionApi.getUserSubscription(user.id!);
          setSubscription(userSubscription);
        } catch (err) {
          console.warn('Could not load subscription info:', err);
        }
      }

    } catch (err) {
      console.error('Error verifying subscription payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify subscription payment');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTierColor = (tier: string): string => {
    switch (tier.toLowerCase()) {
      case 'basic':
        return 'from-blue-500 to-blue-600';
      case 'premium':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTierFeatures = (tier: string): string[] => {
    switch (tier.toLowerCase()) {
      case 'basic':
        return [
          '50 generations per day',
          'High resolution images (1024x1024)',
          'Priority processing',
          'Email support',
          'No watermarks'
        ];
      case 'premium':
        return [
          'Unlimited generations',
          'Ultra-high resolution (2048x2048)',
          'Fastest processing priority',
          '24/7 premium support',
          'Commercial license',
          'API access',
          'Advanced AI models',
          'Bulk generation tools'
        ];
      default:
        return [];
    }
  };

  const handleStartGenerating = () => {
    navigate('/generator');
  };

  const handleManageSubscription = () => {
    navigate('/subscription');
  };

  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Activating your subscription</h2>
          <p className="text-gray-600">
            Please wait while we activate your subscription...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Subscription activation failed</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={verifySubscriptionPayment}
              className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => navigate('/support')}
              className="bg-white hover:bg-gray-50 text-gray-900 font-medium py-2 px-4 rounded-lg border border-gray-300 transition-colors"
            >
              Contact support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">
            Welcome to {subscription?.tier || 'Premium'}!
          </h1>
          <p className="text-lg text-gray-600">
            Your subscription is now active and ready to use
          </p>
        </div>

        {/* Subscription Details Card */}
        {subscription && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Plan</span>
                  <p className="text-base font-medium text-gray-900">
                    {subscription.plan?.name || subscription.tier}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Billing</span>
                  <p className="text-base font-medium text-gray-900">
                    {subscription.billingCycle === 'YEARLY' ? 'Annual' : 'Monthly'} • {formatPrice(subscription.price)}{subscription.billingCycle === 'YEARLY' ? '/year' : '/month'}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Status</span>
                  <p className="text-base font-medium text-green-600">{subscription.status}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Next billing date</span>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(subscription.nextBillingDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Receipt */}
        {paymentInfo && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Receipt</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <span className="text-sm text-gray-500">Order Code</span>
                <p className="text-sm font-mono text-gray-900 mt-1">{paymentInfo.orderCode}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Amount</span>
                <p className="text-sm font-semibold text-gray-900 mt-1">{formatPrice(paymentInfo.amount)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Date</span>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDate(paymentInfo.transactionDateTime)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Reference</span>
                <p className="text-sm font-mono text-gray-900 mt-1">
                  {paymentInfo.reference || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plan Features */}
        {subscription && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              What's included in {subscription.tier}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getTierFeatures(subscription.tier).map((feature, index) => (
                <div key={index} className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={handleStartGenerating}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Start creating
          </button>
          <button
            onClick={handleViewDashboard}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-6 rounded-lg border border-gray-300 transition-colors"
          >
            View dashboard
          </button>
          <button
            onClick={handleManageSubscription}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-6 rounded-lg border border-gray-300 transition-colors"
          >
            Manage subscription
          </button>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">What's next?</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-4 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Start generating images</h4>
                <p className="text-sm text-gray-600 mt-1">Use our AI image generator with your new plan limits</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-4 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Explore advanced features</h4>
                <p className="text-sm text-gray-600 mt-1">Try high-resolution outputs and priority processing</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-4 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Check your email</h4>
                <p className="text-sm text-gray-600 mt-1">We've sent a confirmation email with your receipt</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Thank you for choosing NeuralPix! We're excited to see what you'll create.
          </p>
          <p className="text-sm text-gray-500">
            Need help getting started?{' '}
            <a href="/support" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact support
            </a>{' '}
            or{' '}
            <a href="/docs" className="text-blue-600 hover:text-blue-700 font-medium">
              view our docs
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;