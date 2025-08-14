import React, { useState } from "react";
import {
  Table,
  Card,
  Typography,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Image,
  Row,
  Col,
  Statistic,
  Popconfirm,
  message,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  UploadOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface ContentItem {
  id: number;
  url: string;
  prompt: string;
  user: string;
  userId: number;
  model: string;
  style: string;
  resolution: string;
  createdAt: string;
  downloads: number;
  likes: number;
  status: "approved" | "pending" | "rejected";
  isPublic: boolean;
  tags: string[];
}

// Mock data
const mockContent: ContentItem[] = [
  {
    id: 1,
    url: "https://via.placeholder.com/150x150/1890ff/white?text=AI+1",
    prompt: "A beautiful sunset over mountains",
    user: "john@example.com",
    userId: 1,
    model: "DALL-E 3",
    style: "Realistic",
    resolution: "1024x1024",
    createdAt: "2024-01-15T10:30:00Z",
    downloads: 25,
    likes: 12,
    status: "approved",
    isPublic: true,
    tags: ["landscape", "sunset", "mountains"],
  },
  {
    id: 2,
    url: "https://via.placeholder.com/150x150/52c41a/white?text=AI+2",
    prompt: "Futuristic cityscape with flying cars",
    user: "jane@example.com",
    userId: 2,
    model: "Midjourney",
    style: "Sci-fi",
    resolution: "1024x768",
    createdAt: "2024-01-14T14:20:00Z",
    downloads: 15,
    likes: 8,
    status: "pending",
    isPublic: false,
    tags: ["city", "futuristic", "cars"],
  },
  {
    id: 3,
    url: "https://via.placeholder.com/150x150/faad14/white?text=AI+3",
    prompt: "Abstract art with geometric shapes",
    user: "bob@example.com",
    userId: 3,
    model: "Stable Diffusion",
    style: "Abstract",
    resolution: "512x512",
    createdAt: "2024-01-13T09:15:00Z",
    downloads: 5,
    likes: 3,
    status: "approved",
    isPublic: true,
    tags: ["abstract", "geometric", "art"],
  },
];

const ContentManagement = () => {
  const [content, setContent] = useState<ContentItem[]>(mockContent);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterModel, setFilterModel] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<React.Key[]>([]);

  const stats = {
    total: content.length,
    approved: content.filter((c) => c.status === "approved").length,
    pending: content.filter((c) => c.status === "pending").length,
    public: content.filter((c) => c.isPublic).length,
    totalDownloads: content.reduce((sum, c) => sum + c.downloads, 0),
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      setContent(content.filter((c) => c.id !== id));
      message.success("Content deleted successfully");
    } catch (error) {
      message.error("Failed to delete content");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setContent(
        content.map((c) =>
          c.id === id ? { ...c, status: "approved" as const } : c
        )
      );
      message.success("Content approved");
    } catch (error) {
      message.error("Failed to approve content");
    }
  };

  const handleReject = async (id: number) => {
    try {
      setContent(
        content.map((c) =>
          c.id === id ? { ...c, status: "rejected" as const } : c
        )
      );
      message.success("Content rejected");
    } catch (error) {
      message.error("Failed to reject content");
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for items:`, selectedItems);
    // Implement bulk actions
  };

  const columns: ColumnsType<ContentItem> = [
    {
      title: "Image",
      key: "image",
      width: 80,
      render: (_, record) => (
        <Image
          width={60}
          height={60}
          src={record.url}
          style={{ borderRadius: 8, objectFit: "cover" }}
          preview={{
            mask: <EyeOutlined />,
          }}
        />
      ),
    },
    {
      title: "Prompt",
      dataIndex: "prompt",
      key: "prompt",
      ellipsis: true,
      width: 200,
      render: (text: string) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 180 }}>
          {text}
        </Text>
      ),
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      width: 150,
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
      width: 120,
      render: (model: string) => <Tag color="blue">{model}</Tag>,
    },
    {
      title: "Style",
      dataIndex: "style",
      key: "style",
      width: 100,
      render: (style: string) => <Tag>{style}</Tag>,
    },
    {
      title: "Resolution",
      dataIndex: "resolution",
      key: "resolution",
      width: 100,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const colors = {
          approved: "green",
          pending: "orange",
          rejected: "red",
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
      },
    },
    {
      title: "Visibility",
      dataIndex: "isPublic",
      key: "visibility",
      width: 100,
      render: (isPublic: boolean) => (
        <Tag color={isPublic ? "green" : "default"}>
          {isPublic ? "Public" : "Private"}
        </Tag>
      ),
    },
    {
      title: "Stats",
      key: "stats",
      width: 100,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>↓ {record.downloads}</div>
          <div>♥ {record.likes}</div>
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 100,
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {record.status === "pending" && (
            <>
              <Button
                size="small"
                type="primary"
                onClick={() => handleApprove(record.id)}
              >
                Approve
              </Button>
              <Button
                size="small"
                danger
                onClick={() => handleReject(record.id)}
              >
                Reject
              </Button>
            </>
          )}
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => window.open(record.url, "_blank")}
          />
          <Popconfirm
            title="Delete this content?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedItems,
    onChange: setSelectedItems,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            Content Management
          </Title>
          <Space>
            <Button icon={<ExportOutlined />}>Export</Button>
            <Upload>
              <Button icon={<UploadOutlined />}>Upload Content</Button>
            </Upload>
          </Space>
        </div>

        {/* Stats */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Total Images" value={stats.total} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Approved" value={stats.approved} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Pending Review" value={stats.pending} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Total Downloads" value={stats.totalDownloads} />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search by prompt, user, or tags..."
              style={{ width: "100%" }}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Status"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: "100%" }}
            >
              <Option value="all">All Status</Option>
              <Option value="approved">Approved</Option>
              <Option value="pending">Pending</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Model"
              value={filterModel}
              onChange={setFilterModel}
              style={{ width: "100%" }}
            >
              <Option value="all">All Models</Option>
              <Option value="DALL-E 3">DALL-E 3</Option>
              <Option value="Midjourney">Midjourney</Option>
              <Option value="Stable Diffusion">Stable Diffusion</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Button icon={<FilterOutlined />} block>
              More Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <Space>
            <Text strong>{selectedItems.length} items selected</Text>
            <Button onClick={() => handleBulkAction("approve")}>
              Bulk Approve
            </Button>
            <Button onClick={() => handleBulkAction("reject")}>
              Bulk Reject
            </Button>
            <Button onClick={() => handleBulkAction("delete")} danger>
              Bulk Delete
            </Button>
            <Button onClick={() => handleBulkAction("export")}>
              Export Selected
            </Button>
          </Space>
        </Card>
      )}

      {/* Content Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={content}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>
    </div>
  );
};

export default ContentManagement; 