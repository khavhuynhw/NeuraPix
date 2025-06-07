import { useState } from "react";
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
  Upload,
  Statistic,
  Progress,
  Tag,
  Space,
  Divider,
  List,
  Image,
  Badge,
  Switch,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  CameraOutlined,
  EditOutlined,
  SaveOutlined,
  PictureOutlined,
  StarOutlined,
  CrownOutlined,
  SettingOutlined,
  BellOutlined,
  SecurityScanOutlined,
  CreditCardOutlined,
  DownloadOutlined,
  HeartOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Mock user data
const userData = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  username: "alex_creates",
  bio: "Digital artist and AI enthusiast. Creating stunning visuals with NEURAPIX.",
  avatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
  joinDate: "January 2024",
  plan: "Pro",
  imagesGenerated: 234,
  imagesRemaining: 266,
  totalLimit: 500,
  favoriteImages: 45,
  downloadsThisMonth: 89,
};

// Mock generated images
const generatedImages = [
  {
    id: 1,
    url: "https://picsum.photos/300/300?random=1",
    prompt: "Cyberpunk cityscape at sunset",
    likes: 24,
    downloads: 12,
    createdAt: "2 hours ago",
    style: "Cyberpunk",
  },
  {
    id: 2,
    url: "https://picsum.photos/300/300?random=2",
    prompt: "Magical forest with glowing mushrooms",
    likes: 18,
    downloads: 8,
    createdAt: "1 day ago",
    style: "Fantasy",
  },
  {
    id: 3,
    url: "https://picsum.photos/300/300?random=3",
    prompt: "Abstract geometric patterns",
    likes: 31,
    downloads: 15,
    createdAt: "3 days ago",
    style: "Abstract",
  },
  {
    id: 4,
    url: "https://picsum.photos/300/300?random=4",
    prompt: "Portrait of a futuristic robot",
    likes: 42,
    downloads: 28,
    createdAt: "1 week ago",
    style: "Sci-Fi",
  },
  {
    id: 5,
    url: "https://picsum.photos/300/300?random=5",
    prompt: "Serene mountain landscape",
    likes: 15,
    downloads: 6,
    createdAt: "1 week ago",
    style: "Landscape",
  },
  {
    id: 6,
    url: "https://picsum.photos/300/300?random=6",
    prompt: "Vintage car in retro style",
    likes: 28,
    downloads: 19,
    createdAt: "2 weeks ago",
    style: "Vintage",
  },
];

