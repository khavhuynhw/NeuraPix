import { Layout, Button, Avatar, Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Header: AntHeader } = Layout;

interface HeaderProps {
  onGetStarted?: () => void;
}

export const Header = ({ onGetStarted }: HeaderProps) => {
  const navigate = useNavigate();

  // Mock auth state - in real app this would come from auth context
  const isLoggedIn = false; // Change to true to see profile dropdown

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      // Default scroll to generator section
      const generatorSection = document.getElementById("generator");
      generatorSection?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/profile?tab=settings"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => {
        // Handle logout logic
        console.log("Logging out...");
      },
    },
  ];

  return (
    <AntHeader
      style={{
        position: "fixed",
        top: 0,
        width: "100vw",
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0, 121, 255, 0.1)",
        padding: "0 24px",
        margin: 0,
        boxShadow: "0 4px 20px rgba(0, 121, 255, 0.05)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Link
              to="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                transition: "all 0.3s ease",
                padding: "8px 12px",
                borderRadius: 12,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.background = "rgba(0, 121, 255, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <img
                src="src\assets\LOGO-01.png"
                alt="NEURAPIX"
                style={{
                  height: 64,
                  width: "auto",
                  objectFit: "contain",
                  cursor: "pointer",
                  filter: "drop-shadow(0 2px 8px rgba(0, 121, 255, 0.2))",
                }}
              />
            </Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <a
              href="/features"
              style={{
                color: "#64748b",
                fontSize: 16,
                textDecoration: "none",
                fontWeight: 500,
                transition: "all 0.3s ease",
                position: "relative",
                padding: "8px 16px",
                borderRadius: 20,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#0079FF";
                e.currentTarget.style.background = "rgba(0, 121, 255, 0.05)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Features
            </a>
            <Button
              type="link"
              onClick={() => navigate("/generator")}
              style={{
                color: "#64748b",
                fontSize: 16,
                fontWeight: 500,
                padding: "8px 16px",
                height: "auto",
                borderRadius: 20,
                transition: "all 0.3s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#0079FF";
                e.currentTarget.style.background = "rgba(0, 121, 255, 0.05)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Generator
            </Button>
            <Link
              to="/pricing"
              style={{
                color: "#64748b",
                fontSize: 16,
                textDecoration: "none",
                fontWeight: 500,
                transition: "all 0.3s ease",
                position: "relative",
                padding: "8px 16px",
                borderRadius: 20,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#0079FF";
                e.currentTarget.style.background = "rgba(0, 121, 255, 0.05)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Pricing
            </Link>
            {isLoggedIn ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    padding: "8px 16px",
                    borderRadius: 20,
                    transition: "all 0.3s ease",
                    marginRight: 8,
                    border: "1px solid rgba(0, 121, 255, 0.2)",
                    background: "rgba(0, 121, 255, 0.05)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0, 121, 255, 0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(0, 121, 255, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(0, 121, 255, 0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Avatar
                    size={32}
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
                    style={{
                      border: "2px solid #0079FF",
                      boxShadow: "0 2px 8px rgba(0, 121, 255, 0.3)",
                    }}
                  />
                  <span style={{ color: "#1e293b", fontWeight: 600 }}>
                    Alex
                  </span>
                </div>
              </Dropdown>
            ) : (
              <Button
                type="default"
                onClick={() => navigate("/login")}
                style={{
                  marginRight: 12,
                  borderColor: "rgba(0, 121, 255, 0.3)",
                  color: "#0079FF",
                  background: "rgba(0, 121, 255, 0.05)",
                  borderRadius: 20,
                  fontWeight: 600,
                  height: 40,
                  paddingLeft: 20,
                  paddingRight: 20,
                  transition: "all 0.3s ease",
                  transform: "scale(1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "scale(1.05) translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(0, 121, 255, 0.3)";
                  e.currentTarget.style.backgroundColor = "#0079FF";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = "#0079FF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1) translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.backgroundColor =
                    "rgba(0, 121, 255, 0.05)";
                  e.currentTarget.style.color = "#0079FF";
                  e.currentTarget.style.borderColor = "rgba(0, 121, 255, 0.3)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "scale(0.98) translateY(0)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform =
                    "scale(1.05) translateY(-2px)";
                }}
              >
                Sign In
              </Button>
            )}
            <Button
              type="primary"
              onClick={handleGetStarted}
              style={{
                background:
                  "linear-gradient(135deg, #0079FF 0%, #00C7FF 50%, #0079FF 100%)",
                borderColor: "transparent",
                borderRadius: 20,
                fontWeight: 700,
                height: 44,
                paddingLeft: 24,
                paddingRight: 24,
                fontSize: 15,
                boxShadow: "0 8px 25px rgba(0, 121, 255, 0.4)",
                transition: "all 0.3s ease",
                transform: "scale(1)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "scale(1.05) translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 35px rgba(0, 121, 255, 0.5)";
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #3399FF 0%, #00E5FF 50%, #3399FF 100%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1) translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 25px rgba(0, 121, 255, 0.4)";
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #0079FF 0%, #00C7FF 50%, #0079FF 100%)";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.98) translateY(0)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform =
                  "scale(1.05) translateY(-3px)";
              }}
            >
              ✨ Get Started
            </Button>
          </div>
        </div>
      </div>
    </AntHeader>
  );
};
