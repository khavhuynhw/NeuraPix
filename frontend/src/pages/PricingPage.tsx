import React, { useState } from "react";
import { Row, Col, Card, Button, List, Collapse, Divider } from "antd";
import {
  CheckOutlined,
  CrownOutlined,
  StarOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Panel } = Collapse;

const PricingPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly",
  );

  const pricingPlans = [
    {
      name: "Free",
      subtitle: "Perfect for getting started",
      price: billingPeriod === "monthly" ? 0 : 0,
      originalPrice: null,
      popular: false,
      icon: <StarOutlined />,
      features: [
        "10 AI images per month",
        "Basic art styles",
        "Standard resolution (512x512)",
        "Community gallery access",
        "Basic prompt templates",
        "Email support",
      ],
      cta: "Get Started Free",
      ctaLink: "/register",
    },
    {
      name: "Pro",
      subtitle: "For creators and professionals",
      price: billingPeriod === "monthly" ? 19 : 190,
      originalPrice: billingPeriod === "yearly" ? 228 : null,
      popular: true,
      icon: <CrownOutlined />,
      features: [
        "500 AI images per month",
        "Premium art styles & filters",
        "High resolution up to 2048x2048",
        "Advanced customization controls",
        "Commercial license included",
        "Priority rendering queue",
        "Advanced prompt engineering",
        "Bulk generation tools",
        "Custom style training",
        "Priority support",
      ],
      cta: "Start Pro Trial",
      ctaLink: "/register",
    },
    {
      name: "Enterprise",
      subtitle: "For teams and businesses",
      price: billingPeriod === "monthly" ? 99 : 990,
      originalPrice: billingPeriod === "yearly" ? 1188 : null,
      popular: false,
      icon: <RocketOutlined />,
      features: [
        "Unlimited AI image generation",
        "All premium styles & features",
        "Ultra-high resolution (4096x4096)",
        "API access & integrations",
        "Team collaboration tools",
        "Custom brand style training",
        "White-label solutions",
        "Advanced analytics dashboard",
        "Dedicated account manager",
        "24/7 priority support",
        "Custom integrations",
        "SLA guarantees",
      ],
      cta: "Contact Sales",
      ctaLink: "/contact",
    },
  ];

  const faqData = [
    {
      question: "What happens when I reach my image limit?",
      answer:
        "When you reach your monthly limit, you can either upgrade to a higher plan or wait until the next billing cycle. Pro and Enterprise users get priority access to additional capacity.",
    },
    {
      question: "Can I use generated images commercially?",
      answer:
        "Pro and Enterprise plans include full commercial usage rights. Free plan images are for personal use only. All images are generated with proper licensing for your peace of mind.",
    },
    {
      question: "How does the AI image generation work?",
      answer:
        "Our advanced AI models analyze your text prompts and create unique, high-quality images based on your specifications. Each image is generated fresh and is completely original.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time. You'll continue to have access to your plan features until the end of your current billing period.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team for a full refund.",
    },
    {
      question: "Is there an API available?",
      answer:
        "Yes, Enterprise plans include full API access with comprehensive documentation. Pro users can request API access for an additional fee.",
    },
  ];

  const features = [
    {
      category: "Generation Limits",
      free: "10 images/month",
      pro: "500 images/month",
      enterprise: "Unlimited",
    },
    {
      category: "Resolution",
      free: "512x512",
      pro: "Up to 2048x2048",
      enterprise: "Up to 4096x4096",
    },
    {
      category: "Art Styles",
      free: "Basic (5 styles)",
      pro: "Premium (50+ styles)",
      enterprise: "All styles + Custom",
    },
    {
      category: "Commercial Use",
      free: "❌",
      pro: "✅",
      enterprise: "✅",
    },
    {
      category: "API Access",
      free: "❌",
      pro: "Add-on available",
      enterprise: "✅",
    },
    {
      category: "Support",
      free: "Email",
      pro: "Priority Email",
      enterprise: "24/7 Dedicated",
    },
  ];

  return (
    <div
      style={{
        width: "100vw",
        overflowX: "hidden",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #f0f4f8 25%, #e2e8f0 50%, #f1f5f9 75%, #f8fafc 100%)",
        position: "relative",
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
          background: `
          radial-gradient(circle at 20% 20%, rgba(0, 121, 255, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(0, 199, 255, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(0, 121, 255, 0.02) 0%, transparent 50%)
        `,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          marginTop: "64px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Hero Section */}
        <section
          style={{
            padding: "80px 24px",
            textAlign: "center",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              background:
                "linear-gradient(135deg, rgba(0, 121, 255, 0.08), rgba(0, 199, 255, 0.08))",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(0, 121, 255, 0.2)",
              borderRadius: "50px",
              padding: "8px 20px",
              marginBottom: "24px",
            }}
          >
            <CrownOutlined style={{ color: "#0079FF", fontSize: "16px" }} />
            <span style={{ color: "#0079FF", fontWeight: 600 }}>
              Simple, Transparent Pricing
            </span>
          </div>

          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: 700,
              background:
                "linear-gradient(135deg, #0079FF 0%, #00C7FF 50%, #0079FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "24px",
              lineHeight: "1.2",
            }}
          >
            Choose Your Creative Journey
          </h1>

          <p
            style={{
              fontSize: "1.2rem",
              color: "#64748B",
              maxWidth: "600px",
              margin: "0 auto 40px",
              lineHeight: "1.6",
            }}
          >
            Start free and scale with your creativity. Our flexible plans grow
            with your needs, from personal projects to enterprise solutions.
          </p>

          {/* Billing Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              marginBottom: "60px",
            }}
          >
            <span
              style={{
                color: billingPeriod === "monthly" ? "#0079FF" : "#64748B",
                fontWeight: 600,
              }}
            >
              Monthly
            </span>
            <Button
              type="primary"
              style={{
                background:
                  billingPeriod === "yearly"
                    ? "linear-gradient(135deg, #0079FF, #00C7FF)"
                    : "#f1f5f9",
                border: "none",
                borderRadius: "20px",
                height: "40px",
                width: "80px",
                position: "relative",
              }}
              onClick={() =>
                setBillingPeriod(
                  billingPeriod === "monthly" ? "yearly" : "monthly",
                )
              }
            >
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  left: billingPeriod === "yearly" ? "44px" : "4px",
                  width: "32px",
                  height: "32px",
                  background: "#fff",
                  borderRadius: "50%",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              />
            </Button>
            <span
              style={{
                color: billingPeriod === "yearly" ? "#0079FF" : "#64748B",
                fontWeight: 600,
              }}
            >
              Yearly
              <span
                style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg, #0079FF, #00C7FF)",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  marginLeft: "8px",
                }}
              >
                Save 17%
              </span>
            </span>
          </div>
        </section>

        {/* Pricing Cards */}
        <section
          style={{
            padding: "0 24px 80px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <Row gutter={[24, 24]} justify="center">
            {pricingPlans.map((plan, index) => (
              <Col key={index} xs={24} lg={8}>
                <Card
                  style={{
                    height: "100%",
                    background: plan.popular
                      ? "linear-gradient(135deg, rgba(0, 121, 255, 0.02) 0%, rgba(0, 199, 255, 0.02) 100%)"
                      : "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(20px)",
                    border: plan.popular
                      ? "2px solid #0079FF"
                      : "1px solid rgba(0, 121, 255, 0.1)",
                    borderRadius: "20px",
                    boxShadow: plan.popular
                      ? "0 20px 60px rgba(0, 121, 255, 0.15)"
                      : "0 10px 40px rgba(0, 0, 0, 0.05)",
                    position: "relative",
                    transform: plan.popular ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.3s ease",
                  }}
                  bodyStyle={{ padding: "32px" }}
                  onMouseEnter={(e) => {
                    if (!plan.popular) {
                      e.currentTarget.style.transform =
                        "scale(1.02) translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 60px rgba(0, 121, 255, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!plan.popular) {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow =
                        "0 10px 40px rgba(0, 0, 0, 0.05)";
                    }
                  }}
                >
                  {plan.popular && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-1px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "linear-gradient(135deg, #0079FF, #00C7FF)",
                        color: "white",
                        padding: "8px 24px",
                        borderRadius: "0 0 12px 12px",
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    >
                      Most Popular
                    </div>
                  )}

                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: "32px",
                      marginTop: plan.popular ? "16px" : "0",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "60px",
                        height: "60px",
                        background: "linear-gradient(135deg, #0079FF, #00C7FF)",
                        borderRadius: "20px",
                        marginBottom: "16px",
                        fontSize: "24px",
                        color: "white",
                      }}
                    >
                      {plan.icon}
                    </div>

                    <h3
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#1e293b",
                        marginBottom: "8px",
                      }}
                    >
                      {plan.name}
                    </h3>

                    <p
                      style={{
                        color: "#64748B",
                        marginBottom: "24px",
                      }}
                    >
                      {plan.subtitle}
                    </p>

                    <div style={{ marginBottom: "16px" }}>
                      <span
                        style={{
                          fontSize: "3rem",
                          fontWeight: 700,
                          color: "#0079FF",
                        }}
                      >
                        ${plan.price}
                      </span>
                      {plan.originalPrice && (
                        <span
                          style={{
                            fontSize: "1.2rem",
                            color: "#94a3b8",
                            textDecoration: "line-through",
                            marginLeft: "8px",
                          }}
                        >
                          ${plan.originalPrice}
                        </span>
                      )}
                      <span
                        style={{
                          color: "#64748B",
                          fontSize: "1rem",
                        }}
                      >
                        /{billingPeriod === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                  </div>

                  <List
                    dataSource={plan.features}
                    renderItem={(feature) => (
                      <List.Item
                        style={{
                          border: "none",
                          padding: "8px 0",
                          color: "#334155",
                        }}
                      >
                        <CheckOutlined
                          style={{
                            color: "#0079FF",
                            marginRight: "12px",
                            fontSize: "16px",
                          }}
                        />
                        {feature}
                      </List.Item>
                    )}
                    style={{ marginBottom: "32px" }}
                  />

                  <Button
                    type={plan.popular ? "primary" : "default"}
                    size="large"
                    block
                    style={{
                      height: "48px",
                      borderRadius: "12px",
                      fontWeight: 700,
                      fontSize: "16px",
                      background: plan.popular
                        ? "linear-gradient(135deg, #0079FF, #00C7FF)"
                        : "rgba(0, 121, 255, 0.05)",
                      border: plan.popular
                        ? "none"
                        : "1px solid rgba(0, 121, 255, 0.2)",
                      color: plan.popular ? "white" : "#0079FF",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (plan.popular) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 12px 40px rgba(0, 121, 255, 0.4)";
                      } else {
                        e.currentTarget.style.background =
                          "rgba(0, 121, 255, 0.1)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (plan.popular) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      } else {
                        e.currentTarget.style.background =
                          "rgba(0, 121, 255, 0.05)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <Link
                      to={plan.ctaLink}
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {plan.cta}
                    </Link>
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Feature Comparison */}
        <section
          style={{
            padding: "80px 24px",
            background: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
              <h2
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #0079FF 0%, #00C7FF 50%, #0079FF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "16px",
                }}
              >
                Compare Plans
              </h2>
              <p style={{ color: "#64748B", fontSize: "1.1rem" }}>
                Choose the perfect plan for your creative needs
              </p>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(0, 121, 255, 0.1)",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0, 121, 255, 0.05)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  gap: "0",
                  background: "linear-gradient(135deg, #0079FF, #00C7FF)",
                  color: "white",
                  padding: "20px",
                  fontWeight: 700,
                }}
              >
                <div>Features</div>
                <div style={{ textAlign: "center" }}>Free</div>
                <div style={{ textAlign: "center" }}>Pro</div>
                <div style={{ textAlign: "center" }}>Enterprise</div>
              </div>

              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    gap: "0",
                    padding: "16px 20px",
                    borderBottom:
                      index < features.length - 1
                        ? "1px solid rgba(0, 121, 255, 0.1)"
                        : "none",
                    background:
                      index % 2 === 0
                        ? "rgba(248, 250, 252, 0.5)"
                        : "transparent",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#334155" }}>
                    {feature.category}
                  </div>
                  <div style={{ textAlign: "center", color: "#64748B" }}>
                    {feature.free}
                  </div>
                  <div style={{ textAlign: "center", color: "#64748B" }}>
                    {feature.pro}
                  </div>
                  <div style={{ textAlign: "center", color: "#64748B" }}>
                    {feature.enterprise}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section
          style={{
            padding: "80px 24px",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                background:
                  "linear-gradient(135deg, #0079FF 0%, #00C7FF 50%, #0079FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "16px",
              }}
            >
              Frequently Asked Questions
            </h2>
            <p style={{ color: "#64748B", fontSize: "1.1rem" }}>
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <Collapse
            expandIconPosition="right"
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(0, 121, 255, 0.1)",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(0, 121, 255, 0.05)",
            }}
          >
            {faqData.map((faq, index) => (
              <Panel
                header={
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#1e293b",
                      fontSize: "1.1rem",
                    }}
                  >
                    {faq.question}
                  </span>
                }
                key={index}
                style={{
                  borderBottom:
                    index < faqData.length - 1
                      ? "1px solid rgba(0, 121, 255, 0.1)"
                      : "none",
                }}
              >
                <p
                  style={{
                    color: "#64748B",
                    lineHeight: "1.6",
                    margin: 0,
                    fontSize: "1rem",
                  }}
                >
                  {faq.answer}
                </p>
              </Panel>
            ))}
          </Collapse>
        </section>

        {/* CTA Section */}
        <section
          style={{
            padding: "80px 24px",
            background:
              "linear-gradient(135deg, #0079FF 0%, #00C7FF 50%, #0079FF 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                marginBottom: "20px",
                color: "white",
              }}
            >
              Ready to Start Creating?
            </h2>
            <p
              style={{
                fontSize: "1.2rem",
                marginBottom: "40px",
                opacity: 0.9,
              }}
            >
              Join thousands of creators who are already using NEURAPIX to bring
              their ideas to life
            </p>
            <div
              style={{
                display: "flex",
                gap: "16px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                size="large"
                style={{
                  height: "48px",
                  padding: "0 32px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "16px",
                  background: "white",
                  border: "none",
                  color: "#0079FF",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 40px rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Link
                  to="/register"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  Start Free Trial
                </Link>
              </Button>
              <Button
                size="large"
                style={{
                  height: "48px",
                  padding: "0 32px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "16px",
                  background: "transparent",
                  border: "2px solid white",
                  color: "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.color = "#0079FF";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Link
                  to="/contact"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  Contact Sales
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PricingPage;
