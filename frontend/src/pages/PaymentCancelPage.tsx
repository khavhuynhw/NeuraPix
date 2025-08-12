import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentApi, type PaymentInfo } from '../services/paymentApi';

const PaymentCancelPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    if (!orderCode) {
      setError('Invalid payment link - missing order code');
      setLoading(false);
      return;
    }

    loadPaymentInfo();
  }, [orderCode]);

  const loadPaymentInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get payment information
      try {
        const paymentResponse = await paymentApi.getPaymentInfo(Number(orderCode));
        if (paymentResponse.success) {
          setPaymentInfo(paymentResponse.data);
        }
      } catch (err) {
        console.warn('Could not load payment info:', err);
        // Don't show error for payment info, as cancelled payments might not be queryable
      }

    } catch (err) {
      console.error('Error loading payment info:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payment information');
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

  const handleRetryPayment = () => {
    // Go back to subscription plans or pricing page
    navigate('/pricing');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Loading Payment Info</h2>
              <p className="text-gray-600 text-center">
                Please wait while we load your payment information...
              </p>
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
          {/* Cancel Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Cancelled
            </h1>
            <p className="text-gray-600">
              Your payment was cancelled and no charges were made.
            </p>
          </div>

          {/* Payment Details (if available) */}
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
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      {paymentInfo.status || 'CANCELLED'}
                    </span>
                  </dd>
                </div>
              </div>
            </div>
          )}

          {/* Order Code (if no payment info) */}
          {!paymentInfo && orderCode && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
              <div>
                <dt className="text-sm font-medium text-gray-500">Order Code</dt>
                <dd className="text-sm text-gray-900 font-mono">{orderCode}</dd>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">What Happened?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <svg className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                You cancelled the payment process or the payment window was closed
              </li>
              <li className="flex items-start">
                <svg className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                No charges were made to your account
              </li>
              <li className="flex items-start">
                <svg className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                You can try again anytime with the same or different payment method
              </li>
              <li className="flex items-start">
                <svg className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Your subscription selection has not been affected
              </li>
            </ul>
          </div>

          {/* Reasons for Cancellation */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Common Reasons for Cancellation</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Changed your mind about the purchase
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Want to compare with other payment methods
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Encountered technical issues during payment
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Need to check account balance or payment details
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Accidentally closed the payment window
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={handleRetryPayment}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              Try Payment Again
            </button>
            <button
              onClick={handleGoHome}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-md transition-colors"
            >
              Go to Home
            </button>
          </div>

          {/* Additional Help */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Need assistance with your payment?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
              <a 
                href="/support" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Contact Support
              </a>
              <span className="hidden sm:inline text-gray-400">•</span>
              <a 
                href="/faq" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Payment FAQ
              </a>
              <span className="hidden sm:inline text-gray-400">•</span>
              <a 
                href="/pricing" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Plans
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;