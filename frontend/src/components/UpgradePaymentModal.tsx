import React, { useState, useEffect } from "react";
import {
  Modal,
  Steps,
  Button,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Divider,
  message,
  Spin,
  Result,
  QRCode,
  Alert,
} from "antd";
import {
  CrownOutlined,
  ArrowUpOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import type { Subscription } from "../services/subscriptionApi";
import { subscriptionApi } from "../services/subscriptionApi";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const { Title, Text } = Typography;
const { Step } = Steps;

interface UpgradePaymentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  subscription: Subscription | null;
  currentUser: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  };
}

interface TierInfo {
  name: string;
  price: number;
  features: string[];
  color: string;
  popular?: boolean;
}

const tierInfo: Record<string, TierInfo> = {
  FREE: {
    name: "Free",
    price: 0,
    features: ["5 images per day", "Basic quality", "Standard support"],
    color: "#52c41a",
  },
  BASIC: {
    name: "Basic",
    price: 2000, // Updated to match database price
    features: ["50 images per day", "High quality", "Priority support", "Advanced filters"],
    color: "#1890ff",
    popular: true,
  },
  PREMIUM: {
    name: "Premium",
    price: 5000, // Updated to match database price
    features: [
      "Unlimited images",
      "Ultra-high quality",
      "24/7 premium support",
      "All advanced features",
      "API access",
    ],
    color: "#722ed1",
  },
};

