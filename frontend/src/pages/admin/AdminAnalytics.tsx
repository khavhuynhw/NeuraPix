import React from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Progress,
  Table,
  Tag,
} from "antd";
import {
  UserOutlined,
  PictureOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const AdminAnalytics = () => {
  // Mock analytics data
  const metrics = {
    userGrowth: 12.5,
    imageGeneration: 8.3,
    revenue: 15.2,
    engagement: 6.7,
  };

  const topUsers = [
    { name: "John Doe", images: 156, revenue: 120 },
    { name: "Jane Smith", images: 134, revenue: 98 },
    { name: "Bob Wilson", images: 98, revenue: 75 },
  ];

  const popularModels = [
    { model: "DALL-E 3", usage: 45, trend: "up" },
    { model: "Midjourney", usage: 32, trend: "up" },
    { model: "Stable Diffusion", usage: 23, trend: "down" },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        Analytics & Insights
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="User Growth"
              value={metrics.userGrowth}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
            <Progress percent={metrics.userGrowth} size="small" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Image Generation"
              value={metrics.imageGeneration}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
            <Progress percent={metrics.imageGeneration} size="small" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue Growth"
              value={metrics.revenue}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
            <Progress percent={metrics.revenue} size="small" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="User Engagement"
              value={metrics.engagement}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
            <Progress percent={metrics.engagement} size="small" showInfo={false} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Top Users by Activity">
            <Table
              dataSource={topUsers}
              size="small"
              pagination={false}
              columns={[
                {
                  title: "User",
                  dataIndex: "name",
                  key: "name",
                },
                {
                  title: "Images",
                  dataIndex: "images",
                  key: "images",
                },
                {
                  title: "Revenue",
                  dataIndex: "revenue",
                  key: "revenue",
                  render: (value) => `$${value}`,
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Popular AI Models">
            <Table
              dataSource={popularModels}
              size="small"
              pagination={false}
              columns={[
                {
                  title: "Model",
                  dataIndex: "model",
                  key: "model",
                },
                {
                  title: "Usage %",
                  dataIndex: "usage",
                  key: "usage",
                  render: (value) => `${value}%`,
                },
                {
                  title: "Trend",
                  dataIndex: "trend",
                  key: "trend",
                  render: (trend) => (
                    <Tag
                      color={trend === "up" ? "green" : "red"}
                      icon={trend === "up" ? <RiseOutlined /> : <FallOutlined />}
                    >
                      {trend}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminAnalytics; 