import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentApi, type PaymentInfo } from '../services/paymentApi';

const PaymentFailedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orderCode = searchParams.get('orderCode');
  const errorReason = searchParams.get('error');

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
        // Don't show error for payment info, as failed payments might not be queryable
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

  const getFailureReason = (): string => {
    if (errorReason) {
      return decodeURIComponent(errorReason);
    }
    return 'The payment could not be processed. Please try again.';
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const handleRetryPayment = () => {
    // Go back to subscription plans or pricing page
    navigate('/pricing');
  };

  const handleContactSupport = () => {
    // Navigate to support page or open support chat
    navigate('/support');
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
          {/* Failed Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-gray-600">
              We couldn't process your payment. No charges were made.
            </p>
          </div>

          {/* Error Reason */}
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Payment Failed</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{getFailureReason()}</p>
                </div>
              </div>
            </div>
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
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(paymentInfo.status)}`}>
                      {paymentInfo.status || 'FAILED'}
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
                  <h3 className="text-sm font-medium text-red-800">Additional Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Troubleshooting */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">What Can You Do?</h3>
            <ul className="space-y-3 text-sm text-blue-800">
              <li className="flex items-start">
                <svg className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Check your payment method:</strong> Ensure your card has sufficient funds and is not expired
                </div>
              </li>
              <li className="flex items-start">
                <svg className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Try a different payment method:</strong> Use another card or bank account
                </div>
              </li>
              <li className="flex items-start">
                <svg className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Check with your bank:</strong> Some banks block online transactions by default
                </div>
              </li>
              <li className="flex items-start">
                <svg className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Verify your information:</strong> Double-check billing address and card details
                </div>
              </li>
              <li className="flex items-start">
                <svg className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Try again later:</strong> Sometimes payment systems experience temporary issues
                </div>
              </li>
            </ul>
          </div>

          {/* Common Causes */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Common Causes of Payment Failure</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Insufficient funds in the account
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Expired or blocked payment card
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Bank security restrictions on online payments
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Incorrect billing information
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Network connectivity issues
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Payment processor technical problems
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
              onClick={handleContactSupport}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              Contact Support
            </button>
            <button
              onClick={handleGoHome}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-md transition-colors"
            >
              Go to Home
            </button>
          </div>

          {/* Support Information */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Still having trouble? Our support team is here to help.
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
                href="tel:+84123456789" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Call Support
              </a>
            </div>
            {orderCode && (
              <p className="text-xs text-gray-400 mt-4">
                Reference Order Code: {orderCode} when contacting support
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;