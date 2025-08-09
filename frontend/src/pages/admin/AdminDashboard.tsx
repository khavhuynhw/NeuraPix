import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Table,
  Tag,
  Progress,
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
  RiseOutlined,
  EyeOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Mock data - replace with real API calls
const mockStats = {
  totalUsers: 1234,
  totalImages: 45678,
  premiumUsers: 187,
  monthlyRevenue: 12450,
  todaySignups: 23,
  todayImages: 156,
  conversionRate: 15.2,
  avgImagesPerUser: 37,
};



const mockRecentUsers = [
  {
    key: "1",
    name: "John Doe",
    email: "john@example.com",
    plan: "Premium",
    joinedAt: "2024-01-15",
    status: "Active",
    avatar: null,
  },
  {
    key: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    plan: "Free",
    joinedAt: "2024-01-14",
    status: "Active",
    avatar: null,
  },
  {
    key: "3",
    name: "Bob Wilson",
    email: "bob@example.com",
    plan: "Premium",
    joinedAt: "2024-01-13",
    status: "Inactive",
    avatar: null,
  },
];

const mockRecentActivity = [
  {
    id: 1,
    action: "User registered",
    user: "alice@example.com",
    time: "2 minutes ago",
    type: "user",
  },
  {
    id: 2,
    action: "Image generated",
    user: "bob@example.com",
    time: "5 minutes ago",
    type: "content",
  },
  {
    id: 3,
    action: "Subscription upgraded",
    user: "charlie@example.com",
    time: "10 minutes ago",
    type: "billing",
  },
  {
    id: 4,
    action: "Image downloaded",
    user: "diana@example.com",
    time: "15 minutes ago",
    type: "content",
  },
];



