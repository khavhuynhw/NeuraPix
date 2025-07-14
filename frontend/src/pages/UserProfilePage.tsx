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
  Badge,
  Switch,
  Spin,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  CameraOutlined,
  SaveOutlined,
  PictureOutlined,
  CrownOutlined,
  SettingOutlined,
  BellOutlined,
  SecurityScanOutlined,
  CreditCardOutlined,
  DownloadOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { getUserByEmail } from "../services/userApi";
import type { User } from "../types/auth";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export const UserProfilePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (user?.email) {
        try {
          setLoading(true);
          const fetchedUser = await getUserByEmail(user.email);
          setCurrentUser(fetchedUser);
          form.setFieldsValue(fetchedUser);
        } catch (error) {
          message.error("Failed to fetch user profile.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUser();
  }, [user?.email, form]);

  const handleSaveProfile = (values: any) => {
    console.log("Saving profile:", values);
    // Handle save logic here
  };

  const handleAvatarUpload = (info: any) => {
    console.log("Avatar upload:", info);
    // Handle avatar upload logic here
  };

  // Helper functions to handle missing properties
  const getUserDisplayName = (user: User) => {
    if (user.name) return user.name;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.username) return user.username;
    return user.email.split('@')[0];
  };

  const getUserStats = (user: User) => ({
    imagesGenerated: user.imagesGenerated || 0,
    favoriteImages: user.favoriteImages || 0,
    downloadsThisMonth: user.downloadsThisMonth || 0,
    totalLimit: user.totalLimit || (user.subscriptionTier === 'FREE' ? 10 : 500),
    imagesRemaining: user.imagesRemaining || ((user.totalLimit || (user.subscriptionTier === 'FREE' ? 10 : 500)) - (user.imagesGenerated || 0)),
  });

  const getUserProfile = (user: User) => ({
    ...user,
    name: getUserDisplayName(user),
    bio: user.bio || `${user.subscriptionTier === 'FREE' ? 'Free' : 'Premium'} user creating stunning visuals with NEURAPIX.`,
    avatar: user.avatarUrl || undefined, // Map avatarUrl to avatar
    plan: user.subscriptionTier || 'FREE',
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
                    <Avatar
                      size={120}
                      src={userProfile.avatar}
                      icon={<UserOutlined />}
                      style={{
                        border: "4px solid #0079FF",
                        boxShadow: "0 8px 32px rgba(0, 121, 255, 0.2)",
                      }}
                    />
                    <Button
                      type="primary"
                      shape="circle"
                      size="small"
                      icon={<CameraOutlined />}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        background: "#0079FF",
                        color: "white",
                        border: "2px solid white",
                      }}
                      onClick={() => console.log("Upload avatar")}
                    />
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
              <Col xs={24} md={8}>
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
              <Col xs={24} md={8}>
                <Card
                  style={{
                    textAlign: "center",
                    borderRadius: 12,
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Statistic
                    title="Favorites"
                    value={userProfile.favoriteImages}
                    prefix={<HeartOutlined style={{ color: "#ff4d4f" }} />}
                    valueStyle={{ color: "#ff4d4f", fontSize: 24, fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card
                  style={{
                    textAlign: "center",
                    borderRadius: 12,
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Statistic
                    title="Downloads"
                    value={userProfile.downloadsThisMonth}
                    prefix={<DownloadOutlined style={{ color: "#52c41a" }} />}
                    valueStyle={{ color: "#52c41a", fontSize: 24, fontWeight: 700 }}
                  />
                </Card>
              </Col>

              {/* Usage Progress */}
              <Col span={24}>
                <Card
                  title="Monthly Usage"
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <Progress
                      percent={
                        (userProfile.imagesGenerated / userProfile.totalLimit) * 100
                      }
                      strokeColor="#0079FF"
                      trailColor="#f0f0f0"
                      strokeWidth={12}
                      style={{ marginBottom: 8 }}
                    />
                    <Text style={{ color: "#0079FF", fontWeight: 600 }}>
                      {userProfile.imagesRemaining} images remaining
                    </Text>
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
                        title="Subscription Tier"
                        value={currentUser.subscriptionTier || 'FREE'}
                        valueStyle={{ color: "#0079FF", fontSize: 24, fontWeight: 700 }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane key="settings" tab="Settings">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
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
                    <Divider style={{ margin: "12px 0 12px 0" }} />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Text strong>Marketing Emails</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Get tips and product updates
                        </Text>
                      </div>
                      <Switch />
                    </div>
                    <Divider style={{ margin: "12px 0" }} />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Text strong>Public Profile</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Make your profile visible to others
                        </Text>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Security" style={{ height: "100%" }}>
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                  >
                    <Button
                      icon={<SecurityScanOutlined />}
                      block
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
                    <Button
                      icon={<BellOutlined />}
                      block
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
                        <div style={{ fontWeight: 600 }}>
                          Two-Factor Authentication
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          Add an extra layer of security
                        </div>
                      </div>
                    </Button>
                    <Button
                      icon={<CreditCardOutlined />}
                      block
                      onClick={() => navigate("/billing")}
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
                        <div style={{ fontWeight: 600 }}>
                          Billing & Subscription
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          Manage your subscription plan
                        </div>
                      </div>
                    </Button>
                  </Space>
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
                  <Col span={24}>
                    <Form.Item label="Bio" name="bio">
                      <Input.TextArea
                        rows={4}
                        placeholder="Tell us about yourself..."
                        size="large"
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
    </div>
  );
};
