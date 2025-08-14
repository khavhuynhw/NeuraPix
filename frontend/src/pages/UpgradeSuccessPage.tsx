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
  Divider,
  Alert,
  Timeline
} from 'antd';
import { 
  CheckCircleOutlined, 
  ArrowUpOutlined,
  CrownOutlined,
  DashboardOutlined,
  RocketOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { paymentApi, type PaymentInfo } from '../services/paymentApi';
import { subscriptionApi, type Subscription } from '../services/subscriptionApi';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph, Text } = Typography;

const UpgradeSuccessPage: React.FC = () => {
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
      setError('Invalid upgrade link - missing order code');
      setLoading(false);
      return;
    }

    loadUpgradeInfo();
  }, [orderCode]);

  const loadUpgradeInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get payment information
      const paymentResponse = await paymentApi.getPaymentInfo(Number(orderCode));
      
      if (paymentResponse.success && paymentResponse.data) {
        setPaymentInfo(paymentResponse.data);
        
        // If payment is successful, get updated subscription info
        if (paymentResponse.data.status === 'PAID' && user?.id) {
          try {
            const subscriptionResponse = await subscriptionApi.getUserSubscription(user.id);
            setSubscription(subscriptionResponse);
            
            // Refresh user context to update tier information
            await refreshUser();
          } catch (subError) {
            console.error('Failed to fetch subscription:', subError);
            // Continue even if subscription fetch fails
          }
        }
      } else {
        setError(paymentResponse.message || 'Failed to load payment information');
      }
    } catch (err) {
      console.error('Error loading upgrade info:', err);
      setError(err instanceof Error ? err.message : 'Failed to load upgrade information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'processing';
      case 'CANCELLED': return 'error';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  const getUpgradeDetails = () => {
    // Extract upgrade details from payment description or metadata if available
    const description = paymentInfo?.description || '';
    const match = description.match(/Upgrade from (\w+) to (\w+)/);
    
    if (match) {
      return {
        fromTier: match[1],
        toTier: match[2]
      };
    }
    
    return null;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text>Loading upgrade information...</Text>
        </Space>
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Upgrade Information Not Found"
        subTitle={error}
        extra={[
          <Button 
            type="primary" 
            key="home" 
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>,
          <Button 
            key="profile" 
            onClick={() => navigate('/profile?tab=subscription')}
          >
            View Subscription
          </Button>
        ]}
      />
    );
  }

  if (paymentInfo?.status === 'PAID') {
    const upgradeDetails = getUpgradeDetails();
    
    return (
      <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
        <Result
          status="success"
          title="Subscription Upgraded Successfully!"
          subTitle={
            upgradeDetails ? 
              `Your subscription has been upgraded from ${upgradeDetails.fromTier} to ${upgradeDetails.toTier}` :
              "Your subscription upgrade is complete"
          }
          extra={[
            <Button 
              type="primary" 
              key="dashboard" 
              icon={<DashboardOutlined />}
              onClick={() => navigate('/profile?tab=subscription')}
            >
              View Subscription
            </Button>,
            <Button 
              key="generate" 
              icon={<RocketOutlined />}
              onClick={() => navigate('/chat')}
            >
              Start Creating
            </Button>
          ]}
        />

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} md={12}>
            <Card title="Payment Details" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Order Code">
                  {paymentInfo.orderCode}
                </Descriptions.Item>
                <Descriptions.Item label="Amount">
                  {paymentInfo.amount.toLocaleString()} VND
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(paymentInfo.status)}>
                    {paymentInfo.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Date">
                  {new Date(paymentInfo.createdAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {subscription && (
            <Col xs={24} md={12}>
              <Card title="Current Subscription" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Plan">
                    <Space>
                      <CrownOutlined style={{ color: '#722ed1' }} />
                      {subscription.tier}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color="success">{subscription.status}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Next Billing">
                    {subscription.nextBillingDate 
                      ? new Date(subscription.nextBillingDate).toLocaleDateString()
                      : 'N/A'
                    }
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          )}
        </Row>

        <Card style={{ marginTop: 24 }} title="What's Next?">
          <Timeline
            items={[
              {
                dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                children: (
                  <div>
                    <Title level={5} style={{ margin: 0 }}>Payment Confirmed</Title>
                    <Text type="secondary">Your upgrade payment has been processed successfully</Text>
                  </div>
                ),
              },
              {
                dot: <ArrowUpOutlined style={{ color: '#1890ff' }} />,
                children: (
                  <div>
                    <Title level={5} style={{ margin: 0 }}>Subscription Upgraded</Title>
                    <Text type="secondary">Your new plan features are now active</Text>
                  </div>
                ),
              },
              {
                dot: <RocketOutlined style={{ color: '#722ed1' }} />,
                children: (
                  <div>
                    <Title level={5} style={{ margin: 0 }}>Start Creating</Title>
                    <Text type="secondary">Enjoy your enhanced features and higher limits</Text>
                  </div>
                ),
              },
            ]}
          />
        </Card>

        <Alert
          message="Upgrade Complete"
          description="Your subscription has been successfully upgraded. You now have access to all features of your new plan. If you have any questions, please contact our support team."
          type="success"
          showIcon
          style={{ marginTop: 24 }}
        />
      </div>
    );
  }

  // Handle other payment statuses
  return (
    <div style={{ padding: '24px', maxWidth: 600, margin: '0 auto' }}>
      <Result
        status={paymentInfo?.status === 'PENDING' ? 'info' : 'error'}
        title={
          paymentInfo?.status === 'PENDING' 
            ? 'Upgrade Payment Pending' 
            : 'Upgrade Payment Failed'
        }
        subTitle={
          paymentInfo?.status === 'PENDING'
            ? 'Your payment is being processed. Please wait a moment and refresh the page.'
            : 'There was an issue processing your upgrade payment. Please try again or contact support.'
        }
        extra={[
          <Button 
            type="primary" 
            key="refresh" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>,
          <Button 
            key="support" 
            onClick={() => navigate('/contact')}
          >
            Contact Support
          </Button>
        ]}
      />

      {paymentInfo && (
        <Card title="Payment Information" style={{ marginTop: 24 }}>
          <Descriptions column={1}>
            <Descriptions.Item label="Order Code">
              {paymentInfo.orderCode}
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              {paymentInfo.amount.toLocaleString()} VND
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(paymentInfo.status)}>
                {paymentInfo.status}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </div>
  );
};

export default UpgradeSuccessPage;