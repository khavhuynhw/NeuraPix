import { Form, Input, Button, Typography, Row, Col, Space } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Sparkle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const { Title, Paragraph, Text } = Typography;

export const ForgotPasswordPage = () => {
  const [form] = Form.useForm();
  const { resetPw } = useAuth();

  const onFinish = async (values: any) => {
    try {
      await resetPw({
        email: values.email,
      });
    } catch (error: any) {
      form.setFields([
        {
          name: "email",
          errors: [error.message || "Reset password failed"],
        },
      ]);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Row
        style={{
          width: "100%",
          maxWidth: 900,
          minHeight: "500px",
          backgroundColor: "white",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(0, 121, 255, 0.1)",
          overflow: "hidden",
        }}
      >
        {/* Left Side - Branding */}
        <Col
          xs={24}
          lg={12}
          style={{
            background:
              "linear-gradient(135deg, #0079FF 0%, #0056B3 50%, #003D80 100%)",
            color: "white",
            padding: "60px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    height: 40,
                    width: 40,
                    background: "linear-gradient(135deg, #00C7FF, #0079FF)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0, 199, 255, 0.4)",
                  }}
                >
                  <Sparkle style={{ color: "#fff", fontSize: 24 }} />
                </div>
                <Title
                  level={1}
                  style={{
                    color: "white",
                    fontSize: 40,
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: "2px",
                  }}
                >
                  NEURAPIX
                </Title>
              </div>
            </div>

            <div style={{ maxWidth: 350 }}>
              <Title level={3} style={{ color: "white", marginBottom: 16 }}>
                Forgot Your Password?
              </Title>
              <Paragraph
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: 16,
                  lineHeight: 1.6,
                }}
              >
                No worries! It happens to the best of us. Enter your email
                address and we'll send you a link to reset your password.
              </Paragraph>
              <Paragraph
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                You'll be back to creating amazing AI art in no time!
              </Paragraph>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: 12,
                padding: 20,
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
                💡 <strong>Tip:</strong> Check your spam folder if you don't see
                the email within a few minutes.
              </Text>
            </div>
          </Space>
        </Col>

        {/* Right Side - Reset Form */}
        <Col
          xs={24}
          lg={12}
          style={{
            padding: "60px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Link
                to="/login"
                style={{
                  color: "#0079FF",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                <ArrowLeftOutlined /> Back to Login
              </Link>

              <Title
                level={2}
                style={{
                  color: "#1f2937",
                  fontSize: 28,
                  fontWeight: 700,
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                Reset Password
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Enter your email to receive reset instructions
              </Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              size="large"
              style={{ width: "100%" }}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "#0079FF" }} />}
                  placeholder="Enter your email address"
                  style={{
                    height: 48,
                    borderRadius: 8,
                    borderColor: "rgba(0, 121, 255, 0.3)",
                    fontSize: 16,
                  }}
                />
              </Form.Item>

              <Form.Item style={{ margin: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  style={{
                    height: 48,
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #0079FF 0%, #0056B3 100%)",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0, 121, 255, 0.3)",
                    marginBottom: 16,
                  }}
                >
                  Send Reset Link
                </Button>
              </Form.Item>
            </Form>

            <div
              style={{
                textAlign: "center",
                background: "rgba(0, 121, 255, 0.05)",
                padding: 16,
                borderRadius: 8,
                border: "1px solid rgba(0, 121, 255, 0.1)",
              }}
            >
              <Text style={{ color: "#64748b", fontSize: 14 }}>
                Remember your password?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#0079FF",
                    fontWeight: 600,
                  }}
                >
                  Sign in instead
                </Link>
              </Text>
            </div>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                Didn't receive an email? Check your spam folder or{" "}
                <Link to="/contact" style={{ color: "#0079FF" }}>
                  contact support
                </Link>
              </Text>
            </div>
          </Space>
        </Col>
      </Row>
    </div>
  );
};