export const UserProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const handleSaveProfile = (values: any) => {
    console.log("Saving profile:", values);
    setIsEditing(false);
    // Handle save logic here
  };

  const handleAvatarUpload = (info: any) => {
    console.log("Avatar upload:", info);
    // Handle avatar upload logic here
  };

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
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} sm={8} md={6} style={{ textAlign: "center" }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  size={120}
                  src={userData.avatar}
                  icon={<UserOutlined />}
                  style={{
                    border: "4px solid #0079FF",
                    boxShadow: "0 8px 25px rgba(0, 121, 255, 0.3)",
                  }}
                />
                <Upload
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleAvatarUpload}
                >
                  <Button
                    type="primary"
                    icon={<CameraOutlined />}
                    size="small"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#0079FF",
                      border: "2px solid white",
                      transition: "all 0.3s ease",
                      transform: "scale(1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.1)";
                      e.currentTarget.style.background = "#3399FF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.background = "#0079FF";
                    }}
                  />
                </Upload>
              </div>
            </Col>
            <Col xs={24} sm={16} md={12}>
              {!isEditing ? (
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
                      {userData.name}
                    </Title>
                    <Badge
                      count={<CrownOutlined style={{ color: "#FFD700" }} />}
                    />
                  </div>
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    @{userData.username}
                  </Text>
                  <Text style={{ color: "#64748b" }}>{userData.email}</Text>
                  <Paragraph
                    style={{
                      color: "#4b5563",
                      fontSize: 16,
                      lineHeight: 1.6,
                      margin: "8px 0 8px 0",
                    }}
                  >
                    {userData.bio}
                  </Paragraph>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 16 }}
                  >
                    <Tag color="blue">{userData.plan} Plan</Tag>
                    <Text type="secondary">Joined {userData.joinDate}</Text>
                  </div>
                </Space>
              ) : (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSaveProfile}
                  initialValues={userData}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="name" label="Full Name">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="username" label="Username">
                        <Input prefix="@" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="bio" label="Bio">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Form>
              )}
            </Col>
            <Col xs={24} sm={24} md={6} style={{ textAlign: "right" }}>
              {!isEditing ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: "#0079FF",
                    borderColor: "#0079FF",
                    transition: "all 0.3s ease",
                    transform: "scale(1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.background = "#3399FF";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(0, 121, 255, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "#0079FF";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Space>
                  <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => form.submit()}
                    style={{
                      background: "#0079FF",
                      borderColor: "#0079FF",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#3399FF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#0079FF";
                    }}
                  >
                    Save
                  </Button>
                </Space>
              )}
            </Col>
          </Row>
        </Card>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card
              style={{
                textAlign: "center",
                borderRadius: 12,
                border: "1px solid rgba(0, 121, 255, 0.1)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 25px rgba(0, 121, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Statistic
                title="Images Generated"
                value={userData.imagesGenerated}
                prefix={<PictureOutlined style={{ color: "#0079FF" }} />}
                valueStyle={{ color: "#0079FF", fontSize: 24, fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              style={{
                textAlign: "center",
                borderRadius: 12,
                border: "1px solid rgba(0, 121, 255, 0.1)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 25px rgba(0, 121, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Statistic
                title="Favorites"
                value={userData.favoriteImages}
                prefix={<HeartOutlined style={{ color: "#ff4d4f" }} />}
                valueStyle={{ color: "#ff4d4f", fontSize: 24, fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              style={{
                textAlign: "center",
                borderRadius: 12,
                border: "1px solid rgba(0, 121, 255, 0.1)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 25px rgba(0, 121, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Statistic
                title="Downloads"
                value={userData.downloadsThisMonth}
                prefix={<DownloadOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a", fontSize: 24, fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              style={{
                textAlign: "center",
                borderRadius: 12,
                border: "1px solid rgba(0, 121, 255, 0.1)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 25px rgba(0, 121, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Monthly Usage
                </Text>
                <div style={{ marginTop: 8 }}>
                  <Progress
                    percent={
                      (userData.imagesGenerated / userData.totalLimit) * 100
                    }
                    strokeColor="#0079FF"
                    trailColor="rgba(0, 121, 255, 0.1)"
                    showInfo={false}
                  />
                  <Text style={{ color: "#0079FF", fontWeight: 600 }}>
                    {userData.imagesRemaining} left
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Main Content Tabs */}
        <Card
          style={{
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ minHeight: 400 }}
          >
            <TabPane
              tab={
                <span>
                  <PictureOutlined />
                  My Gallery
                </span>
              }
              key="gallery"
            >
              <Row gutter={[16, 16]}>
                {generatedImages.map((image) => (
                  <Col xs={12} sm={8} md={6} lg={4} key={image.id}>
                    <Card
                      hoverable
                      cover={
                        <div
                          style={{ position: "relative", overflow: "hidden" }}
                        >
                          <Image
                            src={image.url}
                            alt={image.prompt}
                            style={{
                              width: "100%",
                              height: 200,
                              objectFit: "cover",
                            }}
                            preview={{
                              mask: (
                                <Space>
                                  <EyeOutlined />
                                  <DownloadOutlined />
                                  <HeartOutlined />
                                </Space>
                              ),
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              background: "rgba(0, 0, 0, 0.7)",
                              borderRadius: 4,
                              padding: "2px 6px",
                            }}
                          >
                            <Tag
                              color="blue"
                              size="small"
                              style={{ margin: 0 }}
                            >
                              {image.style}
                            </Tag>
                          </div>
                        </div>
                      }
                      style={{
                        borderRadius: 12,
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow =
                          "0 12px 25px rgba(0, 121, 255, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(0, 0, 0, 0.1)";
                      }}
                    >
                      <Card.Meta
                        description={
                          <Space
                            direction="vertical"
                            size="small"
                            style={{ width: "100%" }}
                          >
                            <Text ellipsis style={{ fontSize: 12 }}>
                              {image.prompt}
                            </Text>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Space size="small">
                                <span
                                  style={{ fontSize: 12, color: "#64748b" }}
                                >
                                  ❤️ {image.likes}
                                </span>
                                <span
                                  style={{ fontSize: 12, color: "#64748b" }}
                                >
                                  ⬇️ {image.downloads}
                                </span>
                              </Space>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {image.createdAt}
                              </Text>
                            </div>
                          </Space>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <SettingOutlined />
                  Settings
                </span>
              }
              key="settings"
            >
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
                            Manage your Pro plan
                          </div>
                        </div>
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <StarOutlined />
                  Activity
                </span>
              }
              key="activity"
            >
              <List
                itemLayout="horizontal"
                dataSource={[
                  {
                    title: "Generated 'Cyberpunk cityscape at sunset'",
                    description: "2 hours ago",
                    avatar: "🎨",
                  },
                  {
                    title: "Upgraded to Pro plan",
                    description: "3 days ago",
                    avatar: "⭐",
                  },
                  {
                    title: "Downloaded 5 images",
                    description: "1 week ago",
                    avatar: "⬇️",
                  },
                  {
                    title: "Generated 'Magical forest with glowing mushrooms'",
                    description: "1 week ago",
                    avatar: "🎨",
                  },
                  {
                    title: "Joined NEURAPIX",
                    description: "January 2024",
                    avatar: "🎉",
                  },
                ]}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: "16px 0",
                      borderBottom: "1px solid #f0f0f0",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(0, 121, 255, 0.02)";
                      e.currentTarget.style.padding = "16px 0 16px 8px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.padding = "16px 0";
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "rgba(0, 121, 255, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                          }}
                        >
                          {item.avatar}
                        </div>
                      }
                      title={
                        <Text style={{ fontWeight: 600 }}>{item.title}</Text>
                      }
                      description={
                        <Text type="secondary">{item.description}</Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};
