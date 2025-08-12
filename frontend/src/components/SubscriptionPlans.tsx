import React, { useState, useEffect } from 'react';
import { subscriptionApi, type SubscriptionPlan, type CreateSubscriptionRequest } from '../services/subscriptionApi';
import { paymentApi, type CreatePaymentLinkRequest } from '../services/paymentApi';
import { useAuth } from '../context/AuthContext';

interface SubscriptionPlansProps {
  onPlanSelect?: (plan: SubscriptionPlan) => void;
  currentPlan?: SubscriptionPlan | null;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onPlanSelect, currentPlan }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [processingPlan, setProcessingPlan] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const plansData = await subscriptionApi.getSubscriptionPlans();
      setPlans(plansData);
    } catch (err) {
      console.error('Error loading subscription plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanPurchase = async (plan: SubscriptionPlan) => {
    if (!user) {
      setError('Please login to purchase a subscription');
      return;
    }

    try {
      setProcessingPlan(plan.id);
      setError(null);

      // Create subscription
      const subscriptionRequest: CreateSubscriptionRequest = {
        userId: user.id!,
        tier: plan.tier,
        billingCycle: selectedBillingCycle,
        paymentProvider: 'payos',
        autoRenew: true,
      };

      const subscription = await subscriptionApi.createSubscription(subscriptionRequest);

      // Create payment link
      const price = selectedBillingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
      const paymentRequest: CreatePaymentLinkRequest = {
        userId: user.id!,
        productName: `${plan.name} - ${selectedBillingCycle === 'YEARLY' ? 'Yearly' : 'Monthly'} Subscription`,
        description: `${plan.name} subscription payment - ${plan.description}`,
        price: price,
        buyerEmail: user.email,
        subscriptionId: subscription.id,
      };

      const paymentResponse = await paymentApi.createPaymentLink(paymentRequest);

      // Redirect to PayOS payment page
      if (paymentResponse.success && paymentResponse.data.checkoutUrl) {
        paymentApi.redirectToPayment(paymentResponse.data.checkoutUrl);
      } else {
        throw new Error('Failed to create payment link');
      }

    } catch (err) {
      console.error('Error purchasing subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to purchase subscription');
    } finally {
      setProcessingPlan(null);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getDiscountPercentage = (monthlyPrice: number, yearlyPrice: number): number => {
    const yearlyMonthlyEquivalent = yearlyPrice / 12;
    const discount = ((monthlyPrice - yearlyMonthlyEquivalent) / monthlyPrice) * 100;
    return Math.round(discount);
  };

  const isPlanCurrent = (plan: SubscriptionPlan): boolean => {
    return currentPlan?.tier === plan.tier;
  };

  const getTierColor = (tier: string): string => {
    switch (tier.toLowerCase()) {
      case 'free':
        return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'basic':
        return 'bg-blue-50 border-blue-300 text-blue-800';
      case 'premium':
        return 'bg-purple-50 border-purple-300 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getPlanFeatures = (plan: SubscriptionPlan): string[] => {
    const features = [];
    
    if (plan.dailyGenerationLimit > 0) {
      features.push(`${plan.dailyGenerationLimit.toLocaleString()} generations per day`);
    } else {
      features.push('Unlimited generations');
    }
    
    if (plan.monthlyGenerationLimit > 0) {
      features.push(`${plan.monthlyGenerationLimit.toLocaleString()} generations per month`);
    }
    
    // Add tier-specific features
    switch (plan.tier.toLowerCase()) {
      case 'free':
        features.push('Basic image resolution (512x512)');
        features.push('Standard processing queue');
        features.push('Community support');
        break;
      case 'basic':
        features.push('High resolution images (1024x1024)');
        features.push('Priority processing');
        features.push('Email support');
        features.push('No watermarks');
        break;
      case 'premium':
        features.push('Ultra-high resolution (2048x2048)');
        features.push('Fastest processing priority');
        features.push('24/7 premium support');
        features.push('Commercial license');
        features.push('API access');
        features.push('Advanced AI models');
        features.push('Bulk generation tools');
        break;
    }
    
    return features;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading subscription plans</h2>
          <p className="text-gray-600">Please wait while we load the available plans...</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load plans</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={loadPlans}
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Choose your NeuralPix plan
            </h1>
            <p className="text-lg text-gray-600">
              Upgrade anytime. Cancel anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setSelectedBillingCycle('MONTHLY')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  selectedBillingCycle === 'MONTHLY'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedBillingCycle('YEARLY')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all relative ${
                  selectedBillingCycle === 'YEARLY'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Annual
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  20% off
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const currentPrice = selectedBillingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
            const isCurrentPlan = isPlanCurrent(plan);
            const isProcessing = processingPlan === plan.id;
            const features = getPlanFeatures(plan);
            const isPremium = plan.tier.toLowerCase() === 'premium';
            const isFree = plan.tier.toLowerCase() === 'free';
            const isBasic = plan.tier.toLowerCase() === 'basic';

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                  isPremium
                    ? 'border-2 border-orange-400 ring-1 ring-orange-400 ring-opacity-25'
                    : 'border border-gray-200'
                } ${isCurrentPlan ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
              >
                {/* Popular Badge */}
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most popular
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    
                    {/* Pricing */}
                    <div className="mb-4">
                      {isFree ? (
                        <div className="text-3xl font-bold text-gray-900">Free</div>
                      ) : (
                        <div>
                          <div className="text-3xl font-bold text-gray-900">
                            {formatPrice(currentPrice)}
                            <span className="text-lg font-normal text-gray-500">
                              /{selectedBillingCycle === 'YEARLY' ? 'year' : 'month'}
                            </span>
                          </div>
                          {selectedBillingCycle === 'YEARLY' && (
                            <div className="text-sm text-gray-500 mt-1">
                              {formatPrice(Math.round(currentPrice / 12))}/month, billed annually
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      {plan.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="mb-6">
                    {isFree ? (
                      <button
                        disabled
                        className="w-full bg-gray-100 text-gray-500 font-medium py-3 px-4 rounded-lg cursor-not-allowed"
                      >
                        Your current plan
                      </button>
                    ) : isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full bg-blue-50 text-blue-600 font-medium py-3 px-4 rounded-lg cursor-not-allowed border border-blue-200"
                      >
                        Your current plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePlanPurchase(plan)}
                        disabled={isProcessing || !user}
                        className={`w-full font-medium py-3 px-4 rounded-lg transition-all ${
                          isPremium
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : 'bg-gray-900 hover:bg-gray-800 text-white'
                        } ${
                          isProcessing || !user
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        {isProcessing ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin h-4 w-4 text-white mr-2" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Upgrading...
                          </div>
                        ) : !user ? (
                          'Sign in to upgrade'
                        ) : (
                          `Upgrade to ${plan.name}`
                        )}
                      </button>
                    )}
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Everything in {isFree ? 'Free' : isBasic ? 'Free' : 'Basic'}, plus:</h4>
                    <ul className="space-y-2">
                      {features.slice(0, 6).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-sm">
                          <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                      {features.length > 6 && (
                        <li className="text-sm text-gray-500 ml-6">
                          And {features.length - 6} more features...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. There are no cancellation fees.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, debit cards, and bank transfers through PayOS.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Prices are in Vietnamese Dong (VND). Payment processing by PayOS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;