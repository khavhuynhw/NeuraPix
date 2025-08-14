import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Table,
  Tag,
  List,
  Avatar,
  Space,
  Button,
  Select,
  DatePicker,
  Spin,
} from "antd";
import {
  UserOutlined,
  PictureOutlined,
  CrownOutlined,
  DollarOutlined,
  DatabaseOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import StatCard from "../../components/admin/StatCard";
import { getDashboardStats, getRecentUsers, getRecentActivity } from "../../services/adminApi";
import type { DashboardStats, RecentUser, ActivityItem } from "../../services/adminApi";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;






const mockQuickActions = [
  {
    title: "Add User",
    description: "Create new user account",
    icon: <UserOutlined />,
    action: "create-user",
  },
  {
    title: "Generate Report",
    description: "Export analytics data",
    icon: <FileTextOutlined />,
    action: "generate-report",
  },
  {
    title: "System Settings",
    description: "Configure platform settings",
    icon: <SettingOutlined />,
    action: "system-settings",
  },
  {
    title: "Backup Data",
    description: "Create system backup",
    icon: <DatabaseOutlined />,
    action: "backup-data",
  },
];



const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, usersData, activityData] = await Promise.all([
          getDashboardStats(),
          getRecentUsers(4),
          getRecentActivity(5),
        ]);
        
        setStats(statsData);
        setRecentUsers(usersData);
        setRecentActivity(activityData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  // Show loading state if no data
  if (!stats) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  const userColumns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: RecentUser) => (
        <Space>
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            style={{ background: "#f1f5f9", color: "#475569" }}
          />
          <div>
            <div style={{ fontWeight: 500, color: "#334155" }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
      render: (plan: string) => {
        const isPremium = plan === "PREMIUM" || plan === "Premium";
        return (
          <Tag 
            style={{ 
              background: isPremium ? "#fef3c7" : "#dbeafe",
              color: isPremium ? "#92400e" : "#1d4ed8",
              border: "none",
              borderRadius: 4
            }}
          >
            {plan}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag 
          style={{ 
            background: status === "Active" ? "#d1fae5" : "#fee2e2",
            color: status === "Active" ? "#047857" : "#dc2626",
            border: "none",
            borderRadius: 4
          }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Last Active",
      dataIndex: "lastActive",
      key: "lastActive",
      render: (text: string) => (
        <Text style={{ fontSize: 12, color: "#64748b" }}>{text}</Text>
      ),
    },
  ];

  // Transform recent users data for table
  const usersTableData = recentUsers.map((user) => ({
    key: user.id.toString(),
    ...user,
  }));



  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <UserOutlined style={{ color: "#3b82f6" }} />;
      case "content":
        return <PictureOutlined style={{ color: "#059669" }} />;
      case "billing":
        return <DollarOutlined style={{ color: "#f59e0b" }} />;
      default:
        return <ClockCircleOutlined style={{ color: "#64748b" }} />;
    }
  };

  const handleQuickAction = (action: string) => {
    console.log(`Executing action: ${action}`);
    // Add navigation or modal logic here
  };



  return (
    <div style={{ padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header Section */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div>
            <Title 
              level={2} 
              style={{ 
                margin: 0, 
                color: "#1e293b", 
                fontWeight: 600,
                fontSize: 28
              }}
            >
              Dashboard Overview
            </Title>
            <Text style={{ color: "#64748b", fontSize: 16 }}>
              Monitor your platform's performance and manage operations
            </Text>
          </div>
          <Space size="middle">
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
              size="middle"
              bordered={false}
              style={{
                background: "#ffffff",
                borderRadius: 8,
                border: "1px solid #e2e8f0"
              }}
            >
              <Select.Option value="1d">Today</Select.Option>
              <Select.Option value="7d">7 Days</Select.Option>
              <Select.Option value="30d">30 Days</Select.Option>
              <Select.Option value="90d">90 Days</Select.Option>
            </Select>
            <RangePicker 
              size="middle" 
              style={{
                borderRadius: 8,
                border: "1px solid #e2e8f0"
              }}
            />
          </Space>
        </div>
      </div>

      <Spin spinning={loading}>
        {/* Key Metrics */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              subtitle={`+${stats.todaySignups} today`}
              icon={<UserOutlined />}
              trend={{
                value: "+12.3%",
                isPositive: true,
              }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Images Generated"
              value={stats.totalImages}
              subtitle={`+${stats.todayImages} today`}
              icon={<PictureOutlined />}
              trend={{
                value: "+8.1%",
                isPositive: true,
              }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Premium Users"
              value={stats.premiumUsers}
              subtitle={`${stats.conversionRate}% conversion rate`}
              icon={<CrownOutlined />}
              trend={{
                value: "+15.7%",
                isPositive: true,
              }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Monthly Revenue"
              value={`$${stats.monthlyRevenue.toLocaleString()}`}
              subtitle="Last 30 days"
              icon={<DollarOutlined />}
              trend={{
                value: "+22.5%",
                isPositive: true,
              }}
            />
          </Col>
        </Row>

        {/* Secondary Metrics */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={8}>
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              subtitle="Last 24 hours"
              icon={<EyeOutlined />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard
              title="Collections"
              value={stats.collectionsCount}
              subtitle="User collections"
              icon={<DatabaseOutlined />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard
              title="Storage Used"
              value={`${stats.storageUsed}%`}
              subtitle="Of total capacity"
              icon={<DatabaseOutlined />}
              trend={{
                value: "+2.3%",
                isPositive: false,
              }}
            />
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col span={24}>
            <Card
              title={
                <span style={{ fontSize: 18, fontWeight: 600, color: "#1e293b" }}>
                  Quick Actions
                </span>
              }
              style={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <Row gutter={[16, 16]}>
                {mockQuickActions.map((action, index) => (
                  <Col xs={24} sm={12} md={6} key={index}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      bodyStyle={{ padding: "20px" }}
                      onClick={() => handleQuickAction(action.action)}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            background: "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 12px",
                            color: "#475569",
                            fontSize: 20,
                          }}
                        >
                          {action.icon}
                        </div>
                        <div style={{ fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                          {action.title}
                        </div>
                        <Text style={{ fontSize: 12, color: "#64748b" }}>
                          {action.description}
                        </Text>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>


        {/* Data Tables Section */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <Card
              title={
                <span style={{ fontSize: 18, fontWeight: 600, color: "#1e293b" }}>
                  Recent Users
                </span>
              }
              extra={
                <Button 
                  type="primary" 
                  style={{ 
                    borderRadius: 6,
                    background: "#3b82f6",
                    border: "none",
                    boxShadow: "none",
                  }}
                >
                  View All
                </Button>
              }
              style={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
              bodyStyle={{ padding: "0" }}
            >
              <Table
                columns={userColumns}
                dataSource={usersTableData}
                pagination={false}
                size="middle"
                loading={loading}
                style={{ 
                  borderRadius: "0 0 8px 8px",
                }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card
              title={
                <span style={{ fontSize: 18, fontWeight: 600, color: "#1e293b" }}>
                  Activity Feed
                </span>
              }
              extra={
                <Button 
                  type="text" 
                  style={{ 
                    color: "#64748b",
                    padding: 0,
                  }}
                >
                  View All
                </Button>
              }
              style={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <List
                itemLayout="horizontal"
                dataSource={recentActivity}
                loading={loading}
                renderItem={(item) => (
                  <List.Item style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            background: "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                          }}
                        >
                          {getActivityIcon(item.type)}
                        </div>
                      }
                      title={
                        <Text style={{ fontSize: 14, fontWeight: 500, color: "#334155" }}>
                          {item.action}
                        </Text>
                      }
                      description={
                        <div>
                          <Text style={{ fontSize: 12, color: "#64748b" }}>{item.user}</Text>
                          <br />
                          <Text style={{ fontSize: 11, color: "#94a3b8" }}>{item.time}</Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

      </Spin>
    </div>
  );
};

export default AdminDashboard; 