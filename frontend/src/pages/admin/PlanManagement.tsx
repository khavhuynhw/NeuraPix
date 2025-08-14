import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Card,
  Typography,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Tooltip,
  InputNumber,
  Switch,
} from "antd";
import { formatVND } from "../../utils/currency";
import {
  AppstoreOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  FilterOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { subscriptionApi } from "../../services/subscriptionApi";
import type { SubscriptionPlan } from "../../services/subscriptionApi";

const { Title, Text } = Typography;
const { Search, TextArea } = Input;
const { Option } = Select;

const PlanManagement = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedPlans, setSelectedPlans] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const stats = {
    total: plans.length,
    active: plans.filter((p) => p.isActive).length,
    premium: plans.filter((p) => p.tier === "PREMIUM").length,
    free: plans.filter((p) => p.tier === "FREE").length,
  };

  // Fetch plans from API
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subscriptionApi.getAllPlans({
        page: pagination.current - 1,
        size: pagination.pageSize,
        tier: filterTier !== 'all' ? filterTier : undefined,
        isActive: filterStatus !== 'all' ? filterStatus : undefined,
      });
      
      setPlans(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.totalElements || response.data?.length || 0,
      }));
    } catch (error: any) {
      console.warn("Backend not available, using demo data:", error);
      // Fallback to mock data
      const mockPlans: SubscriptionPlan[] = [
        {
          id: 1,
          name: 'Free Plan',
          description: 'Get started with basic features',
          tier: 'FREE',
          monthlyPrice: 0,
          yearlyPrice: 0,
          currency: 'VND',
          dailyGenerationLimit: 5,
          monthlyGenerationLimit: 50,
          features: ['5 daily generations', 'Basic support'],
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          name: 'Premium Plan',
          description: 'Advanced features for professionals',
          tier: 'PREMIUM',
          monthlyPrice: 720000,
          yearlyPrice: 7200000,
          currency: 'VND',
          dailyGenerationLimit: 100,
          monthlyGenerationLimit: 2000,
          features: ['100 daily generations', 'Priority support', '4K quality'],
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      setPlans(mockPlans);
      setPagination(prev => ({ ...prev, total: mockPlans.length }));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filterTier, filterStatus]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleCreate = () => {
    setEditingPlan(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    form.setFieldsValue(plan);
    setIsModalVisible(true);
  };

  const handleDelete = async (planId: number) => {
    try {
      setLoading(true);
      await subscriptionApi.deletePlan(planId);
      message.success('Plan deleted successfully');
      await fetchPlans();
    } catch (error: any) {
      message.error(error.message || 'Failed to delete plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      if (editingPlan) {
        await subscriptionApi.updatePlan(editingPlan.id, values);
        message.success('Plan updated successfully');
      } else {
        await subscriptionApi.createPlan(values);
        message.success('Plan created successfully');
      }
      setIsModalVisible(false);
      setEditingPlan(null);
      form.resetFields();
      await fetchPlans();
    } catch (error: any) {
      message.error(error.message || 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: newPagination.total,
    });
  };

  const columns: ColumnsType<SubscriptionPlan> = [
    {
      title: "Plan",
      key: "plan",
      width: 200,
      render: (_, record) => (
        <div>
          <Text style={{ fontWeight: 600, fontSize: 16 }}>{record.name}</Text>
          <br />
          <Text style={{ color: '#64748b', fontSize: 12 }}>{record.description}</Text>
        </div>
      ),
    },
    {
      title: "Tier",
      dataIndex: "tier",
      key: "tier",
      width: 100,
      render: (tier: string) => {
        const colors = {
          FREE: 'default',
          BASIC: 'blue',
          PREMIUM: 'gold',
        };
        return (
          <Tag color={colors[tier as keyof typeof colors] || 'default'}>
            {tier}
          </Tag>
        );
      },
    },
    {
      title: "Pricing",
      key: "pricing",
      width: 120,
      render: (_, record) => (
        <div>
          <Text style={{ fontWeight: 600 }}>
            {formatVND(record.monthlyPrice)}/month
          </Text>
          {record.yearlyPrice > 0 && (
            <>
              <br />
              <Text style={{ color: '#64748b', fontSize: 12 }}>
                {formatVND(record.yearlyPrice)}/year
              </Text>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Limits",
      key: "limits",
      width: 120,
      render: (_, record) => (
        <div>
          <Text style={{ fontSize: 12 }}>
            Daily: {record.dailyGenerationLimit}
          </Text>
          <br />
          <Text style={{ fontSize: 12 }}>
            Monthly: {record.monthlyGenerationLimit}
          </Text>
        </div>
      ),
    },
    {
      title: "Features",
      dataIndex: "features",
      key: "features",
      width: 120,
      render: (features: string[]) => (
        <div>
          <Text style={{ fontSize: 12 }}>
            {features?.length || 0} feature{(features?.length || 0) !== 1 ? 's' : ''}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 100,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this plan?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Delete">
              <Button 
                size="small" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedPlans,
    onChange: setSelectedPlans,
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
            Plan Management
          </Title>
          <Space>
            <Button icon={<ExportOutlined />}>Export</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Create Plan
            </Button>
          </Space>
        </div>

        {/* Stats */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Total Plans" value={stats.total} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Active" value={stats.active} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Premium" value={stats.premium} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Free" value={stats.free} />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search plans..."
              onSearch={handleSearch}
              style={{ width: "100%" }}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Tier"
              value={filterTier}
              onChange={setFilterTier}
              style={{ width: "100%" }}
            >
              <Option value="all">All Tiers</Option>
              <Option value="FREE">Free</Option>
              <Option value="BASIC">Basic</Option>
              <Option value="PREMIUM">Premium</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Status"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: "100%" }}
            >
              <Option value="all">All Status</Option>
              <Option value="true">Active</Option>
              <Option value="false">Inactive</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Button icon={<FilterOutlined />} block>
              More Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={plans}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          scroll={{ x: 1000 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} plans`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Plan Modal */}
      <Modal
        title={editingPlan ? 'Edit Plan' : 'Create Plan'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingPlan(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Plan Name"
                rules={[{ required: true, message: 'Please enter plan name' }]}
              >
                <Input placeholder="Enter plan name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tier"
                label="Tier"
                rules={[{ required: true, message: 'Please select tier' }]}
              >
                <Select placeholder="Select tier">
                  <Option value="FREE">Free</Option>
                  <Option value="BASIC">Basic</Option>
                  <Option value="PREMIUM">Premium</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Enter plan description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="monthlyPrice"
                label="Monthly Price (VND)"
                rules={[{ required: true, message: 'Please enter monthly price' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="yearlyPrice"
                label="Yearly Price (VND)"
                rules={[{ required: true, message: 'Please enter yearly price' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dailyGenerationLimit"
                label="Daily Generation Limit"
                rules={[{ required: true, message: 'Please enter daily limit' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="monthlyGenerationLimit"
                label="Monthly Generation Limit"
                rules={[{ required: true, message: 'Please enter monthly limit' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="currency"
            label="Currency"
            initialValue="VND"
          >
            <Select>
              <Option value="VND">VND</Option>
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
            </Select>
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
            <Switch /> Active
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingPlan(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingPlan ? 'Update' : 'Create'} Plan
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PlanManagement;