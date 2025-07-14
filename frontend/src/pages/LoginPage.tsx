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
import { useAuth } from "../context/AuthContext"; // Add this import

const { Title, Paragraph, Text } = Typography;

export const LoginPage = () => {
  const [form] = Form.useForm();
  const { login } = useAuth(); // Get login from context
  const navigate = useNavigate(); // For redirect after login

  const onFinish = async (values: any) => {
    try {
      await login({
        email: values.email,
        password: values.password,
      });
      navigate("/"); // Redirect on success
    } catch (error: any) {
      form.setFields([
        {
          name: "email",
          errors: [error.message || "Login failed"],
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
          minHeight: 500,
        }}
      >
        <Row style={{ minHeight: 500 }}>
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
                  WELCOME TO
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
                  NEURAPIX is an{" "}
                  <Text strong style={{ color: "#0079FF" }}>
                    AI-powered
                  </Text>{" "}
                  photo editing platform that enhances images instantly. With
                  advanced algorithms, it adjusts colors, removes noise,
                  sharpens details, and optimizes lighting automatically.
                </Paragraph>
                <Paragraph
                  style={{
                    color: "#4b5563",
                    fontSize: 16,
                    lineHeight: 1.6,
                  }}
                >
                  Perfect for both professionals and casual users—
                  <Text strong style={{ color: "#0079FF" }}>
                    no Photoshop skills needed!
                  </Text>
                </Paragraph>
              </div>

              <Text style={{ color: "#9ca3af", fontSize: 14 }}>
                © 2025 NEURAPIX All rights reserved.
              </Text>
            </Space>
          </Col>

          {/* Right Side - Login Form */}
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
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <Title
                  level={2}
                  style={{
                    color: "#1f2937",
                    fontSize: 28,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  Log In To Your Account
                </Title>
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
                  style={{ marginBottom: 20 }}
                >
                  <Input
                    placeholder="Email address"
                    style={{
                      height: 48,
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 16,
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
                  ]}
                  style={{ marginBottom: 20 }}
                >
                  <Input.Password
                    placeholder="Password"
                    style={{
                      height: 48,
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 16,
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

                <Row
                  justify="space-between"
                  align="middle"
                  style={{ marginBottom: 24 }}
                >
                  <Form.Item
                    name="remember"
                    valuePropName="checked"
                    style={{ margin: 0 }}
                  >
                    <Checkbox style={{ color: "#64748b" }}>
                      Remember me
                    </Checkbox>
                  </Form.Item>
                  <Link
                    to="/forgot-password"
                    style={{
                      color: "#0079FF",
                      fontSize: 14,
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#3399FF";
                      e.currentTarget.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#0079FF";
                      e.currentTarget.style.textDecoration = "none";
                    }}
                  >
                    Forgot Password
                  </Link>
                </Row>

                <div style={{ marginBottom: 20 }}>
                  <Text style={{ color: "#64748b", fontSize: 14 }}>
                    By continuing, you agree to our{" "}
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
                      Terms of Use
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
                    .
                  </Text>
                </div>

                <Form.Item style={{ margin: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    style={{
                      height: 48,
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
                    Login
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ textAlign: "center" }}>
                <Text style={{ color: "#64748b", fontSize: 16 }}>
                  Don't have an Account ?{" "}
                  <Link
                    to="/register"
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
                    Register here
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
