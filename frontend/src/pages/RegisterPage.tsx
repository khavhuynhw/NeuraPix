import {
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Row,
  Col,
  Space,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Title, Paragraph, Text } = Typography;

export const RegisterPage = () => {
  const [form] = Form.useForm();
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      await register({
        username: values.username,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      navigate("/login");
    } catch (error: any) {
      form.setFields([
        {
          name: "agree",
          errors: [error.message || "Registration failed"],
        },
      ]);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 128px)", // Account for header height
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        padding: "80px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1000,
          backgroundColor: "white",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          minHeight: 600,
        }}
      >
        <Row style={{ minHeight: 600 }}>
          {/* Left Side - Welcome Section */}
          <Col
            xs={24}
            lg={14}
            style={{
              padding: "60px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "#fafbfc",
            }}
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Title
                  level={4}
                  style={{
                    color: "#64748b",
                    fontSize: 16,
                    fontWeight: 400,
                    margin: 0,
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  JOIN THE FUTURE OF
                </Title>
                <Title
                  level={1}
                  style={{
                    color: "#1f2937",
                    fontSize: 48,
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: "2px",
                  }}
                >
                  NEURAPIX
                </Title>
              </div>

              <div style={{ maxWidth: 400 }}>
                <Paragraph
                  style={{
                    color: "#4b5563",
                    fontSize: 16,
                    lineHeight: 1.6,
                    margin: "24px 0 24px 0",
                  }}
                >
                  Create your account and unlock the power of{" "}
                  <Text strong style={{ color: "#0079FF" }}>
                    AI-powered
                  </Text>{" "}
                  image generation. Join thousands of creators who are already
                  transforming their ideas into stunning visuals.
                </Paragraph>
                <Paragraph
                  style={{
                    color: "#4b5563",
                    fontSize: 16,
                    lineHeight: 1.6,
                  }}
                >
                  Start your creative journey today with professional-grade
                  tools and unlimited possibilities.
                </Paragraph>
              </div>

              <div
                style={{
                  background: "rgba(0, 121, 255, 0.05)",
                  borderRadius: 12,
                  padding: 20,
                  border: "1px solid rgba(0, 121, 255, 0.1)",
                }}
              >
                <Title
                  level={5}
                  style={{ color: "#0079FF", margin: 0, marginBottom: 12 }}
                >
                  ✨ What you'll get:
                </Title>
                <Space direction="vertical" size="small">
                  <Text style={{ color: "#4b5563" }}>
                    • Free trial with 10 image generations
                  </Text>
                  <Text style={{ color: "#4b5563" }}>
                    • Access to all AI art styles
                  </Text>
                  <Text style={{ color: "#4b5563" }}>
                    • High-resolution downloads
                  </Text>
                  <Text style={{ color: "#4b5563" }}>
                    • Priority customer support
                  </Text>
                </Space>
              </div>

              <Text style={{ color: "#9ca3af", fontSize: 14 }}>
                © 2025 NEURAPIX All rights reserved.
              </Text>
            </Space>
          </Col>

          {/* Right Side - Register Form */}
          <Col
            xs={24}
            lg={10}
            style={{
              padding: "60px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <Title
                  level={2}
                  style={{
                    color: "#1f2937",
                    fontSize: 28,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  Create Your Account
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  Join NEURAPIX and start creating amazing art with AI
                </Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
                style={{ width: "100%" }}
              >
                <Row gutter={12}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="firstName"
                      rules={[{ required: true, message: "Required" }]}
                      style={{ marginBottom: 16 }}
                    >
                      <Input
                        placeholder="First Name"
                        style={{
                          height: 44,
                          borderRadius: 6,
                          border: "1px solid #d1d5db",
                          fontSize: 14,
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#0079FF";
                          e.target.style.boxShadow =
                            "0 0 0 2px rgba(0, 121, 255, 0.1)";
                          e.target.style.transform = "translateY(-1px)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#d1d5db";
                          e.target.style.boxShadow = "none";
                          e.target.style.transform = "translateY(0)";
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="lastName"
                      rules={[{ required: true, message: "Required" }]}
                      style={{ marginBottom: 16 }}
                    >
                      <Input
                        placeholder="Last Name"
                        style={{
                          height: 44,
                          borderRadius: 6,
                          border: "1px solid #d1d5db",
                          fontSize: 14,
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#0079FF";
                          e.target.style.boxShadow =
                            "0 0 0 2px rgba(0, 121, 255, 0.1)";
                          e.target.style.transform = "translateY(-1px)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#d1d5db";
                          e.target.style.boxShadow = "none";
                          e.target.style.transform = "translateY(0)";
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: "Please input your username!" },
                    {
                      min: 3,
                      max: 50,
                      message: "Username must be between 3 and 50 characters",
                    },
                  ]}
                  style={{ marginBottom: 16 }}
                >
                  <Input
                    placeholder="Username"
                    style={{
                      height: 44,
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 14,
                      transition: "all 0.3s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#0079FF";
                      e.target.style.boxShadow =
                        "0 0 0 2px rgba(0, 121, 255, 0.1)";
                      e.target.style.transform = "translateY(-1px)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                      e.target.style.boxShadow = "none";
                      e.target.style.transform = "translateY(0)";
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Please enter a valid email!" },
                  ]}
                  style={{ marginBottom: 16 }}
                >
                  <Input
                    placeholder="Email address"
                    style={{
                      height: 44,
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 14,
                      transition: "all 0.3s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#0079FF";
                      e.target.style.boxShadow =
                        "0 0 0 2px rgba(0, 121, 255, 0.1)";
                      e.target.style.transform = "translateY(-1px)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                      e.target.style.boxShadow = "none";
                      e.target.style.transform = "translateY(0)";
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please input your password!" },
                    {
                      min: 8,
                      message: "Password must be at least 8 characters!",
                    },
                  ]}
                  style={{ marginBottom: 16 }}
                >
                  <Input.Password
                    placeholder="Password (min. 8 characters)"
                    style={{
                      height: 44,
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 14,
                      transition: "all 0.3s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#0079FF";
                      e.target.style.boxShadow =
                        "0 0 0 2px rgba(0, 121, 255, 0.1)";
                      e.target.style.transform = "translateY(-1px)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                      e.target.style.boxShadow = "none";
                      e.target.style.transform = "translateY(0)";
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your password!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Passwords do not match!")
                        );
                      },
                    }),
                  ]}
                  style={{ marginBottom: 20 }}
                >
                  <Input.Password
                    placeholder="Confirm Password"
                    style={{
                      height: 44,
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 14,
                      transition: "all 0.3s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#0079FF";
                      e.target.style.boxShadow =
                        "0 0 0 2px rgba(0, 121, 255, 0.1)";
                      e.target.style.transform = "translateY(-1px)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                      e.target.style.boxShadow = "none";
                      e.target.style.transform = "translateY(0)";
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="agree"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("Please accept the terms!")
                            ),
                    },
                  ]}
                  style={{ marginBottom: 24 }}
                >
                  <Checkbox style={{ color: "#64748b", fontSize: 14 }}>
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      style={{
                        color: "#0079FF",
                        transition: "color 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#3399FF")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#0079FF")
                      }
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      style={{
                        color: "#0079FF",
                        transition: "color 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#3399FF")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#0079FF")
                      }
                    >
                      Privacy Policy
                    </Link>
                  </Checkbox>
                </Form.Item>

                <Form.Item style={{ margin: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    style={{
                      height: 44,
                      borderRadius: 6,
                      fontSize: 16,
                      fontWeight: 600,
                      background: "#0079FF",
                      border: "none",
                      marginBottom: 20,
                      transition: "all 0.3s ease",
                      transform: "scale(1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1.02) translateY(-2px)";
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, #3399FF, #0079FF)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 25px rgba(0, 121, 255, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1) translateY(0)";
                      e.currentTarget.style.background = "#0079FF";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform =
                        "scale(0.98) translateY(0)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1.02) translateY(-2px)";
                    }}
                  >
                    Create Account
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ textAlign: "center" }}>
                <Text style={{ color: "#64748b", fontSize: 14 }}>
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    style={{
                      color: "#0079FF",
                      fontWeight: 600,
                      textDecoration: "underline",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#3399FF";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#0079FF";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    Sign in here
                  </Link>
                </Text>
              </div>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};