export const UpgradePaymentModal: React.FC<UpgradePaymentModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  subscription,
  currentUser,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    checkoutUrl: string;
    paymentLinkId: string;
    qrCode?: string;
  } | null>(null);
  const [upgradeAmount, setUpgradeAmount] = useState(0);
  const [actualTierPrices, setActualTierPrices] = useState<Record<string, number>>({});

  // Fetch actual tier prices from subscription plans API
  useEffect(() => {
    const fetchTierPrices = async () => {
      try {
        const plans = await subscriptionApi.getSubscriptionPlans();
        const prices: Record<string, number> = {};
        
        plans.forEach(plan => {
          if (plan.tier && plan.monthlyPrice !== undefined) {
            // Convert BigDecimal to number if needed
            const price = typeof plan.monthlyPrice === 'number' ? 
              plan.monthlyPrice : 
              parseFloat(plan.monthlyPrice);
            prices[plan.tier] = price;
          }
        });
        
        // Ensure FREE tier is always 0
        prices['FREE'] = 0;
        
        setActualTierPrices(prices);
        console.log('Loaded actual tier prices:', prices);
      } catch (error) {
        console.error('Failed to fetch tier prices:', error);
        // Fallback to tierInfo prices if API fails
      }
    };
    
    if (visible) {
      fetchTierPrices();
    }
  }, [visible]);

  // Reset modal state when opening
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setSelectedTier("");
      setPaymentData(null);
      setUpgradeAmount(0);
      
      // Auto-select next tier
      if (subscription?.tier) {
        const nextTier = getNextTier(subscription.tier);
        if (nextTier) {
          setSelectedTier(nextTier);
          calculateUpgradeAmount(subscription.tier, nextTier);
        }
      }
    }
  }, [visible, subscription, actualTierPrices]);

  const getNextTier = (currentTier: string): string | null => {
    switch (currentTier) {
      case "FREE":
        return "BASIC";
      case "BASIC":
        return "PREMIUM";
      default:
        return null;
    }
  };

  const calculateUpgradeAmount = (currentTier: string, newTier: string) => {
    // Use actual prices from subscription data if available, otherwise fallback to tierInfo
    const currentPrice = actualTierPrices[currentTier] ?? tierInfo[currentTier]?.price ?? 0;
    const newPrice = actualTierPrices[newTier] ?? tierInfo[newTier]?.price ?? 0;
    const amount = newPrice - currentPrice;
    setUpgradeAmount(Math.max(amount, 0));
  };

  const getAvailableUpgrades = () => {
    if (!subscription?.tier) return [];
    
    const currentTier = subscription.tier;
    const upgrades = [];
    
    if (currentTier === "FREE") {
      upgrades.push("BASIC", "PREMIUM");
    } else if (currentTier === "BASIC") {
      upgrades.push("PREMIUM");
    }
    
    return upgrades;
  };

  const handleTierSelection = (tier: string) => {
    setSelectedTier(tier);
    if (subscription?.tier) {
      calculateUpgradeAmount(subscription.tier, tier);
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && selectedTier) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      handleCreatePayment();
    }
  };

  const handleCreatePayment = async () => {
    if (!subscription || !currentUser || !selectedTier) return;
    
    try {
      setLoading(true);
      
      // Create upgrade payment link
      const paymentRequest = {
        userId: currentUser.id,
        subscriptionId: subscription.id,
        currentTier: subscription.tier,
        newTier: selectedTier,
        upgradeAmount: upgradeAmount,
        description: `Upgrade subscription from ${subscription.tier} to ${selectedTier}`,
        buyerEmail: currentUser.email,
        buyerName: currentUser.firstName && currentUser.lastName 
          ? `${currentUser.firstName} ${currentUser.lastName}` 
          : currentUser.username || currentUser.email.split('@')[0],
        reason: "User-requested upgrade via payment",
        upgradeImmediately: true,
        // Explicit return URLs for successful and cancelled payments
        returnUrl: `${window.location.origin}/upgrade/success`,
        cancelUrl: `${window.location.origin}/upgrade/cancel`,
      };

      const response = await axios.post(
        '/api/v2/payments/payos/create-upgrade-payment',
        paymentRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      const result = response.data;
      
      if (result.success) {
        setPaymentData(result);
        setCurrentStep(2);
        message.success('Payment link created successfully!');
      } else {
        message.error(result.message || 'Failed to create payment link');
      }
      
    } catch (error) {
      console.error('Payment creation error:', error);
      message.error('Failed to create upgrade payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    setCurrentStep(3);
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setCurrentStep(0);
    setSelectedTier("");
    setPaymentData(null);
    setUpgradeAmount(0);
    onCancel();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard!');
  };

  const renderTierSelection = () => (
    <div>
      <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
        Choose Your Upgrade Plan
      </Title>
      
      {subscription && (
        <Alert
          message={`Current Plan: ${subscription.tier}`}
          description={`You are currently on the ${subscription.tier} plan. Select a higher tier to upgrade.`}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[16, 16]}>
        {getAvailableUpgrades().map((tier) => {
          const info = tierInfo[tier];
          const isSelected = selectedTier === tier;
          
          return (
            <Col xs={24} sm={12} key={tier}>
              <Card
                hoverable
                className={isSelected ? "selected-tier" : ""}
                onClick={() => handleTierSelection(tier)}
                style={{
                  border: isSelected ? `2px solid ${info.color}` : "1px solid #d9d9d9",
                  borderRadius: 12,
                  position: "relative",
                }}
                bodyStyle={{ padding: 20 }}
              >
                {info.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      right: 16,
                      background: "#ff4d4f",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Popular
                  </div>
                )}
                
                <div style={{ textAlign: "center" }}>
                  <CrownOutlined
                    style={{ fontSize: 32, color: info.color, marginBottom: 12 }}
                  />
                  <Title level={5} style={{ margin: "0 0 8px 0" }}>
                    {info.name}
                  </Title>
                  <Title level={3} style={{ color: info.color, margin: "0 0 16px 0" }}>
                    {(actualTierPrices[tier] ?? info.price).toLocaleString()} VND
                    <Text style={{ fontSize: 14, color: "#666" }}> /month</Text>
                  </Title>
                  
                  <div style={{ textAlign: "left" }}>
                    {info.features.map((feature, index) => (
                      <div key={index} style={{ marginBottom: 8 }}>
                        <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                        <Text>{feature}</Text>
                      </div>
                    ))}
                  </div>
                  
                  {subscription?.tier && (
                    <div style={{ marginTop: 16, textAlign: "center" }}>
                      <Text strong style={{ color: info.color }}>
                        +{((actualTierPrices[tier] ?? info.price) - (actualTierPrices[subscription.tier] ?? (tierInfo[subscription.tier]?.price || 0))).toLocaleString()} VND
                      </Text>
                      <Text style={{ display: "block", fontSize: 12, color: "#666" }}>
                        Upgrade cost
                      </Text>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );

  const renderPaymentConfirmation = () => (
    <div>
      <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
        Confirm Your Upgrade
      </Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col span={12}>
            <Statistic
              title="Current Plan"
              value={subscription?.tier}
              prefix={<CrownOutlined />}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="New Plan"
              value={selectedTier}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: tierInfo[selectedTier]?.color }}
            />
          </Col>
        </Row>
        <Divider />
        <Row gutter={24}>
          <Col span={12}>
            <Statistic
              title="Upgrade Amount"
              value={upgradeAmount}
              suffix="VND"
              valueStyle={{ color: "#ff4d4f", fontSize: 24 }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Next Billing"
              value="Immediate"
              valueStyle={{ color: "#52c41a" }}
            />
          </Col>
        </Row>
      </Card>

      <Alert
        message="Upgrade Details"
        description={
          <div>
            • Your subscription will be upgraded immediately after payment
            • You'll be charged the difference between your current and new plan
            • Your billing cycle will remain the same
            • New features will be available immediately
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
    </div>
  );

  const renderPaymentStep = () => (
    <div style={{ textAlign: "center" }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        Complete Your Payment
      </Title>
      
      {paymentData && (
        <div>
          <Card style={{ marginBottom: 24 }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Title level={5}>Scan QR Code to Pay</Title>
                <QRCode value={paymentData.checkoutUrl} size={200} />
              </div>
              
              <Divider>OR</Divider>
              
              <div>
                <Button
                  type="primary"
                  size="large"
                  icon={<CreditCardOutlined />}
                  onClick={() => window.open(paymentData.checkoutUrl, '_blank')}
                  style={{ marginBottom: 16 }}
                >
                  Pay with PayOS
                </Button>
                <div>
                  <Text
                    copyable={{
                      onCopy: () => copyToClipboard(paymentData.checkoutUrl),
                      icon: <CopyOutlined />,
                    }}
                    style={{ fontSize: 12, color: "#666" }}
                  >
                    {paymentData.checkoutUrl}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
          
          <Alert
            message="Payment Instructions"
            description={
              <div>
                • Complete payment within 15 minutes
                • You'll be automatically redirected after successful payment
                • Your upgrade will be processed immediately
                • You'll receive a confirmation email once complete
              </div>
            }
            type="warning"
            showIcon
          />
        </div>
      )}
    </div>
  );

  const renderSuccessStep = () => (
    <Result
      status="success"
      title="Upgrade Successful!"
      subTitle={`Your subscription has been upgraded to ${selectedTier}. New features are now available.`}
      extra={[
        <Button type="primary" key="console" onClick={handleClose}>
          Continue to Dashboard
        </Button>,
      ]}
    />
  );

  const steps = [
    {
      title: 'Select Plan',
      content: renderTierSelection(),
    },
    {
      title: 'Confirm',
      content: renderPaymentConfirmation(),
    },
    {
      title: 'Payment',
      content: renderPaymentStep(),
    },
    {
      title: 'Complete',
      content: renderSuccessStep(),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <CrownOutlined style={{ color: "#722ed1" }} />
          <span>Upgrade Subscription</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      width={800}
      footer={
        currentStep < 2 ? (
          <Space>
            <Button onClick={handleClose}>Cancel</Button>
            {currentStep > 0 && (
              <Button onClick={() => setCurrentStep(currentStep - 1)}>
                Previous
              </Button>
            )}
            <Button
              type="primary"
              onClick={handleNext}
              disabled={currentStep === 0 && !selectedTier}
              loading={loading}
            >
              {currentStep === 1 ? 'Create Payment' : 'Next'}
            </Button>
          </Space>
        ) : currentStep === 2 ? (
          <Space>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="primary" onClick={handlePaymentComplete}>
              I've Completed Payment
            </Button>
          </Space>
        ) : null
      }
      destroyOnClose
    >
      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} />
        ))}
      </Steps>
      
      <div style={{ minHeight: 400 }}>
        {loading && currentStep === 1 ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Creating payment link...</div>
          </div>
        ) : (
          steps[currentStep].content
        )}
      </div>
    </Modal>
  );
};