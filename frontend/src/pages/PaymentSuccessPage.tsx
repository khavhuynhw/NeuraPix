import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentApi, type PaymentInfo } from '../services/paymentApi';
import { subscriptionApi, type Subscription } from '../services/subscriptionApi';
import { useAuth } from '../context/AuthContext';

const PaymentSuccessPage: React.FC = () => {
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
      setError('Invalid payment link - missing order code');
      setLoading(false);
      return;
    }

    verifyPayment();
  }, [orderCode]);

  const verifyPayment = async () => {
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
        setError(`Payment not completed. Status: ${payment.status}`);
        setLoading(false);
        return;
      }

      // If user is logged in, refresh their subscription info
      if (user) {
        try {
          const userSubscription = await subscriptionApi.getUserSubscription(user.id!);
          setSubscription(userSubscription);
          
          // Refresh user context to update subscription tier
          await refreshUser();
        } catch (err) {
          console.warn('Could not load subscription info:', err);
        }
      }

    } catch (err) {
      console.error('Error verifying payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify payment');
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

  const handleContinue = () => {
    if (subscription) {
      // If it's a subscription, go to dashboard or subscription management
      navigate('/dashboard');
    } else {
      // For one-time payments, go to home or relevant page
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Verifying Payment</h2>
              <p className="text-gray-600 text-center">
                Please wait while we confirm your payment...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex flex-col items-center text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Payment Verification Failed</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex space-x-3">
                <button
                  onClick={verifyPayment}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Success Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Your payment has been processed successfully.
            </p>
          </div>

          {/* Payment Details */}
          {paymentInfo && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Order Code</dt>
                  <dd className="text-sm text-gray-900 font-mono">{paymentInfo.orderCode}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Amount</dt>
                  <dd className="text-sm text-gray-900 font-semibold">{formatPrice(paymentInfo.amount)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="text-sm text-gray-900">{paymentInfo.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Payment Date</dt>
                  <dd className="text-sm text-gray-900">
                    {formatDate(paymentInfo.transactionDateTime)}
                  </dd>
                </div>
                {paymentInfo.reference && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Reference</dt>
                    <dd className="text-sm text-gray-900 font-mono">{paymentInfo.reference}</dd>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subscription Details */}
          {subscription && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Subscription Activated</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-blue-700">Plan:</span>
                  <span className="text-sm text-blue-900 font-semibold">
                    {subscription.plan?.name || subscription.tier}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-blue-700">Billing Cycle:</span>
                  <span className="text-sm text-blue-900">
                    {subscription.billingCycle === 'YEARLY' ? 'Yearly' : 'Monthly'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-blue-700">Next Billing Date:</span>
                  <span className="text-sm text-blue-900">
                    {new Date(subscription.nextBillingDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-blue-700">Auto Renew:</span>
                  <span className="text-sm text-blue-900">
                    {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {subscription ? (
                <>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Your subscription is now active and ready to use
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Start generating images with your new plan limits
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    A confirmation email has been sent to your email address
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Manage your subscription anytime from your dashboard
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Your payment has been processed successfully
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    A receipt has been sent to your email address
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleContinue}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              {subscription ? 'Go to Dashboard' : 'Continue'}
            </button>
            {subscription && (
              <button
                onClick={() => navigate('/subscription')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-md transition-colors"
              >
                Manage Subscription
              </button>
            )}
          </div>

          {/* Support */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact our{' '}
              <a href="/support" className="text-blue-600 hover:text-blue-800 font-medium">
                support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;