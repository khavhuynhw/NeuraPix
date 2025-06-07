import { Card, Typography, Row, Col, Tag, Space } from "antd";
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
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const features = [
  {
    icon: ThunderboltOutlined,
    title: "Lightning Fast",
    description:
      "Generate high-quality images in seconds, not minutes. Our optimized AI models deliver results at unprecedented speed.",
    badge: "Speed",
    color: "gold",
  },
  {
    icon: BgColorsOutlined,
    title: "Multiple Art Styles",
    description:
      "From photorealistic to anime, abstract to vintage - choose from a wide variety of artistic styles.",
    badge: "Variety",
    color: "blue",
  },
  {
    icon: SettingOutlined,
    title: "Advanced Controls",
    description:
      "Fine-tune your creations with aspect ratio, quality settings, and style parameters for perfect results.",
    badge: "Control",
    color: "cyan",
  },
  {
    icon: DownloadOutlined,
    title: "High Resolution",
    description:
      "Download your images in high resolution suitable for print, web, or professional use.",
    badge: "Quality",
    color: "green",
  },
  {
    icon: SafetyOutlined,
    title: "Commercial License",
    description:
      "Use your generated images for commercial purposes with our flexible licensing options.",
    badge: "Legal",
    color: "red",
  },
  {
    icon: RetweetOutlined,
    title: "Unlimited Creativity",
    description:
      "No limits on your imagination. Generate as many variations as you need to perfect your vision.",
    badge: "Freedom",
    color: "purple",
  },
];

const additionalFeatures = [
  {
    icon: PictureOutlined,
    title: "Gallery Management",
    description:
      "Organize and manage your creations with our built-in gallery system.",
  },
  {
    icon: GlobalOutlined,
    title: "Cloud Storage",
    description: "Access your images from anywhere with secure cloud storage.",
  },
  {
    icon: HighlightOutlined,
    title: "Style Transfer",
    description:
      "Apply artistic styles to existing images for unique transformations.",
  },
];

export const FeaturesSection = () => {
  return (
    <div style={{ padding: "80px 24px", backgroundColor: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Title
            level={2}
            style={{ fontSize: "clamp(2rem, 5vw, 2.5rem)", marginBottom: 16 }}
          >
            Everything You Need to Create
          </Title>
          <Paragraph
            style={{
              fontSize: "clamp(1.125rem, 3vw, 1.25rem)",
              color: "#64748b",
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            Professional-grade AI image generation with powerful features
            designed for creators, designers, and businesses.
          </Paragraph>
        </div>

        {/* Main Features Grid */}
        <Row gutter={[32, 32]} style={{ marginBottom: 64 }}>
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Col xs={24} md={12} lg={8} key={index}>
                <Card
                  hoverable
                  style={{
                    height: "100%",
                    borderRadius: 16,
                    border: "1px solid #f0f0f0",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                  }}
                  styles={{
                    body: { padding: 24 },
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 40px rgba(0, 121, 255, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background:
                            "linear-gradient(135deg, rgba(0, 121, 255, 0.1) 0%, rgba(0, 199, 255, 0.1) 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "transform 0.3s ease",
                          border: "1px solid rgba(0, 121, 255, 0.2)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.1)";
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, rgba(0, 121, 255, 0.2) 0%, rgba(0, 199, 255, 0.2) 100%)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, rgba(0, 121, 255, 0.1) 0%, rgba(0, 199, 255, 0.1) 100%)";
                        }}
                      >
                        <IconComponent
                          style={{ fontSize: 24, color: "#0079FF" }}
                        />
                      </div>
                      <Tag color={feature.color} style={{ margin: 0 }}>
                        {feature.badge}
                      </Tag>
                    </div>

                    <div>
                      <Title
                        level={4}
                        style={{ marginBottom: 8, fontSize: 20 }}
                      >
                        {feature.title}
                      </Title>
                      <Paragraph
                        style={{
                          color: "#64748b",
                          lineHeight: 1.6,
                          margin: 0,
                          fontSize: 14,
                        }}
                      >
                        {feature.description}
                      </Paragraph>
                    </div>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Additional Features */}
        <Card
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 121, 255, 0.05) 0%, rgba(0, 199, 255, 0.05) 100%)",
            borderRadius: 24,
            border: "1px solid rgba(0, 121, 255, 0.1)",
            padding: 24,
          }}
        >
          <Title
            level={3}
            style={{
              textAlign: "center",
              marginBottom: 32,
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              color: "#0079FF",
            }}
          >
            Plus Many More Features
          </Title>
          <Row gutter={[24, 24]}>
            {additionalFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Col xs={24} md={8} key={index}>
                  <Space align="start" size="large">
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0, 121, 255, 0.1)",
                        flexShrink: 0,
                        border: "1px solid rgba(0, 121, 255, 0.1)",
                      }}
                    >
                      <IconComponent
                        style={{ fontSize: 20, color: "#0079FF" }}
                      />
                    </div>
                    <div>
                      <Title
                        level={5}
                        style={{ marginBottom: 4, fontSize: 16 }}
                      >
                        {feature.title}
                      </Title>
                      <Paragraph
                        style={{
                          fontSize: 14,
                          color: "#64748b",
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {feature.description}
                      </Paragraph>
                    </div>
                  </Space>
                </Col>
              );
            })}
          </Row>
        </Card>
      </div>
    </div>
  );
};
