import { useRef } from "react";
import { Typography, Card, Row, Col, Rate, Avatar, Space } from "antd";
import { QuestionCircleOutlined, RightOutlined } from "@ant-design/icons";

import { HeroSection } from "../components/HeroSection";
import { FeaturesSection } from "../components/FeaturesSection";

const { Title, Paragraph, Text } = Typography;

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Digital Artist",
    content:
      "This AI tool has revolutionized my creative process. I can now explore ideas faster than ever before.",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Marketing Director",
    content:
      "Perfect for creating unique visuals for our campaigns. The quality is consistently impressive.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    rating: 5,
  },
  {
    name: "Emily Johnson",
    role: "Content Creator",
    content:
      "Easy to use, fast results, and endless possibilities. It's become an essential part of my toolkit.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
    rating: 5,
  },
];

const samplePrompts = [
  "A majestic dragon soaring through a starlit sky, digital fantasy art",
  "Minimalist modern kitchen with natural light, architectural photography",
  "Vibrant street art mural on a brick wall, urban photography",
  "Serene Japanese garden in autumn, traditional watercolor style",
  "Futuristic cityscape at sunset, cyberpunk aesthetic",
  "Cozy coffee shop interior with vintage decor, warm lighting",
];

const Index = () => {
  const generatorRef = useRef<HTMLDivElement>(null);

  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div style={{ width: "100vw", padding: 0, margin: 0, overflowX: "hidden" }}>
      {/* Hero Section */}
      <HeroSection onGetStarted={scrollToGenerator} />

      {/* Sample Prompts */}
      <div
        style={{
          width: "100vw",
          backgroundColor: "#f8fafc",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Title
              level={2}
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                marginBottom: 16,
              }}
            >
              Get Inspired by These Prompts
            </Title>
            <Paragraph style={{ fontSize: 18, color: "#64748b" }}>
              Try these popular prompts or create your own unique descriptions
            </Paragraph>
          </div>
          <Row gutter={[16, 16]}>
            {samplePrompts.map((prompt, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <Card
                  hoverable
                  style={{
                    height: "100%",
                    borderRadius: 12,
                    transition: "all 0.3s ease",
                  }}
                  styles={{
                    body: { padding: 16 },
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 25px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#475569",
                        lineHeight: 1.5,
                        flex: 1,
                      }}
                    >
                      "{prompt}"
                    </Text>
                    <RightOutlined
                      style={{
                        color: "#94a3b8",
                        fontSize: 12,
                        marginLeft: 8,
                        flexShrink: 0,
                      }}
                    />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Features Section */}
      <div id="features">
        <FeaturesSection />
      </div>
      
      {/* Testimonials */}
      <div
        style={{
          padding: "80px 24px",
          backgroundColor: "#fff",
          width: "100vw",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <Title
              level={2}
              style={{
                fontSize: "clamp(2rem, 5vw, 2.5rem)",
                marginBottom: 16,
              }}
            >
              Loved by Creators Worldwide
            </Title>
            <Paragraph style={{ fontSize: 20, color: "#64748b" }}>
              See what our community has to say about their experience
            </Paragraph>
          </div>
          <Row gutter={[32, 32]}>
            {testimonials.map((testimonial, index) => (
              <Col xs={24} md={8} key={index}>
                <Card
                  style={{
                    height: "100%",
                    borderRadius: 16,
                    border: "1px solid #f0f0f0",
                  }}
                  styles={{
                    body: { padding: 24 },
                  }}
                >
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    <QuestionCircleOutlined
                      style={{
                        fontSize: 32,
                        color: "#e2e8f0",
                        transform: "rotate(180deg)",
                      }}
                    />
                    <Paragraph
                      style={{
                        fontSize: 16,
                        color: "#475569",
                        lineHeight: 1.6,
                        margin: 0,
                        fontStyle: "italic",
                      }}
                    >
                      {testimonial.content}
                    </Paragraph>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Space>
                        <Avatar src={testimonial.avatar} size={40} />
                        <div>
                          <div style={{ fontWeight: 600, color: "#1f2937" }}>
                            {testimonial.name}
                          </div>
                          <div style={{ fontSize: 14, color: "#64748b" }}>
                            {testimonial.role}
                          </div>
                        </div>
                      </Space>
                      <Rate
                        disabled
                        defaultValue={testimonial.rating}
                        style={{ fontSize: 14 }}
                      />
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Pricing Section */}

    </div>
  );
};

export default Index;
