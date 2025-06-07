import { Button, Typography, Space, Row, Col, Statistic, Card } from "antd";
import {
  StarOutlined,
  ThunderboltOutlined,
  BgColorsOutlined,
  UserOutlined,
  RocketOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
        padding: "80px 24px",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 121, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 121, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          opacity: 0.5,
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Row justify="center" align="middle">
          <Col xs={24} lg={16} style={{ textAlign: "center" }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Badge */}
              <div>
                <Button
                  type="primary"
                  ghost
                  icon={<StarOutlined />}
                  style={{
                    background: "rgba(0, 121, 255, 0.1)",
                    borderColor: "#0079FF",
                    color: "#0079FF",
                    borderRadius: 20,
                    padding: "4px 16px",
                    height: "auto",
                    boxShadow: "0 2px 8px rgba(0, 121, 255, 0.2)",
                  }}
                >
                  Powered by Advanced AI
                </Button>
              </div>

              {/* Main Heading */}
              <div>
                <Title
                  level={1}
                  style={{
                    fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    margin: 0,
                    background:
                      "linear-gradient(135deg, #0079FF 0%, #00C7FF 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Transform Words
                </Title>
                <Title
                  level={1}
                  style={{
                    fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    margin: 0,
                    color: "#1f2937",
                  }}
                >
                  into Stunning Art
                </Title>
              </div>

              <Paragraph
                style={{
                  fontSize: "clamp(1.125rem, 3vw, 1.5rem)",
                  color: "#64748b",
                  maxWidth: 600,
                  margin: "0 auto",
                  lineHeight: 1.6,
                }}
              >
                Create breathtaking images from simple text descriptions. Our
                AI-powered platform brings your imagination to life with
                professional-quality results in seconds.
              </Paragraph>

              {/* CTA Buttons */}
              <Space size="large" wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={<BgColorsOutlined />}
                  onClick={onGetStarted}
                  style={{
                    height: 50,
                    padding: "0 32px",
                    fontSize: 16,
                    background:
                      "linear-gradient(135deg, #0079FF 0%, #0056B3 100%)",
                    border: "none",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0, 121, 255, 0.3)",
                  }}
                >
                  Start Creating
                </Button>
                <Button
                  size="large"
                  style={{
                    height: 50,
                    padding: "0 32px",
                    fontSize: 16,
                    borderRadius: 8,
                    borderColor: "#0079FF",
                    color: "#0079FF",
                  }}
                >
                  View Gallery
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>

        {/* Stats Section */}
        <Row
          gutter={[32, 32]}
          justify="center"
          style={{
            marginTop: 80,
            maxWidth: 800,
            margin: "80px auto 0",
          }}
        >
          <Col xs={8} sm={8}>
            <Card
              style={{
                textAlign: "center",
                border: "none",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #0079FF 0%, #00C7FF 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    boxShadow: "0 4px 12px rgba(0, 121, 255, 0.3)",
                  }}
                >
                  <ThunderboltOutlined
                    style={{ color: "white", fontSize: 20 }}
                  />
                </div>
              </div>
              <Statistic
                value={2.3}
                suffix="M+"
                valueStyle={{
                  fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
                  fontWeight: 700,
                  color: "#1f2937",
                }}
              />
              <div
                style={{
                  fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                  color: "#64748b",
                  marginTop: 4,
                }}
              >
                Images Generated
              </div>
            </Card>
          </Col>
          <Col xs={8} sm={8}>
            <Card
              style={{
                textAlign: "center",
                border: "none",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #0056B3 0%, #0079FF 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    boxShadow: "0 4px 12px rgba(0, 86, 179, 0.3)",
                  }}
                >
                  <UserOutlined style={{ color: "white", fontSize: 20 }} />
                </div>
              </div>
              <Statistic
                value={150}
                suffix="K+"
                valueStyle={{
                  fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
                  fontWeight: 700,
                  color: "#1f2937",
                }}
              />
              <div
                style={{
                  fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                  color: "#64748b",
                  marginTop: 4,
                }}
              >
                Happy Creators
              </div>
            </Card>
          </Col>
          <Col xs={8} sm={8}>
            <Card
              style={{
                textAlign: "center",
                border: "none",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #003D80 0%, #0056B3 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    boxShadow: "0 4px 12px rgba(0, 61, 128, 0.3)",
                  }}
                >
                  <RocketOutlined style={{ color: "white", fontSize: 20 }} />
                </div>
              </div>
              <Statistic
                value={99.9}
                suffix="%"
                valueStyle={{
                  fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
                  fontWeight: 700,
                  color: "#1f2937",
                }}
              />
              <div
                style={{
                  fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                  color: "#64748b",
                  marginTop: 4,
                }}
              >
                Uptime
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};
