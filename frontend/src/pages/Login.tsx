import React from 'react';
import { Form, Input, Button, Checkbox, Typography, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';

const { Title, Text, Paragraph } = Typography;

const MainWrapper = styled.div`
  min-height: calc(100vh - 72px - 260px); // header + footer
  background: #f5f5f5;
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
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

const LoginCol = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 56px 48px;
  @media (max-width: 900px) {
    padding: 32px 16px;
    background: #fff;
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  border: none;
`;

const LoginButton = styled(Button)`
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

const Login: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    // handle login
  };

  return (
    <MainWrapper>
      <CenteredContainer>
        <BrandingCol>
          <Text type="secondary" style={{ fontSize: '1.1rem', letterSpacing: 1 }}>WELCOME TO</Text>
          <Logo>
            NEURA<span className="dot">.</span>PIX
          </Logo>
          <Paragraph style={{ fontSize: '1.08rem', color: '#222', marginBottom: '2.5rem', maxWidth: 400 }}>
            NEURAPIX is an AI-powered photo editing platform that enhances images instantly. With advanced algorithms, it adjusts colors, removes noise, sharpens details, and restores old photos effortlessly. Perfect for both professionals and casual users—<b>no Photoshop skills needed!</b>
          </Paragraph>
          <Copyright>© 2025 NEURAPIX All rights reserved.</Copyright>
        </BrandingCol>
        <LoginCol>
          <StyledCard>
            <Title level={3} style={{ textAlign: 'center', marginBottom: 24, fontWeight: 700 }}>Log In To Your Account</Title>
            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Email address" 
                  size="large"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <a href="#" style={{ color: '#0079ff', fontWeight: 500 }}>Forgot Password?</a>
              </div>
              <Form.Item style={{ marginBottom: 8 }}>
                <LoginButton type="primary" htmlType="submit" size="large">
                  Login
                </LoginButton>
              </Form.Item>
              <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: '0.95rem', marginBottom: 12 }}>
                By continuing, you agree to our <a href="#" style={{ color: '#0079ff' }}>Terms of Use</a> and <a href="#" style={{ color: '#0079ff' }}>Privacy Policy</a>
              </Text>
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Text>Don't have an Account? </Text>
                <a href="#" style={{ color: '#0079ff', fontWeight: 500 }}>Register here</a>
              </div>
            </Form>
          </StyledCard>
        </LoginCol>
      </CenteredContainer>
    </MainWrapper>
  );
};

export default Login; 