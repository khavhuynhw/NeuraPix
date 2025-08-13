import React, { useState } from "react";
import { Modal, Form, Input, Button, message, Space } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { changePassword } from "../services/authApi";
import type { ChangePasswordRequest } from "../types/auth";

interface ChangePasswordModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: ChangePasswordRequest & { confirmPassword: string }) => {
    try {
      setLoading(true);
      
      // Validate passwords match
      if (values.newPassword !== values.confirmPassword) {
        message.error("New passwords do not match!");
        return;
      }

      // Call the API
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      message.success("Password changed successfully!");
      form.resetFields();
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const validatePassword = (_: unknown, value: string) => {
    if (!value || value.length < 8) {
      return Promise.reject("Password must be at least 8 characters long");
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return Promise.reject("Password must contain at least one uppercase letter, one lowercase letter, and one number");
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_: unknown, value: string) => {
    const newPassword = form.getFieldValue('newPassword');
    if (value && value !== newPassword) {
      return Promise.reject("Passwords do not match");
    }
    return Promise.resolve();
  };

  return (
    <Modal
      title={
        <Space>
          <LockOutlined />
          <span>Change Password</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={480}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        style={{ marginTop: 24 }}
      >
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[
            { required: true, message: "Please enter your current password" },
          ]}
        >
          <Input.Password
            size="large"
            placeholder="Enter current password"
            prefix={<LockOutlined style={{ color: "#0079FF" }} />}
          />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: "Please enter your new password" },
            { validator: validatePassword },
          ]}
        >
          <Input.Password
            size="large"
            placeholder="Enter new password"
            prefix={<LockOutlined style={{ color: "#0079FF" }} />}
          />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          rules={[
            { required: true, message: "Please confirm your new password" },
            { validator: validateConfirmPassword },
          ]}
        >
          <Input.Password
            size="large"
            placeholder="Confirm new password"
            prefix={<LockOutlined style={{ color: "#0079FF" }} />}
          />
        </Form.Item>

        <div style={{ marginTop: 24 }}>
          <div 
            style={{ 
              background: "#f8f9fa", 
              padding: 16, 
              borderRadius: 8, 
              marginBottom: 24,
              fontSize: 14,
              color: "#64748b"
            }}
          >
            <strong>Password Requirements:</strong>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
              <li>At least 8 characters long</li>
              <li>Contains uppercase and lowercase letters</li>
              <li>Contains at least one number</li>
            </ul>
          </div>

          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                background: "#0079FF",
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              Change Password
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};