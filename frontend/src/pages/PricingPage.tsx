import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Typography, Space, Spin, Alert } from "antd";
import { CheckOutlined, ArrowRightOutlined, CrownOutlined } from "@ant-design/icons";
import { subscriptionApi, type SubscriptionPlan } from "../services/subscriptionApi";
import { paymentApi, type CreatePaymentLinkRequest } from "../services/paymentApi";
import { getUserByEmail } from "../services/userApi";
import { useAuth } from "../context/AuthContext";
import { formatVND } from "../utils/currency";
import type { User } from "../types/auth";

const { Title, Text, Paragraph } = Typography;

const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBilling, setSelectedBilling] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [processingPlan, setProcessingPlan] = useState<number | null>(null);
  const [fullUser, setFullUser] = useState<User | null>(null);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    const fetchFullUser = async () => {
      if (user?.email && !user.id) {
        try {
          const fetchedUser = await getUserByEmail(user.email);
          setFullUser(fetchedUser);
        } catch (error) {
          console.error('Failed to fetch full user profile:', error);
          // Fallback to trying refreshUser
          refreshUser();
        }
      } else if (user?.id) {
        setFullUser(user);
      }
    };

    fetchFullUser();
  }, [user, refreshUser]);

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

    const currentUser = fullUser || user;
    if (!currentUser.id) {
      setError('User ID is missing. Please refresh the page and try again.');
      return;
    }

    try {
      setProcessingPlan(plan.id);
      setError(null);

      const subscription = await subscriptionApi.createSubscription({
        userId: currentUser.id,
        planId: plan.id,
        tier: plan.tier as 'FREE' | 'BASIC' | 'PREMIUM',
        billingCycle: selectedBilling,
        paymentProvider: 'payos',
        autoRenew: true,
      });

      const price = selectedBilling === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
      const paymentRequest: CreatePaymentLinkRequest = {
        userId: currentUser.id,
        subscriptionId: subscription.id,
        productName: `${plan.name} - ${selectedBilling === 'YEARLY' ? 'Yearly' : 'Monthly'} Subscription`,
        description: `${plan.name}`,
        price: price,
        currency: plan.currency || 'VND',
        buyerEmail: currentUser.email,
        buyerName: currentUser.firstName && currentUser.lastName 
          ? `${currentUser.firstName} ${currentUser.lastName}` 
          : currentUser.username || currentUser.email.split('@')[0],
      };

      const paymentResponse = await paymentApi.createPaymentLink(paymentRequest);

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
    return formatVND(price);
  };

  const getMonthlyEquivalent = (yearlyPrice: number): string => {
    return formatPrice(yearlyPrice / 12);
  };

  const getSavingsPercentage = (monthlyPrice: number, yearlyPrice: number): number => {
    const yearlyMonthlyEquivalent = yearlyPrice / 12;
    const savings = ((monthlyPrice - yearlyMonthlyEquivalent) / monthlyPrice) * 100;
    return Math.round(savings);
  };

  const getPlanFeatures = (plan: SubscriptionPlan): string[] => {
    const features = [];
    
    if (plan.dailyGenerationLimit > 0) {
      features.push(`${plan.dailyGenerationLimit.toLocaleString()} images per day`);
    } else {
      features.push('Unlimited image generation');
    }
    
    if (plan.monthlyGenerationLimit > 0) {
      features.push(`${plan.monthlyGenerationLimit.toLocaleString()} images per month`);
    }
    
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
        break;
    }
    
    return features;
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "#fafafa"
      }}>
        <div style={{ textAlign: "center" }}>
          <Spin size="large" />
          <Paragraph style={{ marginTop: 16, color: "#666" }}>
            Loading subscription plans...
          </Paragraph>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "#fafafa",
        padding: "20px"
      }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <Alert
            message="Failed to load plans"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Button 
            type="primary" 
            onClick={loadPlans}
            size="large"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const freePlan = plans.find(plan => plan.tier.toLowerCase() === 'free');
  const paidPlans = plans.filter(plan => plan.tier.toLowerCase() !== 'free');

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: "80px 20px 40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Error Alert */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 24 }}
          />
        )}
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Title level={1} style={{ fontSize: 42, fontWeight: 600, color: "#202123", marginBottom: 16 }}>
            Upgrade your plan
          </Title>
          <Paragraph style={{ fontSize: 18, color: "#6e6e80", marginBottom: 32 }}>
            Get the most out of NeuraPix with more image generations and advanced features
          </Paragraph>
          
          {/* Billing Toggle */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#f4f4f4",
              borderRadius: "12px",
              padding: "4px",
              marginBottom: 40,
            }}
          >
            <Button
              type={selectedBilling === "MONTHLY" ? "primary" : "text"}
              onClick={() => setSelectedBilling("MONTHLY")}
              style={{
                borderRadius: "8px",
                border: "none",
                background: selectedBilling === "MONTHLY" ? "#10a37f" : "transparent",
                color: selectedBilling === "MONTHLY" ? "white" : "#6e6e80",
                fontWeight: 500,
                padding: "8px 16px",
                minWidth: 120,
              }}
            >
              Monthly billing
            </Button>
            <div style={{ position: "relative", display: "inline-block" }}>
              <Button
                type={selectedBilling === "YEARLY" ? "primary" : "text"}
                onClick={() => setSelectedBilling("YEARLY")}
                style={{
                  borderRadius: "8px",
                  border: "none",
                  background: selectedBilling === "YEARLY" ? "#10a37f" : "transparent",
                  color: selectedBilling === "YEARLY" ? "white" : "#6e6e80",
                  fontWeight: 500,
                  padding: "8px 16px",
                  minWidth: 120,
                }}
              >
                Annual billing
              </Button>
              {paidPlans.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    backgroundColor: "#52c41a",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: 8,
                    whiteSpace: "nowrap",
                    zIndex: 1,
                  }}
                >
                  Save {getSavingsPercentage(paidPlans[0].monthlyPrice, paidPlans[0].yearlyPrice)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Plans */}
        <div style={{ paddingBottom: 48 }}>
          {/* Free Plan */}
          {freePlan && (
            <div style={{ marginBottom: 32 }}>
              <Row justify="center">
                <Col xs={24} md={12} lg={8}>
                  <Card
                    style={{
                      background: "#f8f9fa",
                      borderRadius: 16,
                      border: "1px solid #e5e5e5",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ marginBottom: 24 }}>
                      <Title level={3} style={{ margin: 0, color: "#202123", fontSize: 24, fontWeight: 600 }}>
                        {freePlan.name}
                      </Title>
                      <div style={{ fontSize: 32, fontWeight: 700, color: "#202123", margin: "8px 0" }}>
                        Free
                      </div>
                      <Text style={{ color: "#6e6e80", fontSize: 16 }}>
                        {freePlan.description}
                      </Text>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <Space direction="vertical" size="small" style={{ width: "100%" }}>
                        {getPlanFeatures(freePlan).slice(0, 4).map((feature, index) => (
                          <div key={index} style={{ display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
                            <CheckOutlined style={{ color: "#10a37f", fontSize: 14 }} />
                            <Text style={{ color: "#374151", fontSize: 14 }}>{feature}</Text>
                          </div>
                        ))}
                      </Space>
                    </div>

                    <Button
                      disabled
                      size="large"
                      block
                      style={{
                        background: "#e5e5e5",
                        borderColor: "#e5e5e5",
                        color: "#9ca3af",
                        borderRadius: 8,
                        fontWeight: 500,
                        padding: "12px 24px",
                        height: "auto",
                        cursor: "not-allowed",
                      }}
                    >
                      Your current plan
                    </Button>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {/* Paid Plans Grid */}
          <Row gutter={24} justify="center">
            {paidPlans.map((plan) => {
              const currentPrice = selectedBilling === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
              const isProcessing = processingPlan === plan.id;
              const features = getPlanFeatures(plan);
              const isPremium = plan.tier.toLowerCase() === 'premium';

              return (
                <Col key={plan.id} xs={24} md={12} lg={10} style={{ marginBottom: 24 }}>
                  <Card
                    style={{
                      border: isPremium ? "2px solid #10a37f" : "1px solid #e5e5e5",
                      borderRadius: 16,
                      boxShadow: isPremium 
                        ? "0 8px 32px rgba(16, 163, 127, 0.15)" 
                        : "0 4px 12px rgba(0, 0, 0, 0.05)",
                      position: "relative",
                      overflow: "hidden",
                      height: "100%",
                    }}
                  >
                    {isPremium && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          background: "#10a37f",
                          color: "white",
                          padding: "6px 16px",
                          fontSize: 12,
                          fontWeight: 600,
                          borderBottomLeftRadius: 8,
                          zIndex: 1,
                        }}
                      >
                        <CrownOutlined style={{ marginRight: 4 }} />
                        Most popular
                      </div>
                    )}
                    
                    <div style={{ padding: 32, height: "100%", display: "flex", flexDirection: "column" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: 24, textAlign: "center" }}>
                          <Title level={3} style={{ margin: 0, color: "#202123", fontSize: 24, fontWeight: 600 }}>
                            {plan.name}
                          </Title>
                        </div>
                        
                        <div style={{ marginBottom: 32, textAlign: "center" }}>
                          <Space align="baseline">
                            <Text style={{ fontSize: 32, fontWeight: 700, color: "#202123" }}>
                              {formatPrice(currentPrice)}
                            </Text>
                            <Text style={{ color: "#6e6e80", fontSize: 16 }}>
                              /{selectedBilling === 'YEARLY' ? 'year' : 'month'}
                            </Text>
                          </Space>
                          {selectedBilling === 'YEARLY' && (
                            <div style={{ marginTop: 8 }}>
                              <Text style={{ color: "#6e6e80", fontSize: 14 }}>
                                {getMonthlyEquivalent(currentPrice)} per month, billed annually
                              </Text>
                            </div>
                          )}
                          <div style={{ marginTop: 12 }}>
                            <Text style={{ color: "#6e6e80", fontSize: 16 }}>
                              {plan.description}
                            </Text>
                          </div>
                        </div>

                        <Space direction="vertical" size="small" style={{ width: "100%", marginBottom: 32 }}>
                          {features.map((feature, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <CheckOutlined style={{ color: "#10a37f", fontSize: 14 }} />
                              <Text style={{ color: "#374151", fontSize: 14 }}>{feature}</Text>
                            </div>
                          ))}
                        </Space>
                      </div>
                      
                      <div>
                        <Button
                          type="primary"
                          size="large"
                          block
                          loading={isProcessing}
                          disabled={!user || !(fullUser?.id || user?.id)}
                          onClick={() => handlePlanPurchase(plan)}
                          style={{
                            background: isPremium ? "#10a37f" : "#202123",
                            borderColor: isPremium ? "#10a37f" : "#202123",
                            borderRadius: 8,
                            fontWeight: 500,
                            padding: "12px 24px",
                            height: "auto",
                          }}
                          icon={!isProcessing && <ArrowRightOutlined />}
                        >
                          {isProcessing 
                            ? 'Processing...' 
                            : !user 
                              ? 'Sign in to upgrade' 
                              : !(fullUser?.id || user?.id)
                                ? 'Loading user data...'
                                : `Upgrade to ${plan.name}`
                          }
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* FAQ Section */}
          <div style={{ marginTop: 64, maxWidth: 600, margin: "64px auto 0" }}>
            <Title level={2} style={{ textAlign: "center", marginBottom: 32, color: "#202123" }}>
              Frequently asked questions
            </Title>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Title level={4} style={{ margin: 0, marginBottom: 8, color: "#202123", fontSize: 16, fontWeight: 600 }}>
                  Can I cancel my subscription anytime?
                </Title>
                <Paragraph style={{ color: "#6e6e80", margin: 0 }}>
                  Yes, you can cancel your subscription at any time from your account settings. There are no cancellation fees.
                </Paragraph>
              </div>
              <div>
                <Title level={4} style={{ margin: 0, marginBottom: 8, color: "#202123", fontSize: 16, fontWeight: 600 }}>
                  What payment methods do you accept?
                </Title>
                <Paragraph style={{ color: "#6e6e80", margin: 0 }}>
                  We accept all major credit cards and bank transfers through our secure payment provider PayOS.
                </Paragraph>
              </div>
              <div>
                <Title level={4} style={{ margin: 0, marginBottom: 8, color: "#202123", fontSize: 16, fontWeight: 600 }}>
                  Do you offer refunds?
                </Title>
                <Paragraph style={{ color: "#6e6e80", margin: 0 }}>
                  Yes, we offer a 30-day money-back guarantee for all paid subscriptions.
                </Paragraph>
              </div>
              <div>
                <Title level={4} style={{ margin: 0, marginBottom: 8, color: "#202123", fontSize: 16, fontWeight: 600 }}>
                  Can I change my plan later?
                </Title>
                <Paragraph style={{ color: "#6e6e80", margin: 0 }}>
                  Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </Paragraph>
              </div>
            </Space>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 48, textAlign: "center", padding: "32px 0" }}>
            <Paragraph style={{ color: "#6e6e80", fontSize: 14, marginBottom: 16 }}>
              Cancel anytime. No setup fees. Plans can be changed or cancelled at any time.
            </Paragraph>
            <Paragraph style={{ color: "#6e6e80", fontSize: 14 }}>
              Need help choosing? <Button type="link" style={{ padding: 0, fontSize: 14 }}>Contact our sales team</Button>
            </Paragraph>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;