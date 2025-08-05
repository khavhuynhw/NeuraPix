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
  Avatar,
  Dropdown,
  Modal,
  Form,
  message,
  Popconfirm,
  DatePicker,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ExportOutlined,
  FilterOutlined,
  CrownOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  LockOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { User, UserCreateRequestDto, UserUpdateRequestDto, UserRole, SubscriptionTier } from "../../types/auth";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  bulkUpdateUsers,
} from "../../services/userApi";

const { Title, Text } = Typography;
const { Search, Password } = Input;
const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    premium: users.filter((u) => u.subscriptionTier === "PREMIUM").length,
    admin: users.filter((u) => u.role === "ADMIN").length,
  };

  // Helper function to check if user is admin
  const isAdminUser = (user: User) => {
    return user.role === "ADMIN" || user.role === "admin";
  };

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        page: pagination.current - 1, // Backend typically uses 0-based pagination
        size: pagination.pageSize,
        search: searchText || undefined,
        role: filterRole,
        status: filterStatus,
        plan: filterPlan,
      });
      
      setUsers(response.users);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch (error: any) {
      message.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, filterRole, filterStatus, filterPlan]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText !== "") {
        setPagination(prev => ({ ...prev, current: 1 }));
      }
      fetchUsers();
    }, 500); // 500ms delay for search

    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch users when pagination or filters change (non-search)
  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, filterRole, filterStatus, filterPlan]);
  
  const handleSearch = (value: string) => {
    setSearchText(value);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleEdit = (user: User) => {
    if (isAdminUser(user)) {
      message.error("Cannot edit admin users");
      return;
    }
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleDelete = async (userId: number) => {
    // Find the user to check if they're an admin
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete && isAdminUser(userToDelete)) {
      message.error("Cannot delete admin users");
      return;
    }

    try {
      setLoading(true);
      await deleteUser(userId);
      message.success("User deleted successfully");
      await fetchUsers(); // Refresh the user list
    } catch (error: any) {
      message.error(error.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      if (editingUser) {
        // Update existing user - map to UserUpdateRequestDto
        const updateData: UserUpdateRequestDto = {
          username: values.username,
          email: values.email,
          password: values.password,
          role: values.role as UserRole,
          firstName: values.firstName,
          lastName: values.lastName,
          avatarUrl: values.avatarUrl,
          credits: values.credits,
          subscriptionTier: values.subscriptionTier as SubscriptionTier,
          isActive: values.isActive,
          emailVerified: values.emailVerified,
        };
        await updateUser(editingUser.id!, updateData);
        message.success("User updated successfully");
      } else {
        // Create new user - map to UserCreateRequestDto
        const createData: UserCreateRequestDto = {
          username: values.username,
          email: values.email,
          password: values.password,
          role: values.role as UserRole || "USER",
          firstName: values.firstName,
          lastName: values.lastName,
          avatarUrl: values.avatarUrl,
          credits: values.credits || 10,
          subscriptionTier: values.subscriptionTier as SubscriptionTier || "FREE",
          isActive: values.isActive !== undefined ? values.isActive : true,
          emailVerified: values.emailVerified !== undefined ? values.emailVerified : false,
        };
        await createUser(createData);
        message.success("User created successfully");
      }
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      await fetchUsers(); // Refresh the user list
    } catch (error: any) {
      message.error(error.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      setLoading(true);
      const userIds = selectedUsers.map(id => Number(id));
      
      // Check if any selected users are admins for delete operations
      if (action === 'delete') {
        const selectedUserData = users.filter(u => selectedUsers.includes(u.id!));
        const hasAdminUsers = selectedUserData.some(user => isAdminUser(user));
        
        if (hasAdminUsers) {
          message.error("Cannot delete admin users. Please deselect admin users and try again.");
          return;
        }
      }
      
      await bulkUpdateUsers(userIds, action);
      message.success(`Bulk ${action} completed successfully`);
      setSelectedUsers([]);
      await fetchUsers(); // Refresh the user list
    } catch (error: any) {
      message.error(error.message || `Failed to perform bulk ${action}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: number, isActive: boolean) => {
    try {
      setLoading(true);
      await updateUserStatus(userId, isActive);
      message.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      await fetchUsers(); // Refresh the user list
    } catch (error: any) {
      message.error(error.message || "Failed to update user status");
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

  const getUserMenuItems = (user: User) => {
    const isAdmin = isAdminUser(user);
    
    const baseItems = [
      {
        key: "view",
        icon: <UserOutlined />,
        label: "View Profile",
      },
      {
        key: "email",
        icon: <MailOutlined />,
        label: "Send Email",
      },
    ];

    const editableItems = [
      {
        key: "edit",
        icon: <EditOutlined />,
        label: "Edit User",
        onClick: () => handleEdit(user),
        disabled: isAdmin,
      },
      {
        key: "status",
        icon: <UserOutlined />,
        label: user.isActive ? "Deactivate" : "Activate",
        onClick: () => handleStatusChange(user.id!, !user.isActive),
        disabled: isAdmin,
      },
      {
        type: "divider" as const,
      },
      {
        key: "delete",
        icon: <DeleteOutlined />,
        label: "Delete User",
        danger: true,
        disabled: isAdmin,
      },
    ];

    if (isAdmin) {
      return [
        ...baseItems,
        {
          type: "divider" as const,
        },
        {
          key: "admin-protected",
          icon: <LockOutlined />,
          label: "Admin Protected",
          disabled: true,
        },
      ];
    }

    return [...baseItems, ...editableItems];
  };

  const columns: ColumnsType<User> = [
    {
      title: "User",
      key: "user",
      fixed: "left",
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar
            size="small"
            icon={isAdminUser(record) ? <CrownOutlined /> : <UserOutlined />}
            style={{
              backgroundColor: isAdminUser(record) ? "#faad14" : "#1890ff",
            }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.firstName} {record.lastName}
              {isAdminUser(record) && (
                <LockOutlined style={{ marginLeft: 4, color: "#faad14", fontSize: 12 }} />
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 100,
      render: (role: string) => (
        <Tag
          color={role === "ADMIN" ? "red" : "blue"}
          icon={role === "ADMIN" ? <CrownOutlined /> : <UserOutlined />}
        >
          {role}
        </Tag>
      ),
    },
    {
      title: "Plan",
      dataIndex: "subscriptionTier",
      key: "plan",
      width: 100,
      render: (plan: string) => (
        <Tag color={plan === "PREMIUM" ? "gold" : "blue"}>
          {plan === "PREMIUM" ? "Premium" : "Free"}
        </Tag>
      ),
    },
    {
      title: "Credits",
      dataIndex: "credits",
      key: "credits",
      width: 80,
      sorter: (a, b) => (a.credits || 0) - (b.credits || 0),
    },
    {
      title: "Images",
      dataIndex: "imagesGenerated",
      key: "images",
      width: 80,
      sorter: (a, b) => (a.imagesGenerated || 0) - (b.imagesGenerated || 0),
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color={record.isActive ? "green" : "red"}>
            {record.isActive ? "Active" : "Inactive"}
          </Tag>
          {record.emailVerified && (
            <Badge status="success" text="Verified" />
          )}
        </Space>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 100,
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => {
        const isAdmin = isAdminUser(record);
        
        return (
          <Space>
            {isAdmin ? (
              <Tooltip title="Admin users are protected from editing and deletion">
                <Button
                  size="small"
                  icon={<LockOutlined />}
                  disabled
                  style={{ color: '#d9d9d9' }}
                >
                  Protected
                </Button>
              </Tooltip>
            ) : (
              <>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                  title="Edit user"
                />
                <Popconfirm
                  title="Delete this user?"
                  description="This action cannot be undone."
                  onConfirm={() => handleDelete(record.id!)}
                >
                  <Button 
                    size="small" 
                    danger 
                    icon={<DeleteOutlined />}
                    title="Delete user"
                  />
                </Popconfirm>
              </>
            )}
            <Dropdown
              menu={{ items: getUserMenuItems(record) }}
              trigger={["click"]}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedUsers,
    onChange: setSelectedUsers,
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
            User Management
          </Title>
          <Space>
            <Button icon={<ExportOutlined />}>Export</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              Add User
            </Button>
          </Space>
        </div>

        {/* Stats */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Total Users" value={stats.total} />
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
              <Statistic title="Admins" value={stats.admin} />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search users..."
              onSearch={handleSearch}
              style={{ width: "100%" }}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Role"
              value={filterRole}
              onChange={setFilterRole}
              style={{ width: "100%" }}
            >
              <Option value="all">All Roles</Option>
              <Option value="USER">User</Option>
              <Option value="ADMIN">Admin</Option>
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
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Plan"
              value={filterPlan}
              onChange={setFilterPlan}
              style={{ width: "100%" }}
            >
              <Option value="all">All Plans</Option>
              <Option value="FREE">Free</Option>
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

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>{selectedUsers.length} users selected</Text>
              <Space>
                <Button onClick={() => handleBulkAction("activate")}>
                  Activate
                </Button>
                <Button onClick={() => handleBulkAction("deactivate")}>
                  Deactivate
                </Button>
                <Button onClick={() => handleBulkAction("email")}>
                  Send Email
                </Button>
                <Popconfirm 
                  title="Delete selected users?"
                  description="Admin users will be skipped automatically."
                  onConfirm={() => handleBulkAction("delete")}
                >
                  <Button danger>Delete</Button>
                </Popconfirm>
              </Space>
            </div>
            {(() => {
              const selectedUserData = users.filter(u => selectedUsers.includes(u.id!));
              const adminCount = selectedUserData.filter(user => isAdminUser(user)).length;
              if (adminCount > 0) {
                return (
                  <Text type="warning" style={{ fontSize: 12 }}>
                    <LockOutlined /> {adminCount} admin user(s) selected. Admin users cannot be deleted or modified.
                  </Text>
                );
              }
              return null;
            })()}
          </Space>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
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
              `${range[0]}-${range[1]} of ${total} users`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* User Modal */}
      <Modal
        title={editingUser ? "Edit User" : "Add New User"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[
                  { max: 100, message: "First name must not exceed 100 characters" }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[
                  { max: 100, message: "Last name must not exceed 100 characters" }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Email should be valid" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item 
            name="username" 
            label="Username"
            rules={[
              { required: true, message: "Username is required" },
              { min: 3, max: 50, message: "Username must be between 3 and 50 characters" }
            ]}
          >
            <Input />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Password is required" },
                { min: 6, message: "Password must be at least 6 characters" }
              ]}
            >
              <Password />
            </Form.Item>
          )}

          <Form.Item 
            name="avatarUrl" 
            label="Avatar URL"
            rules={[
              { max: 500, message: "Avatar URL must not exceed 500 characters" }
            ]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="role" label="Role" initialValue="USER">
                <Select>
                  <Option value="USER">User</Option>
                  <Option value="ADMIN">Admin</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subscriptionTier" label="Plan" initialValue="FREE">
                <Select>
                  <Option value="FREE">Free</Option>
                  <Option value="PREMIUM">Premium</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="credits" label="Credits" initialValue={10}>
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="Status" initialValue={true}>
                <Select>
                  <Option value={true}>Active</Option>
                  <Option value={false}>Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="emailVerified" label="Email Verified" initialValue={false}>
            <Select>
              <Option value={true}>Verified</Option>
              <Option value={false}>Not Verified</Option>
            </Select>
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingUser(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingUser ? "Update" : "Create"} User
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement; 