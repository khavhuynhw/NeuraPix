import { Row, Col, Card, Typography, Space, Button, Badge, Progress } from "antd";
import {
  ThunderboltOutlined,
  BgColorsOutlined,
  DownloadOutlined,
  SafetyOutlined,
  RetweetOutlined,
  HighlightOutlined,
  PictureOutlined,
  SettingOutlined,
  GlobalOutlined,
  CrownOutlined,
  StarOutlined,
  RocketOutlined,
  TrophyOutlined,
  FireOutlined,
  HeartOutlined,
  EyeOutlined,
  CloudOutlined,
  IeOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const mainFeatures = [
  {
    icon: ThunderboltOutlined,
    title: "Lightning Fast Generation",
    description: "Generate stunning images in seconds with our optimized AI models. No more waiting - instant creativity at your fingertips.",
    badge: "Speed",
    color: "#FFD700",
    gradient: "linear-gradient(135deg, #FFD700, #FFA500)",
    stats: "< 5 seconds"
  },
  {
    icon: BgColorsOutlined,
    title: "50+ Art Styles",
    description: "From photorealistic to anime, abstract to vintage - explore an extensive library of artistic styles and find your perfect match.",
    badge: "Variety",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6, #A855F7)",
    stats: "50+ styles"
  },
  {
    icon: SettingOutlined,
    title: "Advanced Controls",
    description: "Fine-tune every aspect of your creation with precision controls for aspect ratio, quality, style intensity, and composition.",
    badge: "Control",
    color: "#0079FF",
    gradient: "linear-gradient(135deg, #0079FF, #00C7FF)",
    stats: "Full control"
  },
  {
    icon: DownloadOutlined,
    title: "4K High Resolution",
    description: "Download your masterpieces in crystal-clear 4K resolution, perfect for printing, web use, or professional projects.",
    badge: "Quality",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #34D399)",
    stats: "Up to 4K"
  },
  {
    icon: SafetyOutlined,
    title: "Commercial License",
    description: "Use your AI-generated images for any commercial purpose with our flexible licensing. Perfect for businesses and creators.",
    badge: "Legal",
    color: "#EF4444",
    gradient: "linear-gradient(135deg, #EF4444, #F87171)",
    stats: "Full rights"
  },
  {
    icon: RetweetOutlined,
    title: "Unlimited Variations",
    description: "Generate endless variations of your concepts. Refine, iterate, and perfect your vision with unlimited creative possibilities.",
    badge: "Freedom",
    color: "#06B6D4",
    gradient: "linear-gradient(135deg, #06B6D4, #67E8F9)",
    stats: "∞ iterations"
  },
];

const additionalFeatures = [
  {
    icon: PictureOutlined,
    title: "Smart Gallery Management",
    description: "Organize your creations with AI-powered tagging, smart collections, and advanced search capabilities.",
    color: "#8B5CF6"
  },
  {
    icon: GlobalOutlined,
    title: "Cloud Storage & Sync",
    description: "Access your images from anywhere with secure cloud storage and real-time synchronization across devices.",
    color: "#0079FF"
  },
  {
    icon: HighlightOutlined,
    title: "Style Transfer Technology",
    description: "Apply artistic styles to existing images or blend multiple styles for unique, never-before-seen results.",
    color: "#10B981"
  },
  {
    icon: IeOutlined,
    title: "Privacy & Security",
    description: "Your creations are protected with enterprise-grade security. We never use your images for training.",
    color: "#EF4444"
  },
  {
    icon: CustomerServiceOutlined,
    title: "24/7 Expert Support",
    description: "Get help when you need it with our dedicated support team of AI and creative professionals.",
    color: "#F59E0B"
  },
  {
    icon: CloudOutlined,
    title: "API Integration",
    description: "Integrate NEURAPIX into your workflow with our powerful REST API and comprehensive documentation.",
    color: "#06B6D4"
  },
];

const enterpriseFeatures = [
  "Custom model training",
  "Dedicated infrastructure",
  "White-label solutions",
  "Advanced analytics",
  "Priority support",
  "Custom integrations",
  "SLA guarantees",
  "Team collaboration tools"
];

const FeaturesPage = () => {
  return (
    <div style={{
      minHeight: "calc(100vh - 128px)",
      background: "linear-gradient(135deg, #f8fafc 0%, #f0f4f8 25%, #e2e8f0 50%, #f1f5f9 75%, #f8fafc 100%)",
      padding: "60px 20px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 15% 25%, rgba(0, 121, 255, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 85% 75%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 50% 10%, rgba(16, 185, 129, 0.02) 0%, transparent 50%)
        `,
        pointerEvents: "none"
      }} />

      <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Enhanced Page Header */}
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
            padding: "12px 24px",
            background: "linear-gradient(135deg, rgba(0, 121, 255, 0.08), rgba(139, 92, 246, 0.08))",
            borderRadius: 50,
            border: "1px solid rgba(0, 121, 255, 0.2)",
            backdropFilter: "blur(10px)"
          }}>
            <StarOutlined style={{ color: "#0079FF", fontSize: 18 }} />
            <Text style={{ color: "#0079FF", fontWeight: 700, fontSize: 16 }}>
              Powerful Features
            </Text>
          </div>

          <Title level={1} style={{
            margin: "0 0 32px 0",
            color: "#1f2937",
            fontSize: "clamp(3rem, 6vw, 5rem)",
            fontWeight: 800,
            background: "linear-gradient(135deg, #1f2937 0%, #0079FF 50%, #8B5CF6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
            lineHeight: 1.1
          }}>
            Everything You Need to Create
          </Title>

          <Paragraph style={{
            fontSize: 22,
            color: "#64748b",
            maxWidth: 800,
            margin: "0 auto 40px auto",
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            Professional-grade AI image generation with cutting-edge features designed for
            creators, designers, and businesses who demand excellence.
          </Paragraph>

          {/* Feature Stats */}
          <Row gutter={[32, 32]} justify="center" style={{ marginTop: 60 }}>
            <Col xs={8} sm={6}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0079FF, #00C7FF)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 20px 60px rgba(0, 121, 255, 0.3)"
                }}>
                  <RocketOutlined style={{ color: "white", fontSize: 32 }} />
                </div>
                <Text style={{ fontSize: 28, fontWeight: 800, color: "#0079FF", display: "block" }}>50+</Text>
                <Text style={{ color: "#64748b", fontWeight: 500 }}>Art Styles</Text>
              </div>
            </Col>
            <Col xs={8} sm={6}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #8B5CF6, #A855F7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 20px 60px rgba(139, 92, 246, 0.3)"
                }}>
                  <ThunderboltOutlined style={{ color: "white", fontSize: 32 }} />
                </div>
                <Text style={{ fontSize: 28, fontWeight: 800, color: "#8B5CF6", display: "block" }}></Text>
                <Text style={{ color: "#64748b", fontWeight: 500 }}>Generation</Text>
              </div>
            </Col>
            <Col xs={8} sm={6}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10B981, #34D399)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 20px 60px rgba(16, 185, 129, 0.3)"
                }}>
                  <TrophyOutlined style={{ color: "white", fontSize: 32 }} />
                </div>
                <Text style={{ fontSize: 28, fontWeight: 800, color: "#10B981", display: "block" }}>4K</Text>
                <Text style={{ color: "#64748b", fontWeight: 500 }}>Resolution</Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* Main Features Grid */}
        <Row gutter={[32, 32]} style={{ marginBottom: 100 }}>
          {mainFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Col xs={24} md={12} lg={8} key={index}>
                <Card
                  style={{
                    height: "100%",
                    borderRadius: 24,
                    border: "1px solid rgba(0, 121, 255, 0.1)",
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))",
                    backdropFilter: "blur(20px)",
                    transition: "all 0.4s ease",
                    overflow: "hidden",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-12px) scale(1.02)";
                    e.currentTarget.style.boxShadow = `0 25px 80px ${feature.color}25`;
                    e.currentTarget.style.borderColor = feature.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 8px 40px rgba(0, 0, 0, 0.1)";
                    e.currentTarget.style.borderColor = "rgba(0, 121, 255, 0.1)";
                  }}
                >
                  {/* Gradient overlay */}
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: feature.gradient
                  }} />

                  <div style={{ padding: "32px 24px" }}>
                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}>
                        <div style={{
                          width: 64,
                          height: 64,
                          borderRadius: 20,
                          background: `${feature.color}15`,
                          border: `2px solid ${feature.color}30`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease"
                        }}>
                          <IconComponent style={{ fontSize: 28, color: feature.color }} />
                        </div>
                        <Badge
                          count={
                            <div style={{
                              background: feature.gradient,
                              color: "white",
                              padding: "4px 12px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                              boxShadow: `0 4px 12px ${feature.color}30`
                            }}>
                              {feature.badge}
                            </div>
                          }
                        />
                      </div>

                      <div>
                        <Title level={3} style={{
                          margin: "0 0 12px 0",
                          fontSize: 22,
                          fontWeight: 700,
                          color: "#1f2937"
                        }}>
                          {feature.title}
                        </Title>
                        <Paragraph style={{
                          color: "#64748b",
                          lineHeight: 1.6,
                          margin: 0,
                          fontSize: 15,
                        }}>
                          {feature.description}
                        </Paragraph>
                      </div>

                      <div style={{
                        padding: "16px 20px",
                        background: `${feature.color}08`,
                        borderRadius: 16,
                        border: `1px solid ${feature.color}20`,
                        textAlign: "center"
                      }}>
                        <Text style={{
                          color: feature.color,
                          fontWeight: 700,
                          fontSize: 16
                        }}>
                          {feature.stats}
                        </Text>
                      </div>
                    </Space>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Additional Features Section */}
        <div style={{ marginBottom: 100 }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <Title level={2} style={{
              fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
              fontWeight: 700,
              color: "#1f2937",
              margin: "0 0 24px 0"
            }}>
              🚀 Advanced Capabilities
            </Title>
            <Paragraph style={{
              fontSize: 18,
              color: "#64748b",
              maxWidth: 600,
              margin: "0 auto"
            }}>
              Discover the powerful tools that make NEURAPIX the most comprehensive AI image platform
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {additionalFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Card
                    style={{
                      height: "100%",
                      borderRadius: 20,
                      border: "1px solid rgba(0, 121, 255, 0.1)",
                      background: "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow = `0 15px 50px ${feature.color}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
                    }}
                  >
                    <div style={{ padding: 24 }}>
                      <Space align="start" size="large">
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 16,
                          background: `${feature.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <IconComponent style={{ fontSize: 24, color: feature.color }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Title level={4} style={{
                            margin: "0 0 8px 0",
                            fontSize: 18,
                            fontWeight: 600,
                            color: "#1f2937"
                          }}>
                            {feature.title}
                          </Title>
                          <Text style={{
                            fontSize: 14,
                            color: "#64748b",
                            lineHeight: 1.5,
                          }}>
                            {feature.description}
                          </Text>
                        </div>
                      </Space>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>

        {/* Enterprise Features */}
        <Card
          style={{
            borderRadius: 32,
            background: "linear-gradient(135deg, rgba(0, 121, 255, 0.03), rgba(139, 92, 246, 0.03))",
            border: "1px solid rgba(0, 121, 255, 0.15)",
            backdropFilter: "blur(20px)",
            overflow: "hidden",
            position: "relative"
          }}
        >
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #0079FF, #8B5CF6, #0079FF)"
          }} />

          <div style={{ padding: "60px 40px" }}>
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} lg={12}>
                <Space direction="vertical" size="large">
                  <div>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 16px",
                      background: "linear-gradient(135deg, rgba(0, 121, 255, 0.1), rgba(139, 92, 246, 0.1))",
                      borderRadius: 30,
                      marginBottom: 24
                    }}>
                      <CrownOutlined style={{ color: "#0079FF" }} />
                      <Text style={{ color: "#0079FF", fontWeight: 600 }}>Enterprise Ready</Text>
                    </div>

                    <Title level={2} style={{
                      fontSize: "clamp(2rem, 4vw, 3rem)",
                      fontWeight: 700,
                      color: "#1f2937",
                      margin: "0 0 20px 0"
                    }}>
                      Built for Scale & Performance
                    </Title>
                    <Paragraph style={{
                      fontSize: 18,
                      color: "#64748b",
                      lineHeight: 1.6
                    }}>
                      Take your business to the next level with enterprise-grade features,
                      dedicated infrastructure, and premium support designed for demanding workflows.
                    </Paragraph>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    style={{
                      background: "linear-gradient(135deg, #0079FF, #8B5CF6)",
                      border: "none",
                      borderRadius: 16,
                      height: 56,
                      paddingLeft: 32,
                      paddingRight: 32,
                      fontSize: 16,
                      fontWeight: 600,
                      boxShadow: "0 8px 32px rgba(0, 121, 255, 0.3)"
                    }}
                  >
                    🚀 Contact Enterprise Sales
                  </Button>
                </Space>
              </Col>
              <Col xs={24} lg={12}>
                <div style={{
                  background: "rgba(255, 255, 255, 0.5)",
                  borderRadius: 24,
                  padding: 32,
                  border: "1px solid rgba(0, 121, 255, 0.1)"
                }}>
                  <Title level={4} style={{
                    margin: "0 0 24px 0",
                    color: "#1f2937",
                    textAlign: "center"
                  }}>
                    Enterprise Features
                  </Title>
                  <Row gutter={[16, 16]}>
                    {enterpriseFeatures.map((feature, index) => (
                      <Col xs={12} key={index}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 12px",
                          background: "rgba(0, 121, 255, 0.05)",
                          borderRadius: 12,
                          border: "1px solid rgba(0, 121, 255, 0.1)"
                        }}>
                          <div style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #0079FF, #8B5CF6)"
                          }} />
                          <Text style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
                            {feature}
                          </Text>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Col>
            </Row>
          </div>
        </Card>

        {/* CTA Section */}
        <div style={{
          textAlign: "center",
          marginTop: 100,
          padding: "60px 40px",
          background: "linear-gradient(135deg, rgba(0, 121, 255, 0.05), rgba(139, 92, 246, 0.05))",
          borderRadius: 32,
          border: "1px solid rgba(0, 121, 255, 0.1)"
        }}>
          <Title level={2} style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 700,
            color: "#1f2937",
            margin: "0 0 24px 0"
          }}>
            Ready to Start Creating?
          </Title>
          <Paragraph style={{
            fontSize: 18,
            color: "#64748b",
            maxWidth: 500,
            margin: "0 auto 40px auto"
          }}>
            Join thousands of creators who are already transforming their ideas into stunning visuals
          </Paragraph>
          <Space size="large">
            <Button
              type="primary"
              size="large"
              style={{
                background: "linear-gradient(135deg, #0079FF, #00C7FF)",
                border: "none",
                borderRadius: 16,
                height: 56,
                paddingLeft: 32,
                paddingRight: 32,
                fontSize: 16,
                fontWeight: 600,
                boxShadow: "0 8px 32px rgba(0, 121, 255, 0.3)"
              }}
            >
              ✨ Start Creating Now
            </Button>
            <Button
              size="large"
              style={{
                borderRadius: 16,
                height: 56,
                paddingLeft: 32,
                paddingRight: 32,
                fontSize: 16,
                fontWeight: 600,
                borderColor: "rgba(0, 121, 255, 0.3)",
                color: "#0079FF"
              }}
            >
              📋 View Pricing
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;