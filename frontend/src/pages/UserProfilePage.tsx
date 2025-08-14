import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Avatar,
  Typography,
  Button,
  Tabs,
  Form,
  Input,
  Statistic,
  Progress,
  Tag,
  Space,
  Divider,
  Switch,
  Spin,
  message,
  Upload,
  Table,
  Badge,
  Empty,
  Pagination,
  DatePicker,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import { formatVND } from "../utils/currency";
import {
  UserOutlined,
  CameraOutlined,
  SaveOutlined,
  PictureOutlined,
  CrownOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  CreditCardOutlined,
  DownloadOutlined,
  LoadingOutlined,
  HistoryOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { getUserByEmail, updateUser } from "../services/userApi";
import { subscriptionApi, type Subscription } from "../services/subscriptionApi";
import { avatarApi } from "../services/avatarApi";
import { ChangePasswordModal } from "../components/ChangePasswordModal";
import { UpgradePaymentModal } from "../components/UpgradePaymentModal";
import { transactionApi } from "../services/transactionApi";
import { usageApi, type MonthlyUsageResponse } from "../services/usageApi";
import type { User } from "../types/auth";
import type { Transaction } from "../types/transaction";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export const UserProfilePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [stats, setStats] = useState({
    imagesGenerated: 0,
    favoriteImages: 0,
    downloadsThisMonth: 0,
    totalLimit: 0,
    imagesRemaining: 0,
  });
  
  // Monthly usage state
  const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsageResponse | null>(null);
  
  // Avatar upload states
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  // Change password modal state
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  
  // Upgrade payment modal state
  const [upgradePaymentModalVisible, setUpgradePaymentModalVisible] = useState(false);
  
  // Transaction states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionPage, setTransactionPage] = useState(0);
  const [transactionTotal, setTransactionTotal] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.email) {
        try {
          setLoading(true);
          
          // Fetch user profile
          const fetchedUser = await getUserByEmail(user.email);
          setCurrentUser(fetchedUser);
          form.setFieldsValue(fetchedUser);
          
          // Fetch subscription data if user has ID
          if (fetchedUser.id) {
            await fetchSubscriptionData(fetchedUser.id);
            await fetchUserStats(fetchedUser.id);
            await fetchMonthlyUsage(fetchedUser.id);
            await fetchUserTransactions(fetchedUser.id);
          }
          
        } catch (error) {
          message.error("Failed to fetch user profile.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user?.email, form]);

  const fetchSubscriptionData = async (userId: number) => {
    try {
      setSubscriptionLoading(true);
      const userSubscription = await subscriptionApi.getUserSubscription(userId);
      setSubscription(userSubscription);
    } catch (error) {
      console.warn("No active subscription found or failed to fetch subscription:", error);
      // Don't show error message for no subscription - it's normal
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const fetchUserStats = async (_userId: number) => {
    try {
      // Mock stats for now - replace with actual API calls
      setStats({
        imagesGenerated: Math.floor(Math.random() * 150) + 20,
        favoriteImages: Math.floor(Math.random() * 25) + 5,
        downloadsThisMonth: Math.floor(Math.random() * 80) + 10,
        totalLimit: subscription?.tier === 'PREMIUM' ? -1 : subscription?.tier === 'BASIC' ? 50 : 5,
        imagesRemaining: subscription?.tier === 'PREMIUM' ? -1 : Math.floor(Math.random() * 30) + 5,
      });
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  };

  const fetchMonthlyUsage = async (userId: number) => {
    try {
      const monthlyUsageData = await usageApi.getMonthlyUsage(userId);
      setMonthlyUsage(monthlyUsageData);
      
      // Update stats with real monthly usage data
      setStats(prevStats => ({
        ...prevStats,
        imagesGenerated: monthlyUsageData.usage,
        imagesRemaining: monthlyUsageData.remaining,
        totalLimit: monthlyUsageData.remaining === -1 ? -1 : monthlyUsageData.usage + monthlyUsageData.remaining,
      }));
    } catch (error) {
      console.error("Failed to fetch monthly usage:", error);
      // Don't show error message to user - fallback to mock data
    }
  };

  const fetchUserTransactions = async (userId: number, page: number = 0) => {
    try {
      setTransactionLoading(true);
      const response = await transactionApi.getUserTransactions(userId, page, 10);
      setTransactions(response.data);
      setTransactionTotal(response.pagination?.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch user transactions:", error);
      message.error("Failed to load transaction history");
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleUpgradeSuccess = async () => {
    // Refresh subscription data after successful upgrade
    if (currentUser?.id) {
      await fetchSubscriptionData(currentUser.id);
      await fetchMonthlyUsage(currentUser.id);
      await fetchUserTransactions(currentUser.id);
    }
    setUpgradePaymentModalVisible(false);
    message.success('Subscription upgraded successfully!');
  };

  const handleSaveProfile = async (values: Record<string, unknown>) => {
    if (!currentUser?.id) {
      message.error("User ID not found");
      return;
    }

    try {
      setLoading(true);
      
      // Prepare the update payload
      const updatePayload = {
        firstName: values.firstName as string,
        lastName: values.lastName as string,
        username: values.username as string,
        email: values.email as string, // Note: email updates might require verification
        bio: values.bio as string,
        phoneNumber: values.phoneNumber as string,
        location: values.location as string,
        language: values.language as string,
        timezone: values.timezone as string,
        website: values.website as string,
        dateOfBirth: values.dateOfBirth ? (values.dateOfBirth as any).format('YYYY-MM-DD') : undefined,
      };

      // Call the update API
      const updatedUser = await updateUser(currentUser.id, updatePayload);
      
      // Update local state
      setCurrentUser(updatedUser);
      
      // Update form values with the response
      form.setFieldsValue(updatedUser);
      
      // Update global auth context
      await refreshUser();
      
      message.success("Profile updated successfully!");
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      message.error(errorMessage);
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (info: any) => {
    const { file } = info;

    if (file.status === 'uploading') {
      setAvatarUploading(true);
      return;
    }

    if (file.status === 'done' || file.originFileObj) {
      try {
        setAvatarUploading(true);
        const fileToUpload = file.originFileObj || (file as File);
        
        if (!currentUser?.id) {
          message.error("User ID not found");
          return;
        }

        const updatedUser = await avatarApi.uploadAvatar(currentUser.id, fileToUpload);
        
        // Update current user state
        setCurrentUser(updatedUser);
        
        // Update form values
        form.setFieldsValue(updatedUser);
        
        // Refresh the global auth context so header avatar updates
        await refreshUser();
        
        message.success("Avatar updated successfully!");
        
      } catch (error: any) {
        console.error("Avatar upload error:", error);
        message.error(error.message || "Failed to upload avatar");
      } finally {
        setAvatarUploading(false);
      }
    }

    if (file.status === 'error') {
      setAvatarUploading(false);
      message.error("Avatar upload failed");
    }
  };

  const beforeAvatarUpload = (file: File) => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }

    // Validate file size (5MB)
    const isLessThan5MB = file.size / 1024 / 1024 < 5;
    if (!isLessThan5MB) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }

    return true;
  };


  // Helper functions to handle missing properties
  const getUserDisplayName = (user: User) => {
    if (user.name) return user.name;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.username) return user.username;
    return user.email.split('@')[0];
  };

  const getUserStats = (user: User) => ({
    imagesGenerated: stats.imagesGenerated || user.imagesGenerated || 0,
    favoriteImages: stats.favoriteImages || user.favoriteImages || 0,
    downloadsThisMonth: stats.downloadsThisMonth || user.downloadsThisMonth || 0,
    totalLimit: stats.totalLimit || user.totalLimit || getDefaultLimit(),
    imagesRemaining: stats.imagesRemaining || user.imagesRemaining || getDefaultLimit(),
  });

  const getDefaultLimit = () => {
    if (subscription?.tier === 'PREMIUM') return -1; // Unlimited
    if (subscription?.tier === 'BASIC') return 50;
    return 5; // Free tier
  };

  const getSubscriptionTier = () => {
    return subscription?.tier || currentUser?.subscriptionTier || 'FREE';
  };

  const getUserProfile = (user: User) => ({
    ...user,
    name: getUserDisplayName(user),
    bio: user.bio || `${getSubscriptionTier() === 'FREE' ? 'Free' : getSubscriptionTier()} user creating stunning visuals with NEURAPIX.`,
    avatar: user.avatarUrl || undefined, // Map avatarUrl to avatar
    plan: getSubscriptionTier(),
    joinDate: user.joinDate || new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    }),
    username: user.username || user.email.split('@')[0],
    ...getUserStats(user),
  });

  if (loading) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 128px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 128px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        }}
      >
        <h2>User not found.</h2>
      </div>
    );
  }

  // Get processed user profile with fallbacks
  const userProfile = getUserProfile(currentUser);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 128px)",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Profile Header */}
        <Card
          style={{
            marginBottom: 24,
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "40px 24px" }}>
            <Row>
              <Col span={24}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <Upload
                      name="avatar"
                      listType="picture-circle"
                      className="avatar-uploader"
                      showUploadList={false}
                      beforeUpload={beforeAvatarUpload}
                      onChange={handleAvatarUpload}
                      customRequest={({ onSuccess }) => {
                        // Use custom request to handle file directly
                        setTimeout(() => {
                          onSuccess?.("ok");
                        }, 0);
                      }}
                      style={{ display: "inline-block" }}
                    >
                      {avatarUploading ? (
                        <div style={{ 
                          width: 120, 
                          height: 120, 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          border: "4px solid #0079FF",
                          borderRadius: "50%"
                        }}>
                          <LoadingOutlined style={{ fontSize: 24, color: "#0079FF" }} />
                        </div>
                      ) : (
                        <div style={{ position: "relative" }}>
                          <Avatar
                            size={120}
                            src={userProfile.avatar}
                            icon={<UserOutlined />}
                            style={{
                              border: "4px solid #0079FF",
                              boxShadow: "0 8px 32px rgba(0, 121, 255, 0.2)",
                              cursor: "pointer",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: "#0079FF",
                              color: "white",
                              border: "2px solid white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            <CameraOutlined style={{ fontSize: 14 }} />
                          </div>
                        </div>
                      )}
                    </Upload>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
                        {userProfile.name}
                      </Title>
                    </div>
                    <Text style={{ color: "#64748b", display: "block", marginBottom: 12 }}>
                      {userProfile.email}
                    </Text>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                      }}
                    >
                      <Tag color="blue" style={{ margin: 0 }}>
                        {userProfile.plan} Plan
                      </Tag>
                      <Text style={{ color: "#64748b" }}>
                        Joined {userProfile.joinDate}
                      </Text>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Profile Content */}
        <Tabs
          defaultActiveKey="overview"
          size="large"
          style={{
            background: "white",
            borderRadius: 16,
            padding: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <TabPane key="overview" tab="Overview">
            <Row gutter={[24, 24]}>
              {/* Stats Cards */}
              <Col xs={24} md={12}>
                <Card
                  style={{
                    textAlign: "center",
                    borderRadius: 12,
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Statistic
                    title="Images Generated"
                    value={userProfile.imagesGenerated}
                    prefix={<PictureOutlined style={{ color: "#0079FF" }} />}
                    valueStyle={{ color: "#0079FF", fontSize: 24, fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  title="Monthly Usage"
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Statistic
                        title="Images This Month"
                        value={monthlyUsage?.usage ?? userProfile.imagesGenerated}
                        valueStyle={{ color: "#0079FF", fontSize: 20, fontWeight: 600 }}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Statistic
                        title="Remaining"
                        value={
                          monthlyUsage?.remaining === -1 ? "Unlimited" : 
                          (monthlyUsage?.remaining ?? userProfile.imagesRemaining)
                        }
                        valueStyle={{ 
                          color: (monthlyUsage?.remaining ?? userProfile.imagesRemaining) === -1 ? "#52c41a" : "#0079FF", 
                          fontSize: 20, 
                          fontWeight: 600 
                        }}
                      />
                    </Col>
                  </Row>
                  <div style={{ marginTop: 16 }}>
                    <Progress
                      percent={
                        monthlyUsage ? 
                          (monthlyUsage.remaining === -1 ? 0 : 
                           Math.min((monthlyUsage.usage / (monthlyUsage.usage + monthlyUsage.remaining)) * 100, 100)) :
                          (userProfile.totalLimit === -1 ? 0 : 
                           Math.min((userProfile.imagesGenerated / userProfile.totalLimit) * 100, 100))
                      }
                      strokeColor="#0079FF"
                      trailColor="#f0f0f0"
                      strokeWidth={8}
                      format={() => 
                        monthlyUsage ? 
                          (monthlyUsage.remaining === -1 ? "Unlimited" : `${monthlyUsage.remaining} left`) :
                          (userProfile.totalLimit === -1 ? "Unlimited" : `${userProfile.imagesRemaining} left`)
                      }
                    />
                  </div>
                </Card>
              </Col>


              {/* Credits Information */}
              <Col span={24}>
                <Card
                  title="Credits"
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Statistic
                        title="Available Credits"
                        value={currentUser.credits || 0}
                        prefix="💰"
                        valueStyle={{ color: "#52c41a", fontSize: 24, fontWeight: 700 }}
                      />
                    </Col>
                    <Col xs={24} md={12}>
                      <Statistic
                        title="Subscription Plan"
                        value={subscriptionLoading ? "Loading..." : getSubscriptionTier()}
                        prefix={subscriptionLoading ? <Spin size="small" /> : <CrownOutlined />}
                        valueStyle={{ 
                          color: getSubscriptionTier() === 'FREE' ? "#64748b" : "#0079FF", 
                          fontSize: 24, 
                          fontWeight: 700 
                        }}
                      />
                      {subscription && (
                        <div style={{ marginTop: 8, fontSize: 14, color: "#64748b" }}>
                          <div>Status: <Tag color="success">{subscription.status}</Tag></div>
                          <div style={{ marginTop: 4 }}>
                            Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card>
              </Col>
              
              {/* Subscription Details Card */}
              {subscription && (
                <Col xs={24}>
                  <Card 
                    title={
                      <Space>
                        <CrownOutlined style={{ color: "#0079FF" }} />
                        <span>Subscription Details</span>
                      </Space>
                    }
                    loading={subscriptionLoading}
                  >
                    <Row gutter={[24, 16]}>
                      <Col xs={24} sm={12} md={8}>
                        <Space direction="vertical" size={2}>
                          <Text type="secondary">Plan</Text>
                          <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
                            {subscription.tier}
                          </Tag>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Space direction="vertical" size={2}>
                          <Text type="secondary">Status</Text>
                          <Tag color="success">{subscription.status}</Tag>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Space direction="vertical" size={2}>
                          <Text type="secondary">Billing Cycle</Text>
                          <Text>{subscription.billingCycle === 'YEARLY' ? 'Annual' : 'Monthly'}</Text>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Space direction="vertical" size={2}>
                          <Text type="secondary">Price</Text>
                          <Text strong style={{ color: "#0079FF" }}>
                            {formatVND(subscription.price)}
                            {subscription.billingCycle === 'YEARLY' ? '/year' : '/month'}
                          </Text>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Space direction="vertical" size={2}>
                          <Text type="secondary">Started</Text>
                          <Text>{new Date(subscription.startDate).toLocaleDateString()}</Text>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Space direction="vertical" size={2}>
                          <Text type="secondary">Next Billing</Text>
                          <Text>{new Date(subscription.nextBillingDate).toLocaleDateString()}</Text>
                        </Space>
                      </Col>
                    </Row>
                    <Divider />
                    <Space>
                      <Button 
                        type="primary" 
                        onClick={() => navigate('/subscription')}
                        icon={<SettingOutlined />}
                      >
                        Manage Subscription
                      </Button>
                      <Button onClick={() => navigate('/billing')}>
                        View Billing History
                      </Button>
                    </Space>
                  </Card>
                </Col>
              )}
            </Row>
          </TabPane>

          <TabPane key="settings" tab="Settings">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card title="Account Settings" style={{ height: "100%" }}>
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Text strong>Email Notifications</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Receive updates about your account
                        </Text>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Divider style={{ margin: "12px 0" }} />
                    <Button
                      icon={<SecurityScanOutlined />}
                      block
                      onClick={() => setChangePasswordModalVisible(true)}
                      style={{
                        textAlign: "left",
                        height: "auto",
                        padding: "12px 16px",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#0079FF";
                        e.currentTarget.style.color = "#0079FF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d9d9d9";
                        e.currentTarget.style.color = "rgba(0, 0, 0, 0.88)";
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>Change Password</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          Update your account password
                        </div>
                      </div>
                    </Button>
                    {/* Temporarily disabled upgrade plan feature */}
                    {/* <Button
                      icon={<CrownOutlined />}
                      block
                      onClick={() => navigate("/subscription")}
                      style={{
                        textAlign: "left",
                        height: "auto",
                        padding: "12px 16px",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#0079FF";
                        e.currentTarget.style.color = "#0079FF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d9d9d9";
                        e.currentTarget.style.color = "rgba(0, 0, 0, 0.88)";
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>Manage Subscription Plan</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          Upgrade or manage your subscription
                        </div>
                      </div>
                    </Button> */}
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane key="subscription" tab="Subscription">
            <Row gutter={[24, 24]}>
              {/* Current Subscription Status */}
              {subscription && (
                <Col xs={24}>
                  <Card 
                    title={
                      <Space>
                        <CrownOutlined style={{ color: "#0079FF" }} />
                        <span>Current Subscription</span>
                      </Space>
                    }
                    style={{
                      borderRadius: 12,
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <Row gutter={[24, 16]}>
                      <Col xs={24} sm={12} md={8}>
                        <Statistic
                          title="Plan"
                          value={subscription.tier}
                          prefix={<CrownOutlined />}
                          valueStyle={{ 
                            color: subscription.tier === 'PREMIUM' ? "#0079FF" : "#52c41a",
                            fontSize: 20,
                            fontWeight: 700
                          }}
                        />
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Statistic
                          title="Status"
                          value={subscription.status}
                          valueStyle={{ 
                            color: subscription.status === 'ACTIVE' ? "#52c41a" : "#ff4d4f",
                            fontSize: 20,
                            fontWeight: 700
                          }}
                        />
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Statistic
                          title="Next Billing"
                          value={new Date(subscription.nextBillingDate).toLocaleDateString()}
                          valueStyle={{ fontSize: 16, fontWeight: 600 }}
                        />
                      </Col>
                    </Row>
                    <Divider />
                    <Space wrap>
                      {/* Temporarily disabled upgrade plan feature */}
                      {/* <Button 
                        type="primary" 
                        icon={<SettingOutlined />}
                        onClick={() => handleUpgradePlan()}
                      >
                        Upgrade Plan
                      </Button> */}
                      <Button 
                        icon={<CreditCardOutlined />}
                        onClick={() => navigate('/billing')}
                      >
                        Billing History
                      </Button>
                    </Space>
                  </Card>
                </Col>
              )}

              {/* No Active Subscription */}
              {!subscription && !subscriptionLoading && (
                <Col xs={24}>
                  <Card
                    style={{
                      borderRadius: 12,
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                      textAlign: "center",
                      padding: "40px 24px",
                    }}
                  >
                    <CrownOutlined 
                      style={{ 
                        fontSize: 48, 
                        color: "#0079FF", 
                        marginBottom: 16 
                      }} 
                    />
                    <Title level={3}>No Active Subscription</Title>
                    <Text style={{ color: "#64748b", fontSize: 16, display: "block", marginBottom: 24 }}>
                      Upgrade to a premium plan to unlock unlimited image generation and advanced features
                    </Text>
                    <Button 
                      type="primary" 
                      size="large"
                      icon={<CrownOutlined />}
                      onClick={() => navigate('/pricing')}
                      style={{
                        background: "#0079FF",
                        borderRadius: 8,
                        fontWeight: 600,
                        height: 48,
                        paddingLeft: 32,
                        paddingRight: 32,
                      }}
                    >
                      View Plans & Pricing
                    </Button>
                  </Card>
                </Col>
              )}

              {/* Subscription Loading */}
              {subscriptionLoading && (
                <Col xs={24}>
                  <Card style={{ textAlign: "center", padding: "40px" }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>Loading subscription details...</div>
                  </Card>
                </Col>
              )}

              {/* Usage & Benefits */}
              <Col xs={24}>
                <Card 
                  title="Plan Benefits & Usage"
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ fontSize: 16 }}>Current Plan: {getSubscriptionTier()}</Text>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <Text>Daily Image Limit:</Text>
                        <div style={{ marginTop: 8 }}>
                          <Progress
                            percent={subscription?.tier === 'PREMIUM' ? 0 : Math.min((stats.imagesGenerated / (subscription?.tier === 'BASIC' ? 50 : 5)) * 100, 100)}
                            strokeColor="#0079FF"
                            format={() => subscription?.tier === 'PREMIUM' ? 'Unlimited' : `${stats.imagesRemaining} remaining`}
                          />
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} md={12}>
                      <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ fontSize: 16 }}>What's Included:</Text>
                      </div>
                      <ul style={{ paddingLeft: 20, margin: 0 }}>
                        {getSubscriptionTier() === 'FREE' && (
                          <>
                            <li>5 images per day</li>
                            <li>Basic image quality</li>
                            <li>Standard support</li>
                          </>
                        )}
                        {getSubscriptionTier() === 'BASIC' && (
                          <>
                            <li>50 images per day</li>
                            <li>High image quality</li>
                            <li>Priority support</li>
                            <li>Advanced filters</li>
                          </>
                        )}
                        {getSubscriptionTier() === 'PREMIUM' && (
                          <>
                            <li>Unlimited images</li>
                            <li>Ultra-high quality</li>
                            <li>24/7 premium support</li>
                            <li>All advanced features</li>
                            <li>API access</li>
                          </>
                        )}
                      </ul>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane key="transactions" tab="Transactions">
            <Row gutter={[24, 24]}>
              {/* Transaction Statistics */}
              <Col xs={24}>
                <Card 
                  title={
                    <Space>
                      <HistoryOutlined style={{ color: "#0079FF" }} />
                      <span>Transaction History</span>
                    </Space>
                  }
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                  }}
                  extra={
                    <Button 
                      icon={<DownloadOutlined />}
                      onClick={() => transactionApi.exportTransactionsToCSV(transactions, `transactions-${new Date().toISOString().split('T')[0]}.csv`)}
                      disabled={transactions.length === 0}
                    >
                      Export CSV
                    </Button>
                  }
                >
                  {transactionLoading ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                      <Spin size="large" />
                      <div style={{ marginTop: 16 }}>Loading transactions...</div>
                    </div>
                  ) : transactions.length === 0 ? (
                    <Empty
                      description="No transactions found"
                      style={{ padding: "40px 0" }}
                    />
                  ) : (
                    <>
                      <Table
                        dataSource={transactions}
                        rowKey="id"
                        pagination={false}
                        scroll={{ x: 800 }}
                        columns={[
                          {
                            title: 'Date',
                            dataIndex: 'createdAt',
                            key: 'createdAt',
                            width: 120,
                            render: (date: string) => new Date(date).toLocaleDateString(),
                            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                          },
                          {
                            title: 'Order Code',
                            dataIndex: 'orderCode',
                            key: 'orderCode',
                            width: 120,
                          },
                          {
                            title: 'Amount',
                            dataIndex: 'amount',
                            key: 'amount',
                            width: 120,
                            render: (amount: number, record: Transaction) => 
                              transactionApi.formatAmount(amount, record.currency),
                            sorter: (a, b) => a.amount - b.amount,
                          },
                          {
                            title: 'Status',
                            dataIndex: 'status',
                            key: 'status',
                            width: 100,
                            render: (status: string) => (
                              <Badge 
                                status={transactionApi.getStatusBadgeType(status)} 
                                text={status}
                              />
                            ),
                            filters: [
                              { text: 'Paid', value: 'PAID' },
                              { text: 'Pending', value: 'PENDING' },
                              { text: 'Cancelled', value: 'CANCELLED' },
                              { text: 'Failed', value: 'FAILED' },
                            ],
                            onFilter: (value, record) => record.status === value,
                          },
                          {
                            title: 'Type',
                            dataIndex: 'type',
                            key: 'type',
                            width: 150,
                            render: (type: string) => (
                              <Tag color={type === 'SUBSCRIPTION_PAYMENT' ? 'blue' : type === 'SUBSCRIPTION_RENEWAL' ? 'green' : 'default'}>
                                {type.replace(/_/g, ' ')}
                              </Tag>
                            ),
                            filters: [
                              { text: 'Subscription Payment', value: 'SUBSCRIPTION_PAYMENT' },
                              { text: 'Subscription Renewal', value: 'SUBSCRIPTION_RENEWAL' },
                              { text: 'One Time Payment', value: 'ONE_TIME_PAYMENT' },
                            ],
                            onFilter: (value, record) => record.type === value,
                          },
                          {
                            title: 'Payment Method',
                            dataIndex: 'paymentMethod',
                            key: 'paymentMethod',
                            width: 120,
                            render: (method: string) => method || 'N/A',
                          },
                          {
                            title: 'Description',
                            dataIndex: 'description',
                            key: 'description',
                            ellipsis: true,
                            render: (desc: string) => desc || 'No description',
                          },
                        ]}
                      />
                      
                      {transactionTotal > 10 && (
                        <div style={{ textAlign: 'center', marginTop: 24 }}>
                          <Pagination
                            current={transactionPage + 1}
                            total={transactionTotal}
                            pageSize={10}
                            onChange={(page) => {
                              setTransactionPage(page - 1);
                              if (currentUser?.id) {
                                fetchUserTransactions(currentUser.id, page - 1);
                              }
                            }}
                            showSizeChanger={false}
                            showQuickJumper
                            showTotal={(total, range) =>
                              `${range[0]}-${range[1]} of ${total} transactions`
                            }
                          />
                        </div>
                      )}
                    </>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane key="profile" tab="Profile Settings">
            <Card
              title="Edit Profile"
              style={{
                borderRadius: 12,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSaveProfile}
                initialValues={userProfile}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="First Name"
                      name="firstName"
                      rules={[{ required: true, message: "Please input your first name!" }]}
                    >
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Last Name"
                      name="lastName"
                      rules={[{ required: true, message: "Please input your last name!" }]}
                    >
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Username"
                      name="username"
                      rules={[{ required: true, message: "Please input your username!" }]}
                    >
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: "Please input your email!" },
                        { type: "email", message: "Please enter a valid email!" },
                      ]}
                    >
                      <Input size="large" disabled />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Phone Number" name="phoneNumber">
                      <Input
                        size="large"
                        prefix={<PhoneOutlined style={{ color: "#0079FF" }} />}
                        placeholder="Enter your phone number"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Date of Birth" name="dateOfBirth">
                      <DatePicker
                        size="large"
                        style={{ width: "100%" }}
                        placeholder="Select your date of birth"
                        prefix={<CalendarOutlined style={{ color: "#0079FF" }} />}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Location" name="location">
                      <Input
                        size="large"
                        prefix={<EnvironmentOutlined style={{ color: "#0079FF" }} />}
                        placeholder="City, Country"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Language" name="language">
                      <Select
                        size="large"
                        placeholder="Select your preferred language"
                        options={[
                          { value: 'en', label: 'English' },
                          { value: 'vi', label: 'Tiếng Việt' },
                          { value: 'fr', label: 'Français' },
                          { value: 'es', label: 'Español' },
                          { value: 'de', label: 'Deutsch' },
                          { value: 'ja', label: '日本語' },
                          { value: 'ko', label: '한국어' },
                          { value: 'zh', label: '中文' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Timezone" name="timezone">
                      <Select
                        size="large"
                        placeholder="Select your timezone"
                        showSearch
                        options={[
                          { value: 'UTC', label: '(UTC+00:00) Coordinated Universal Time' },
                          { value: 'Asia/Ho_Chi_Minh', label: '(UTC+07:00) Ho Chi Minh City' },
                          { value: 'America/New_York', label: '(UTC-05:00) Eastern Time' },
                          { value: 'America/Los_Angeles', label: '(UTC-08:00) Pacific Time' },
                          { value: 'Europe/London', label: '(UTC+00:00) London' },
                          { value: 'Europe/Paris', label: '(UTC+01:00) Paris' },
                          { value: 'Asia/Tokyo', label: '(UTC+09:00) Tokyo' },
                          { value: 'Asia/Seoul', label: '(UTC+09:00) Seoul' },
                          { value: 'Asia/Shanghai', label: '(UTC+08:00) Shanghai' },
                          { value: 'Australia/Sydney', label: '(UTC+11:00) Sydney' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Website/Portfolio" name="website">
                      <Input
                        size="large"
                        placeholder="https://your-website.com"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Bio" name="bio">
                      <Input.TextArea
                        rows={4}
                        placeholder="Tell us about yourself..."
                        size="large"
                        maxLength={500}
                        showCount
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    size="large"
                    style={{
                      background: "#0079FF",
                      borderRadius: 8,
                      fontWeight: 600,
                    }}
                  >
                    Save Changes
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>
        </Tabs>
      </div>
      
      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={changePasswordModalVisible}
        onCancel={() => setChangePasswordModalVisible(false)}
        onSuccess={() => setChangePasswordModalVisible(false)}
      />

      {/* Upgrade Payment Modal */}
      <UpgradePaymentModal
        visible={upgradePaymentModalVisible}
        onCancel={() => setUpgradePaymentModalVisible(false)}
        onSuccess={handleUpgradeSuccess}
        subscription={subscription}
        currentUser={{
          id: currentUser?.id ?? 0,
          email: currentUser?.email ?? '',
          firstName: currentUser?.firstName,
          lastName: currentUser?.lastName,
          username: currentUser?.username,
        }}
      />
    </div>
  );
};
