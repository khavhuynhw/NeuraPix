import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Button, 
  Space, 
  Spin, 
  Result, 
  Descriptions,
  Tag,
  Timeline
} from 'antd';
import { 
  CheckCircleOutlined, 
  ReloadOutlined,
  RocketOutlined,
  DashboardOutlined,
  SettingOutlined,
  CrownOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { paymentApi, type PaymentInfo } from '../services/paymentApi';
import { subscriptionApi, type Subscription } from '../services/subscriptionApi';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph, Text } = Typography;

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
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid date';
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
    navigate('/chat');
  };

  const handleManageSubscription = () => {
    navigate('/subscription');
  };

  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <Card
          style={{
            textAlign: 'center',
            maxWidth: 400,
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0, 121, 255, 0.1)',
          }}
        >
          <Space direction="vertical" size="large">
            <Spin size="large" />
            <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
              Activating your subscription
            </Title>
            <Paragraph style={{ color: '#64748b', margin: 0 }}>
              Please wait while we activate your subscription...
            </Paragraph>
          </Space>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <Card
          style={{
            maxWidth: 500,
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0, 121, 255, 0.1)',
          }}
        >
          <Result
            status="error"
            title="Subscription activation failed"
            subTitle={error}
            extra={[
              <Button 
                key="retry" 
                type="primary" 
                icon={<ReloadOutlined />}
                onClick={verifySubscriptionPayment}
              >
                Try again
              </Button>,
              <Button 
                key="support" 
                onClick={() => navigate('/support')}
              >
                Contact support
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Success Header */}
        <Card
          style={{
            textAlign: 'center',
            marginBottom: 24,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #0079FF 0%, #0056B3 100%)',
            color: 'white',
            border: 'none',
          }}
          bodyStyle={{ padding: '40px 24px' }}
        >
          <Space direction="vertical" size="large">
            <CheckCircleOutlined 
              style={{ 
                fontSize: 64, 
                color: '#52c41a',
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: 16
              }} 
            />
            <div>
              <Title level={1} style={{ color: 'white', margin: 0 }}>
                Welcome to {subscription?.tier || 'Premium'}!
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, margin: 0 }}>
                Your subscription is now active and ready to use
              </Paragraph>
            </div>
          </Space>
        </Card>

        {/* Subscription Details Card */}
        {subscription && (
          <Card
            title={
              <Space>
                <CrownOutlined style={{ color: '#0079FF' }} />
                <span>Subscription Details</span>
              </Space>
            }
            style={{ marginBottom: 24, borderRadius: 16 }}
            bodyStyle={{ padding: '24px' }}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Plan">
                    <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                      {subscription.plan?.name || subscription.tier}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Billing">
                    <Text strong>
                      {subscription.billingCycle === 'YEARLY' ? 'Annual' : 'Monthly'} • {formatPrice(subscription.price)}
                      {subscription.billingCycle === 'YEARLY' ? '/year' : '/month'}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Status">
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      {subscription.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Next billing date">
                    <Space>
                      <CalendarOutlined />
                      <Text>
                        {new Date(subscription.nextBillingDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Text>
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>
        )}

        {/* Payment Receipt */}
        {paymentInfo && (
          <Card
            title="Payment Receipt"
            style={{ marginBottom: 24, borderRadius: 16 }}
            bodyStyle={{ padding: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Space direction="vertical" size={2}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Order Code</Text>
                  <Text code style={{ fontSize: 13 }}>{paymentInfo.orderCode}</Text>
                </Space>
              </Col>
              <Col xs={12} sm={6}>
                <Space direction="vertical" size={2}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Amount</Text>
                  <Text strong style={{ color: '#0079FF' }}>{formatPrice(paymentInfo.amount)}</Text>
                </Space>
              </Col>
              <Col xs={12} sm={6}>
                <Space direction="vertical" size={2}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Payment Date</Text>
                  <Text style={{ fontSize: 13 }}>
                    {formatDate(paymentInfo.createdAt)}
                  </Text>
                </Space>
              </Col>
              <Col xs={12} sm={6}>
                <Space direction="vertical" size={2}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Status</Text>
                  <Tag color={paymentInfo.status === 'PAID' ? 'success' : 'default'}>
                    {paymentInfo.status}
                  </Tag>
                </Space>
              </Col>
              {paymentInfo.description && (
                <Col xs={24}>
                  <Space direction="vertical" size={2}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Description</Text>
                    <Text style={{ fontSize: 13 }}>{paymentInfo.description}</Text>
                  </Space>
                </Col>
              )}
              {paymentInfo.currency && paymentInfo.currency !== 'VND' && (
                <Col xs={12} sm={6}>
                  <Space direction="vertical" size={2}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Currency</Text>
                    <Text style={{ fontSize: 13 }}>{paymentInfo.currency}</Text>
                  </Space>
                </Col>
              )}
            </Row>
          </Card>
        )}

        {/* Plan Features */}
        {subscription && (
          <Card
            title={`What's included in ${subscription.tier}`}
            style={{ marginBottom: 24, borderRadius: 16 }}
            bodyStyle={{ padding: '24px' }}
          >
            <Row gutter={[16, 12]}>
              {getTierFeatures(subscription.tier).map((feature, index) => (
                <Col key={index} xs={24} md={12}>
                  <Space align="start">
                    <CheckCircleOutlined style={{ color: '#52c41a', marginTop: 2 }} />
                    <Text style={{ fontSize: 14 }}>{feature}</Text>
                  </Space>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Action Buttons */}
        <Card style={{ marginBottom: 24, borderRadius: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Button
                type="primary"
                size="large"
                block
                icon={<RocketOutlined />}
                onClick={handleStartGenerating}
                style={{
                  height: 48,
                  background: 'linear-gradient(135deg, #0079FF 0%, #0056B3 100%)',
                  border: 'none',
                  borderRadius: 8,
                }}
              >
                Start Creating
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button
                size="large"
                block
                icon={<DashboardOutlined />}
                onClick={handleViewDashboard}
                style={{
                  height: 48,
                  borderRadius: 8,
                }}
              >
                View Dashboard
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button
                size="large"
                block
                icon={<SettingOutlined />}
                onClick={handleManageSubscription}
                style={{
                  height: 48,
                  borderRadius: 8,
                }}
              >
                Manage Subscription
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Next Steps */}
        <Card
          title="What's next?"
          style={{ 
            marginBottom: 24, 
            borderRadius: 16,
            background: 'linear-gradient(135deg, #e6f3ff 0%, #f0f8ff 100%)',
            border: '1px solid #b3d9ff'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Timeline
            items={[
              {
                dot: <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#0079FF',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>1</div>,
                children: (
                  <div>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>Start generating images</Title>
                    <Text type="secondary">Use our AI image generator with your new plan limits</Text>
                  </div>
                ),
              },
              {
                dot: <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#0079FF',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>2</div>,
                children: (
                  <div>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>Explore advanced features</Title>
                    <Text type="secondary">Try high-resolution outputs and priority processing</Text>
                  </div>
                ),
              },
              {
                dot: <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#0079FF',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>3</div>,
                children: (
                  <div>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>Check your email</Title>
                    <Text type="secondary">We've sent a confirmation email with your receipt</Text>
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* Footer */}
        <Card style={{ textAlign: 'center', borderRadius: 16 }}>
          <Space direction="vertical" size="small">
            <Paragraph style={{ fontSize: 16, color: '#64748b', margin: 0 }}>
              Thank you for choosing NeuralPix! We're excited to see what you'll create.
            </Paragraph>
            <Paragraph style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>
              Need help getting started?{' '}
              <a href="/support" style={{ color: '#0079FF', fontWeight: 500 }}>
                Contact support
              </a>{' '}
              or{' '}
              <a href="/docs" style={{ color: '#0079FF', fontWeight: 500 }}>
                view our docs
              </a>
            </Paragraph>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;