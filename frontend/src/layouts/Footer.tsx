import {
  Layout,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Divider,
  Input,
} from "antd";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { Sparkle } from "lucide-react";

const { Footer: AntFooter } = Layout;
const { Title, Paragraph, Text } = Typography;

export const Footer = () => {
  return (
    <AntFooter
      style={{
        background:
          "linear-gradient(135deg, #0079FF 0%, #0056B3 50%, #003D80 100%)",
        color: "white",
        padding: "60px 24px 40px",
        width: "100vw",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Row gutter={[40, 40]} align="top">
          {/* Logo and Newsletter Section */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    height: 32,
                    width: 32,
                    background: "linear-gradient(135deg, #0079FF, #00C7FF)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0, 199, 255, 0.4)",
                  }}
                >
                  <Sparkle style={{ color: "#fff", fontSize: 20 }} />
                </div>
                <Title
                  level={3}
                  style={{
                    margin: 0,
                    color: "white",
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  NEURAPIX
                </Title>
              </div>
              <Paragraph
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                Subscribe to our newsletter for the latest updates on features
                and releases.
              </Paragraph>
              <div style={{ display: "flex", gap: 8, width: "100%" }}>
                <Input
                  placeholder="Your email here"
                  style={{
                    flex: 1,
                    borderRadius: 6,
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                  }}
                  styles={{
                    input: {
                      backgroundColor: "transparent",
                      color: "white",
                    },
                  }}
                />
                <Button
                  type="primary"
                  style={{
                    background: "linear-gradient(135deg, #00C7FF, #0079FF)",
                    borderColor: "transparent",
                    color: "white",
                    borderRadius: 6,
                    paddingLeft: 24,
                    paddingRight: 24,
                    boxShadow: "0 2px 8px rgba(0, 199, 255, 0.3)",
                  }}
                >
                  Join
                </Button>
              </div>
              <Text style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 12 }}>
                By subscribing, you consent to our Privacy Policy and receive
                updates.
              </Text>
            </Space>
          </Col>

          {/* Quick Links */}
          <Col xs={12} lg={4}>
            <Title
              level={5}
              style={{
                color: "white",
                marginBottom: 20,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Quick Links
            </Title>
            <Space direction="vertical" size="middle">
              <Button
                type="link"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  padding: 0,
                  height: "auto",
                  fontSize: 14,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#66B3FF")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)")
                }
              >
                Home Page
              </Button>
              <Button
                type="link"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  padding: 0,
                  height: "auto",
                  fontSize: 14,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#66B3FF")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)")
                }
              >
                About Us
              </Button>
              <Button
                type="link"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  padding: 0,
                  height: "auto",
                  fontSize: 14,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#66B3FF")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)")
                }
              >
                Contact Us
              </Button>
              <Button
                type="link"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  padding: 0,
                  height: "auto",
                  fontSize: 14,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#66B3FF")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)")
                }
              >
                Blog Posts
              </Button>
              <Button
                type="link"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  padding: 0,
                  height: "auto",
                  fontSize: 14,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#66B3FF")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)")
                }
              >
                Support Center
              </Button>
            </Space>
          </Col>

          {/* Resources */}
          <Col xs={12} lg={4}>
            <Title
              level={5}
              style={{
                color: "white",
                marginBottom: 20,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Resources
            </Title>
            <Space direction="vertical" size="middle">
              <Button
                type="link"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  padding: 0,
                  height: "auto",
                  fontSize: 14,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#66B3FF")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)")
                }
              >
                FAQs
              </Button>
              <Button
                type="link"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  padding: 0,
                  height: "auto",
                  fontSize: 14,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#66B3FF")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)")
                }
              >
                Case Studies
              </Button>
              <Button
                type="link"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  padding: 0,
                  height: "auto",
                  fontSize: 14,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#66B3FF")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)")
                }
              >
                Webinars
              </Button>
              <Button
                type="link"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  padding: 0,
                  height: "auto",
                  fontSize: 14,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#66B3FF")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)")
                }
              >
                Guides
              </Button>
              <Button
                type="link"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  padding: 0,
                  height: "auto",
                  fontSize: 14,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#66B3FF")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)")
                }
              >
                E-books
              </Button>
            </Space>
          </Col>

          {/* Connect With Us */}
          <Col xs={24} lg={8}>
            <Title
              level={5}
              style={{
                color: "white",
                marginBottom: 20,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Connect With Us
            </Title>
            <Space wrap size="large">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "transform 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <FacebookOutlined style={{ fontSize: 20, color: "#66B3FF" }} />
                <Text
                  style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 14 }}
                >
                  Facebook
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "transform 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <InstagramOutlined style={{ fontSize: 20, color: "#66B3FF" }} />
                <Text
                  style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 14 }}
                >
                  Instagram
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "transform 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <TwitterOutlined style={{ fontSize: 20, color: "#66B3FF" }} />
                <Text
                  style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 14 }}
                >
                  X
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "transform 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <LinkedinOutlined style={{ fontSize: 20, color: "#66B3FF" }} />
                <Text
                  style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 14 }}
                >
                  LinkedIn
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "transform 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <YoutubeOutlined style={{ fontSize: 20, color: "#66B3FF" }} />
                <Text
                  style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 14 }}
                >
                  YouTube
                </Text>
              </div>
            </Space>
          </Col>
        </Row>

        <Divider
          style={{
            borderColor: "rgba(255, 255, 255, 0.2)",
            margin: "40px 0 20px",
          }}
        />

        {/* Bottom section */}
        <Row justify="space-between" align="middle">
          <Col xs={24} md={12}>
            <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 14 }}>
              © 2025 NEURAPIX All rights reserved.
            </Text>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Space
              split={
                <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>|</span>
              }
            >
              <Button
                type="link"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  padding: 0,
                  height: "auto",
                  fontSize: 14,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#66B3FF")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)")
                }
              >
                Privacy Policy
              </Button>
              <Button
                type="link"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  padding: 0,
                  height: "auto",
                  fontSize: 14,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#66B3FF")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)")
                }
              >
                Terms of Service
              </Button>
              <Button
                type="link"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  padding: 0,
                  height: "auto",
                  fontSize: 14,
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#66B3FF")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)")
                }
              >
                Cookie Settings
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
    </AntFooter>
  );
};