const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");

  const mainChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 480,
      stacked: true,
      toolbar: {
        show: false
      }
    },
    colors: ['#e3f2fd', '#1976d2', '#7c4dff', '#f3e5f5'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
      }
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'left'
    },
    fill: {
      opacity: 1
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      show: true,
      borderColor: '#f0f0f0'
    },
    tooltip: {
      theme: 'light'
    }
  };



  const chartSeries = {
    mainChart: [
      {
        name: 'Investment',
        data: [35, 125, 35, 35, 35, 80, 35, 20, 35, 45, 15, 75]
      },
      {
        name: 'Loss',
        data: [35, 15, 15, 35, 65, 40, 80, 25, 15, 85, 25, 75]
      },
      {
        name: 'Profit',
        data: [35, 145, 35, 35, 20, 105, 100, 10, 65, 45, 30, 10]
      },
      {
        name: 'Maintenance',
        data: [0, 0, 75, 0, 0, 115, 0, 0, 0, 0, 150, 0]
      }
    ]
  };

  const userColumns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
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
      render: (plan: string) => (
        <Tag color={plan === "Premium" ? "gold" : "blue"}>{plan}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Joined",
      dataIndex: "joinedAt",
      key: "joinedAt",
    },
  ];



  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <UserOutlined style={{ color: "#1890ff" }} />;
      case "content":
        return <PictureOutlined style={{ color: "#52c41a" }} />;
      case "billing":
        return <DollarOutlined style={{ color: "#faad14" }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };



  return (
    <div style={{ padding: "24px" }}>
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
            <Title level={2} style={{ margin: 0, color: "#1e293b", fontWeight: 700 }}>
              Dashboard Overview
            </Title>
            <Text style={{ color: "#64748b", fontSize: 16 }}>
              Welcome back! Here's what's happening with your platform.
            </Text>
          </div>
          <Space size="large">
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 140 }}
              size="large"
            >
              <Select.Option value="1d">Last Day</Select.Option>
              <Select.Option value="7d">Last Week</Select.Option>
              <Select.Option value="30d">Last Month</Select.Option>
              <Select.Option value="90d">Last Quarter</Select.Option>
            </Select>
            <RangePicker size="large" />
          </Space>
        </div>
      </div>

      <Spin spinning={loading}>
                {/* Key Metrics */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                borderRadius: 16,
                border: "none",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                boxShadow: "0 10px 25px rgba(102, 126, 234, 0.3)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Total Users</div>
                  <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
                    {mockStats.totalUsers.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    +{mockStats.todaySignups} today
                  </div>
                </div>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  <UserOutlined />
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                borderRadius: 16,
                border: "none",
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
                boxShadow: "0 10px 25px rgba(240, 147, 251, 0.3)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Images Generated</div>
                  <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
                    {mockStats.totalImages.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    +{mockStats.todayImages} today
                  </div>
                </div>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  <PictureOutlined />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                borderRadius: 16,
                border: "none",
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
                boxShadow: "0 10px 25px rgba(79, 172, 254, 0.3)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Premium Users</div>
                  <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
                    {mockStats.premiumUsers.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    {mockStats.conversionRate}% conversion rate
                  </div>
                </div>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  <CrownOutlined />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                borderRadius: 16,
                border: "none",
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                color: "white",
                boxShadow: "0 10px 25px rgba(67, 233, 123, 0.3)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Monthly Revenue</div>
                  <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
                    ${mockStats.monthlyRevenue.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    +12.5% from last month
                  </div>
                </div>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  <DollarOutlined />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Main Growth Chart */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24}>
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ 
                      fontSize: 20, 
                      fontWeight: 700, 
                      color: "#1e293b", 
                      marginBottom: 4,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Total Growth
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "#1e293b" }}>$2,324.00</div>
                  </div>
                  <Select
                    defaultValue="today"
                    style={{ width: 120 }}
                    size="large"
                    options={[
                      { value: 'today', label: 'Today' },
                      { value: 'month', label: 'This Month' },
                      { value: 'year', label: 'This Year' },
                    ]}
                  />
                </div>
              }
              style={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <Chart
                options={mainChartOptions}
                series={chartSeries.mainChart}
                type="bar"
                height={480}
              />
            </Card>
          </Col>
        </Row>

        {/* Secondary Metrics */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={8}>
            <Card
              style={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "white",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 20,
                  }}
                >
                  <RiseOutlined />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Avg Images/User</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>
                    {mockStats.avgImagesPerUser}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "white",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 20,
                  }}
                >
                  <EyeOutlined />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Daily Active Users</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>456</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "white",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 20,
                  }}
                >
                  <DownloadOutlined />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Downloads Today</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>89</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Content Sections */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
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
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                  }}
                >
                  View All
                </Button>
              }
              style={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
              bodyStyle={{ padding: "0" }}
            >
              <Table
                columns={userColumns}
                dataSource={mockRecentUsers}
                pagination={false}
                size="small"
                style={{ 
                  borderRadius: "0 0 12px 12px",
                }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <span style={{ fontSize: 18, fontWeight: 600, color: "#1e293b" }}>
                  Recent Activity
                </span>
              }
              extra={
                <Button 
                  type="primary" 
                  style={{ 
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    border: "none",
                  }}
                >
                  View All
                </Button>
              }
              style={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <List
                itemLayout="horizontal"
                dataSource={mockRecentActivity}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={getActivityIcon(item.type)}
                      title={item.action}
                      description={
                        <Space>
                          <Text type="secondary">{item.user}</Text>
                          <Text type="secondary">•</Text>
                          <Text type="secondary">{item.time}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
          <Col span={24}>
            <Card 
              title={
                <span style={{ fontSize: 18, fontWeight: 600, color: "#1e293b" }}>
                  Quick Actions
                </span>
              }
              style={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <Space wrap size="large">
                <Button 
                  type="primary" 
                  icon={<UserOutlined />}
                  size="large"
                  style={{
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    height: 48,
                    paddingLeft: 24,
                    paddingRight: 24,
                    fontWeight: 500,
                  }}
                >
                  Add New User
                </Button>
                <Button 
                  icon={<PictureOutlined />}
                  size="large"
                  style={{
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    height: 48,
                    paddingLeft: 24,
                    paddingRight: 24,
                    fontWeight: 500,
                  }}
                >
                  View All Images
                </Button>
                <Button 
                  icon={<DollarOutlined />}
                  size="large"
                  style={{
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    height: 48,
                    paddingLeft: 24,
                    paddingRight: 24,
                    fontWeight: 500,
                  }}
                >
                  Generate Revenue Report
                </Button>
                <Button 
                  icon={<DownloadOutlined />}
                  size="large"
                  style={{
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    height: 48,
                    paddingLeft: 24,
                    paddingRight: 24,
                    fontWeight: 500,
                  }}
                >
                  Export User Data
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default AdminDashboard; 