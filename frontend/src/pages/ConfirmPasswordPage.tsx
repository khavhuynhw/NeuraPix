/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Form, Input, Button, Typography, Card, message } from "antd";
import styled from "@emotion/styled";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const MainWrapper = styled.div`
  min-height: calc(100vh - 72px - 260px);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0 32px 0;
`;

const CenteredContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  display: flex;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  @media (max-width: 900px) {
    flex-direction: column;
    max-width: 95vw;
    box-shadow: none;
    border-radius: 0;
  }
`;

const BrandingCol = styled.div`
  flex: 1.1;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 56px 48px 40px 48px;
  @media (max-width: 900px) {
    padding: 32px 24px 16px 24px;
    align-items: center;
    text-align: center;
  }
`;

const FormCol = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 56px 48px;
  @media (max-width: 900px) {
    padding: 32px 16px;
  }
`;

const Logo = styled.div`
  font-size: 2.8rem;
  font-weight: 700;
  color: #222;
  margin: 0.5rem 0 1.5rem 0;
  letter-spacing: 2px;
  .dot {
    color: #0079ff;
  }
`;

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 370px;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
`;

const ResetButton = styled(Button)`
  width: 100%;
  height: 40px;
  background-color: #0079ff;
  border-color: #0079ff;
  font-weight: 600;
  &:hover {
    background-color: #0056b3 !important;
    border-color: #0056b3 !important;
  }
`;

const Copyright = styled(Text)`
  margin-top: 2.5rem;
  color: #888;
  font-size: 0.95rem;
`;

const ConfirmPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const t = queryParams.get("token");
    if (!t) {
      message.error("Token is missing in the URL.");
    }
    setToken(t);
  }, [location.search]);

  const onFinish = async (values: any) => {
    if (!token) return;

    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/auth/confirm-reset-password", {
        token: token, 
        newPassword: values.password,
        confirmPassword: values.confirmPassword,
      });

      message.success("Your password has been reset successfully!");
      navigate("/login");
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <MainWrapper>
      <CenteredContainer>
        <BrandingCol>
          <Text
            type="secondary"
            style={{ fontSize: "1.1rem", letterSpacing: 1 }}
          >
            WELCOME TO
          </Text>
          <Logo>
            NEURA<span className="dot">.</span>PIX
          </Logo>
          <Paragraph
            style={{
              fontSize: "1.08rem",
              color: "#222",
              marginBottom: "2.5rem",
              maxWidth: 400,
            }}
          >
            Reset your password to regain access and continue enhancing your
            photos with our AI tools.
          </Paragraph>
          <Copyright>© 2025 NEURAPIX All rights reserved.</Copyright>
        </BrandingCol>
        <FormCol>
          <StyledCard>
            <Title
              level={3}
              style={{ textAlign: "center", marginBottom: 24, fontWeight: 700 }}
            >
              Set New Password
            </Title>
            <Form
              form={form}
              name="confirmPassword"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your new password!",
                  },
                ]}
              >
                <Input.Password placeholder="New Password" size="large" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                rules={[
                  {
                    required: true,
                    message: "Please confirm your new password!",
                  },
                ]}
              >
                <Input.Password placeholder="Confirm Password" size="large" />
              </Form.Item>
              <Form.Item style={{ marginBottom: 16 }}>
                <ResetButton type="primary" htmlType="submit" size="large">
                  Confirm
                </ResetButton>
              </Form.Item>
            </Form>
          </StyledCard>
        </FormCol>
      </CenteredContainer>
    </MainWrapper>
  );
};

export default ConfirmPasswordPage;
