import React, { useState } from "react";
import { Row, Col, Card, Button, Typography, Space, Divider } from "antd";
import {
  CheckOutlined,
  StarOutlined,
  RocketOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const PricingPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly",
  );

  const pricingPlans = [
    {
      name: "Free",
      subtitle: "Perfect for getting started",
      price: 0,
      period: "Forever free",
      popular: false,
      features: [
        "10 AI images per month",
        "Basic art styles",
        "Standard resolution",
        "Community support",
      ],
      limitations: [
        "Limited to basic styles",
        "Standard resolution only",
        "No commercial license",
      ],
      cta: "Continue with Free",
      ctaSecondary: false,
    },
    {
      name: "Pro",
      subtitle: "Unlock the full potential of AI image generation",
      price: billingPeriod === "monthly" ? 19 : 190,
      period: billingPeriod === "monthly" ? "per month" : "per year",
      originalPrice: billingPeriod === "yearly" ? 228 : null,
      popular: true,
      features: [
        "500 AI images per month",
        "All premium art styles & filters", 
        "High resolution up to 4K",
        "Commercial license included",
        "Priority rendering queue",
        "Advanced prompt engineering",
        "Bulk generation tools",
        "Custom style training",
        "Priority email support",
        "No watermarks",
      ],
      cta: "Upgrade to Pro",
      ctaSecondary: false,
    },
  ];


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        padding: "80px 20px 40px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Title level={1} style={{ fontSize: 42, fontWeight: 600, color: "#202123", marginBottom: 16 }}>
            Upgrade your plan
          </Title>
          <Paragraph style={{ fontSize: 18, color: "#6e6e80", marginBottom: 32 }}>
            Get the most out of NEURAPIX with more image generations and advanced features
          </Paragraph>
          
          {/* Billing Toggle */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#f4f4f4",
              borderRadius: "12px",
              padding: "4px",
              marginBottom: 40,
            }}
          >
            <Button
              type={billingPeriod === "monthly" ? "primary" : "text"}
              onClick={() => setBillingPeriod("monthly")}
              style={{
                borderRadius: "8px",
                border: "none",
                background: billingPeriod === "monthly" ? "#10a37f" : "transparent",
                color: billingPeriod === "monthly" ? "white" : "#6e6e80",
                fontWeight: 500,
                padding: "8px 16px",
                minWidth: 80,
              }}
            >
              Monthly
            </Button>
            <Button
              type={billingPeriod === "yearly" ? "primary" : "text"}
              onClick={() => setBillingPeriod("yearly")}
              style={{
                borderRadius: "8px",
                border: "none",
                background: billingPeriod === "yearly" ? "#10a37f" : "transparent",
                color: billingPeriod === "yearly" ? "white" : "#6e6e80",
                fontWeight: 500,
                padding: "8px 16px",
                minWidth: 80,
                position: "relative",
              }}
            >
              Annual
              {billingPeriod === "yearly" && (
                <div
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "#ff6b35",
                    color: "white",
                    fontSize: "10px",
                    padding: "2px 6px",
                    borderRadius: "8px",
                    fontWeight: 600,
                  }}
                >
                  20% off
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Pricing Cards */}
        <Row gutter={24}>
          {pricingPlans.map((plan, index) => (
            <Col key={index} xs={24} md={12}>
              <Card
                style={{
                  border: plan.popular ? "2px solid #10a37f" : "1px solid #e5e5e5",
                  borderRadius: 16,
                  boxShadow: plan.popular 
                    ? "0 8px 32px rgba(16, 163, 127, 0.15)" 
                    : "0 4px 12px rgba(0, 0, 0, 0.05)",
                  position: "relative",
                  overflow: "hidden",
                  height: "100%",
                }}
              >
                {plan.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "#10a37f",
                      color: "white",
                      padding: "6px 16px",
                      fontSize: 12,
                      fontWeight: 600,
                      borderBottomLeftRadius: 8,
                    }}
                  >
                    Most popular
                  </div>
                )}
                
                <div style={{ padding: 32, height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 24 }}>
                      <Title level={3} style={{ margin: 0, color: "#202123", fontSize: 24, fontWeight: 600 }}>
                        {plan.name}
                      </Title>
                      <Text style={{ color: "#6e6e80", fontSize: 16 }}>
                        {plan.subtitle}
                      </Text>
                    </div>
                    
                    <div style={{ marginBottom: 32 }}>
                      <Space align="baseline">
                        <Text style={{ fontSize: 32, fontWeight: 700, color: "#202123" }}>
                          ${plan.price}
                        </Text>
                        {plan.originalPrice && (
                          <Text style={{ 
                            fontSize: 20, 
                            color: "#9ca3af", 
                            textDecoration: "line-through" 
                          }}>
                            ${plan.originalPrice}
                          </Text>
                        )}
                        <Text style={{ color: "#6e6e80", fontSize: 16 }}>
                          {plan.period}
                        </Text>
                      </Space>
                    </div>

                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <CheckOutlined style={{ color: "#10a37f", fontSize: 14 }} />
                          <Text style={{ color: "#374151", fontSize: 14 }}>{feature}</Text>
                        </div>
                      ))}
                      
                      {plan.limitations && plan.limitations.map((limitation, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ 
                            width: 14, 
                            height: 14, 
                            borderRadius: "50%", 
                            border: "1px solid #d1d5db",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <div style={{ 
                              width: 6, 
                              height: 1, 
                              background: "#9ca3af" 
                            }} />
                          </div>
                          <Text style={{ color: "#9ca3af", fontSize: 14 }}>{limitation}</Text>
                        </div>
                      ))}
                    </Space>
                  </div>
                  
                  <div style={{ marginTop: 32 }}>
                    <Button
                      type={plan.popular ? "primary" : "default"}
                      size="large"
                      block
                      style={{
                        background: plan.popular ? "#10a37f" : "white",
                        borderColor: plan.popular ? "#10a37f" : "#d1d5db",
                        color: plan.popular ? "white" : "#374151",
                        borderRadius: 8,
                        fontWeight: 500,
                        padding: "12px 24px",
                        height: "auto",
                      }}
                      icon={plan.popular ? <ArrowRightOutlined /> : undefined}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Footer Info */}
        <div style={{ textAlign: "center", marginTop: 48, padding: "32px 0" }}>
          <Paragraph style={{ color: "#6e6e80", fontSize: 14, marginBottom: 16 }}>
            Cancel anytime. No setup fees. Plans can be changed or cancelled at any time.
          </Paragraph>
          <Paragraph style={{ color: "#6e6e80", fontSize: 14 }}>
            Need help choosing? <Button type="link" style={{ padding: 0, fontSize: 14 }}>Contact our sales team</Button>
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
