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
} from "antd";
import { formatVND } from "../../utils/currency";
import {
  ReconciliationOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ExportOutlined,
  FilterOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { subscriptionApi } from "../../services/subscriptionApi";
import type { Subscription } from "../../services/subscriptionApi";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [actionType, setActionType] = useState<'cancel' | 'suspend' | 'renew'>('cancel');
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === "ACTIVE").length,
    cancelled: subscriptions.filter((s) => s.status === "CANCELLED").length,
    expired: subscriptions.filter((s) => s.status === "EXPIRED").length,
  };

  // Fetch subscriptions from API
  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subscriptionApi.getSubscriptions({
        page: pagination.current - 1,
        size: pagination.pageSize,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        tier: filterTier !== 'all' ? filterTier : undefined,
      });
      
      setSubscriptions(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.totalElements || response.data?.length || 0,
      }));
    } catch (error: any) {
      console.warn("Backend not available, using demo data:", error);
      // Fallback to mock data
      const mockSubscriptions: Subscription[] = [
        {
          id: 1,
          userId: 101,
          planId: 1,
          tier: 'PREMIUM',
          status: 'ACTIVE',
          billingCycle: 'MONTHLY',
          price: 720000,
          currency: 'VND',
          paymentProvider: 'payos',
          autoRenew: true,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          nextBillingDate: '2024-02-01',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: 2,
          userId: 102,
          planId: 2,
          tier: 'BASIC',
          status: 'ACTIVE',
          billingCycle: 'YEARLY',
          price: 240000,
          currency: 'VND',
          paymentProvider: 'payos',
          autoRenew: false,
          startDate: '2024-01-15',
          endDate: '2025-01-15',
          nextBillingDate: '2025-01-15',
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
        },
      ];
      setSubscriptions(mockSubscriptions);
      setPagination(prev => ({ ...prev, total: mockSubscriptions.length }));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filterStatus, filterTier]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleAction = (subscription: Subscription, action: 'cancel' | 'suspend' | 'renew') => {
    setEditingSubscription(subscription);
    setActionType(action);
    setIsModalVisible(true);
  };

  const handleActionSubmit = async (values: any) => {
    if (!editingSubscription) return;
    
    try {
      setLoading(true);
      switch (actionType) {
        case 'cancel':
          await subscriptionApi.cancelSubscription(editingSubscription.id, {
            reason: values.reason || 'Admin action',
            cancelImmediately: values.cancelImmediately || false,
          });
          message.success('Subscription cancelled successfully');
          break;
        case 'suspend':
          await subscriptionApi.suspendSubscription(editingSubscription.id, values.reason || 'Admin action');
          message.success('Subscription suspended successfully');
          break;
        case 'renew':
          await subscriptionApi.renewSubscription(editingSubscription.id);
          message.success('Subscription renewed successfully');
          break;
      }
      setIsModalVisible(false);
      setEditingSubscription(null);
      form.resetFields();
      await fetchSubscriptions();
    } catch (error: any) {
      message.error(error.message || `Failed to ${actionType} subscription`);
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

  const columns: ColumnsType<Subscription> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id: number) => (
        <Text style={{ fontFamily: 'monospace', fontWeight: 500 }}>
          #{id}
        </Text>
      ),
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      width: 100,
    },
    {
      title: "Plan",
      key: "plan",
      width: 120,
      render: (_, record) => (
        <div>
          <Tag color={record.tier === 'PREMIUM' ? 'gold' : record.tier === 'BASIC' ? 'blue' : 'default'}>
            {record.tier}
          </Tag>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const colors = {
          ACTIVE: 'green',
          CANCELLED: 'red',
          EXPIRED: 'orange',
          SUSPENDED: 'purple',
          PENDING: 'blue',
        };
        return (
          <Tag color={colors[status as keyof typeof colors] || 'default'}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Billing",
      key: "billing",
      width: 120,
      render: (_, record) => (
        <div>
          <Text style={{ fontWeight: 500 }}>
            {formatVND(record.price)} / {record.billingCycle.toLowerCase()}
          </Text>
          <br />
          <Text style={{ fontSize: 12, color: '#64748b' }}>
            Auto-renew: {record.autoRenew ? 'Yes' : 'No'}
          </Text>
        </div>
      ),
    },
    {
      title: "Next Billing",
      dataIndex: "nextBillingDate",
      key: "nextBillingDate",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
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
          {record.status === 'ACTIVE' && (
            <>
              <Tooltip title="Suspend">
                <Button
                  size="small"
                  icon={<PauseCircleOutlined />}
                  onClick={() => handleAction(record, 'suspend')}
                />
              </Tooltip>
              <Tooltip title="Cancel">
                <Button
                  size="small"
                  danger
                  icon={<StopOutlined />}
                  onClick={() => handleAction(record, 'cancel')}
                />
              </Tooltip>
            </>
          )}
          {record.status === 'EXPIRED' && (
            <Tooltip title="Renew">
              <Button
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleAction(record, 'renew')}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedSubscriptions,
    onChange: setSelectedSubscriptions,
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
            Subscription Management
          </Title>
          <Space>
            <Button icon={<ExportOutlined />}>Export</Button>
          </Space>
        </div>

        {/* Stats */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Total" value={stats.total} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Active" value={stats.active} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Cancelled" value={stats.cancelled} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Expired" value={stats.expired} />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search subscriptions..."
              onSearch={handleSearch}
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
              <Option value="ACTIVE">Active</Option>
              <Option value="CANCELLED">Cancelled</Option>
              <Option value="EXPIRED">Expired</Option>
              <Option value="SUSPENDED">Suspended</Option>
            </Select>
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
          dataSource={subscriptions}
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
              `${range[0]}-${range[1]} of ${total} subscriptions`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Action Modal */}
      <Modal
        title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Subscription`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingSubscription(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleActionSubmit}>
          {actionType === 'cancel' && (
            <Form.Item
              name="reason"
              label="Cancellation Reason"
              rules={[{ required: true, message: 'Please provide a reason' }]}
            >
              <Input.TextArea rows={3} placeholder="Enter cancellation reason" />
            </Form.Item>
          )}
          
          {actionType === 'suspend' && (
            <Form.Item
              name="reason"
              label="Suspension Reason"
              rules={[{ required: true, message: 'Please provide a reason' }]}
            >
              <Input.TextArea rows={3} placeholder="Enter suspension reason" />
            </Form.Item>
          )}

          {actionType === 'renew' && (
            <div>
              <Text>Are you sure you want to renew this subscription?</Text>
            </div>
          )}

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingSubscription(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                danger={actionType === 'cancel'}
              >
                {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SubscriptionManagement;