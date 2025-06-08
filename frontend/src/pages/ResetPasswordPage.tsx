import { Form, Input, Button, Typography, Row, Col, Space, message } from "antd";
import { LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Sparkle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const { Title, Paragraph, Text } = Typography;

export const ResetPasswordPage = () => {
  const [form] = Form.useForm();
  const { confirmResetPw } = useAuth(); // HÀM GỌI API confirm reset password
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    if (!token) {
      message.error("Reset token is missing or invalid.");
      return;
    }
    try {
      await confirmResetPw({
        token,
        newPassword: values.newPassword,
      });
      message.success("Your password has been reset successfully!");
      navigate("/login");
    } catch (error: any) {
      form.setFields([
        {
          name: "newPassword",
          errors: [error.message || "Reset password failed"],
        },
      ]);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
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
        {/* Left Side */}
        <Col
          xs={24}
          lg={12}
          style={{
            background: "linear-gradient(135deg, #0079FF 0%, #0056B3 50%, #003D80 100%)",
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
                Set a New Password
              </Title>
              <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 16 }}>
                Choose a strong password to keep your account secure.
              </Paragraph>
            </div>
          </Space>
        </Col>

        {/* Right Side */}
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
                Create New Password
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Enter your new password below
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
                name="newPassword"
                rules={[
                  { required: true, message: "Please enter your new password!" },
                  { min: 6, message: "Password must be at least 6 characters." },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#0079FF" }} />}
                  placeholder="New Password"
                  style={{
                    height: 48,
                    borderRadius: 8,
                    fontSize: 16,
                  }}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#0079FF" }} />}
                  placeholder="Confirm Password"
                  style={{
                    height: 48,
                    borderRadius: 8,
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
                  Reset Password
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Col>
      </Row>
    </div>
  );
};