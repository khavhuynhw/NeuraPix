import React, { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Badge } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  FileImageOutlined,
  BarChartOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  TransactionOutlined,
  ReconciliationOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/admin/dashboard"),
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: "User Management",
      onClick: () => navigate("/admin/users"),
    },
    {
      key: "/admin/transactions",
      icon: <TransactionOutlined />,
      label: "Transactions",
      onClick: () => navigate("/admin/transactions"),
    },
    {
      key: "/admin/subscriptions",
      icon: <ReconciliationOutlined />,
      label: "Subscriptions",
      onClick: () => navigate("/admin/subscriptions"),
    },
    {
      key: "/admin/plans",
      icon: <AppstoreOutlined />,
      label: "Plans",
      onClick: () => navigate("/admin/plans"),
    },
    {
      key: "/admin/content",
      icon: <FileImageOutlined />,
      label: "Content Management",
      onClick: () => navigate("/admin/content"),
    },
    {
      key: "/admin/analytics",
      icon: <BarChartOutlined />,
      label: "Analytics",
      onClick: () => navigate("/admin/analytics"),
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: "System Settings",
      onClick: () => navigate("/admin/settings"),
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "View Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "Home",
      icon: <HomeOutlined />,
      label: "Home",
      onClick: () => navigate("/"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
    
  ];

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.username) {
      return user.username;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "Admin";
  };

  return (
    <>
      <style>
        {`
          .admin-menu .ant-menu-item {
            margin: 4px 12px !important;
            border-radius: 12px !important;
            height: 44px !important;
            line-height: 44px !important;
            color: rgba(255, 255, 255, 0.8) !important;
            font-weight: 500 !important;
          }
          
          .admin-menu .ant-menu-item:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
          }
          
          .admin-menu .ant-menu-item-selected {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
            color: white !important;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
          }
          
          .admin-menu .ant-menu-item-icon {
            font-size: 18px !important;
            margin-right: 12px !important;
          }
        `}
      </style>
      <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 100,
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.12)",
        }}
        width={280}
      >
        <div
          style={{
            height: 80,
            margin: "20px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            paddingBottom: 20,
          }}
        >
          {!collapsed ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                N
              </div>
              <div>
                <Title level={4} style={{ color: "white", margin: 0, fontWeight: 600 }}>
                  NeuraPix
                </Title>
                <Text style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 12 }}>
                  Admin Panel
                </Text>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              N
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ 
            border: "none",
            background: "transparent",
            fontSize: 14,
          }}
          className="admin-menu"
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 280, transition: "all 0.3s" }}>
        <Header
          style={{
            padding: "0 32px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "fixed",
            width: `calc(100% - ${collapsed ? 80 : 280}px)`,
            zIndex: 99,
            right: 0,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            transition: "all 0.3s",
            borderBottom: "1px solid #f0f2f5",
            height: 72,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ fontSize: "16px", height: 40, width: 40 }}
              />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: 8,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ marginRight: 8 }}
                />
                <span style={{ fontWeight: 500 }}>{getUserDisplayName()}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: "96px 32px 32px 32px",
            padding: 0,
            background: "#f8fafc",
            minHeight: "calc(100vh - 128px)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
    </>
  );
};

export default AdminLayout; 