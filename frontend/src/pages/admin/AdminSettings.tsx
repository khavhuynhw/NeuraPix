import React from "react";
import {
  Card,
  Typography,
  Form,
  Input,
  Switch,
  Button,
  Row,
  Col,
  Divider,
  Select,
  InputNumber,
  Space,
  message,
} from "antd";
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminSettings = () => {
  const [form] = Form.useForm();

  const handleSave = (values: any) => {
    console.log("Saving settings:", values);
    message.success("Settings saved successfully");
  };

  const handleReset = () => {
    form.resetFields();
    message.info("Settings reset to default values");
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        System Settings
      </Title>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Card title="General Settings" style={{ marginBottom: 24 }}>
              <Form.Item
                name="siteName"
                label="Site Name"
                initialValue="NeuraPix"
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="siteDescription"
                label="Site Description"
                initialValue="AI-powered image generation platform"
              >
                <TextArea rows={3} />
              </Form.Item>

              <Form.Item name="maintenanceMode" label="Maintenance Mode" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="allowRegistration" label="Allow New Registration" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>

              <Form.Item name="requireEmailVerification" label="Require Email Verification" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
            </Card>

            <Card title="API & Models" style={{ marginBottom: 24 }}>
              <Form.Item
                name="defaultModel"
                label="Default AI Model"
                initialValue="dall-e-3"
              >
                <Select>
                  <Option value="dall-e-3">DALL-E 3</Option>
                  <Option value="midjourney">Midjourney</Option>
                  <Option value="stable-diffusion">Stable Diffusion</Option>
                </Select>
              </Form.Item>

              <Form.Item name="enableDallE" label="Enable DALL-E" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>

              <Form.Item name="enableMidjourney" label="Enable Midjourney" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>

              <Form.Item name="enableStableDiffusion" label="Enable Stable Diffusion" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>

              <Form.Item
                name="maxImageResolution"
                label="Max Image Resolution"
                initialValue={1024}
              >
                <Select>
                  <Option value={512}>512x512</Option>
                  <Option value={1024}>1024x1024</Option>
                  <Option value={2048}>2048x2048</Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="User Limits" style={{ marginBottom: 24 }}>
              <Form.Item
                name="freeUserImageLimit"
                label="Free User Daily Limit"
                initialValue={10}
              >
                <InputNumber min={1} max={100} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="premiumUserImageLimit"
                label="Premium User Daily Limit"
                initialValue={100}
              >
                <InputNumber min={1} max={1000} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="maxPromptLength"
                label="Max Prompt Length"
                initialValue={500}
              >
                <InputNumber min={50} max={2000} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="imageRetentionDays"
                label="Image Retention (Days)"
                initialValue={30}
              >
                <InputNumber min={1} max={365} style={{ width: "100%" }} />
              </Form.Item>
            </Card>

            <Card title="Notifications" style={{ marginBottom: 24 }}>
              <Form.Item name="emailNotifications" label="Email Notifications" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>

              <Form.Item name="newUserNotifications" label="New User Notifications" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>

              <Form.Item name="errorAlerts" label="Error Alerts" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>

              <Form.Item
                name="adminEmail"
                label="Admin Email"
                initialValue="admin@neuralpix.com"
              >
                <Input type="email" />
              </Form.Item>
            </Card>

            <Card title="Security" style={{ marginBottom: 24 }}>
              <Form.Item name="enableRateLimit" label="Enable Rate Limiting" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>

              <Form.Item
                name="maxLoginAttempts"
                label="Max Login Attempts"
                initialValue={5}
              >
                <InputNumber min={3} max={10} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="sessionTimeout"
                label="Session Timeout (minutes)"
                initialValue={60}
              >
                <InputNumber min={15} max={480} style={{ width: "100%" }} />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Row justify="end">
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Save Settings
            </Button>
          </Space>
        </Row>
      </Form>
    </div>
  );
};

export default AdminSettings; 