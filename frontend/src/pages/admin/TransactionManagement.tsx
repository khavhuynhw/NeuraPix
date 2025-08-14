import React, { useState, useEffect } from "react";
import { formatVND } from "../../utils/currency";
import {
  Row,
  Col,
  Typography,
  Spin,
  message,
  Tag,
  Space,
  Button,
  Modal,
} from "antd";
import {
  DollarOutlined,
  TransactionOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  RiseOutlined,
  EyeOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import StatCard from "../../components/admin/StatCard";
import DataTable from "../../components/admin/shared/DataTable";
import FilterPanel from "../../components/admin/shared/FilterPanel";
import DetailModal from "../../components/admin/shared/DetailModal";
import LineChart from "../../components/admin/charts/LineChart";
import DonutChart from "../../components/admin/charts/DonutChart";
import { transactionApi } from "../../services/transactionApi";
import type { Transaction, TransactionStats } from "../../types/transaction";
import type { FilterValues } from "../../components/admin/shared/FilterPanel";
import type { DataTableAction } from "../../components/admin/shared/DataTable";

const { Title, Text } = Typography;

const TransactionManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});

  // Fetch transaction statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await transactionApi.getTransactionStats();
      setStats(statsData);
    } catch (error) {
      console.warn("Backend not available, using demo stats:", error);
      // Use fallback stats for demo
      setStats({
        paidCount: 3,
        pendingCount: 1,
        failedCount: 1,
        cancelledCount: 1,
        totalRevenue: 149.95,
        monthlyRevenue: 89.96,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch transactions with filters
  const fetchTransactions = async (searchFilters: FilterValues = {}) => {
    try {
      setLoading(true);
      const response = await transactionApi.searchTransactions({
        ...searchFilters,
        startDate: searchFilters.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: searchFilters.dateRange?.[1]?.format('YYYY-MM-DD'),
      });
      setTransactions(response.data || []);
    } catch (error) {
      console.warn("Backend not available, using demo data:", error);
      // Use fallback data for demo when backend is not available
      const mockTransactions = [
        {
          id: 1,
          orderCode: 1001,
          amount: 720000,
          currency: "VND",
          status: "PAID" as const,
          type: "SUBSCRIPTION_PAYMENT" as const,
          paymentProvider: "payos",
          paymentMethod: "Credit Card",
          description: "Premium subscription upgrade",
          buyerEmail: "user@example.com",
          userId: 1,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 2,
          orderCode: 1002,
          amount: 240000,
          currency: "VND",
          status: "PENDING" as const,
          type: "SUBSCRIPTION_PAYMENT" as const,
          paymentProvider: "payos",
          paymentMethod: "PayPal",
          description: "Basic subscription",
          buyerEmail: "user2@example.com",
          userId: 2,
          createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          updatedAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 3,
          orderCode: 1003,
          amount: 480000,
          currency: "VND",
          status: "PAID" as const,
          type: "SUBSCRIPTION_RENEWAL" as const,
          paymentProvider: "payos",
          paymentMethod: "Credit Card",
          description: "Monthly subscription renewal",
          buyerEmail: "user3@example.com",
          userId: 3,
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 4,
          orderCode: 1004,
          amount: 960000,
          currency: "VND",
          status: "FAILED" as const,
          type: "SUBSCRIPTION_PAYMENT" as const,
          paymentProvider: "payos",
          paymentMethod: "Credit Card",
          description: "Premium subscription upgrade",
          buyerEmail: "user4@example.com",
          userId: 4,
          createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: 5,
          orderCode: 1005,
          amount: 2400000,
          currency: "VND",
          status: "CANCELLED" as const,
          type: "SUBSCRIPTION_PAYMENT" as const,
          paymentProvider: "payos",
          paymentMethod: "Bank Transfer",
          description: "Annual premium subscription",
          buyerEmail: "user5@example.com",
          userId: 5,
          createdAt: new Date(Date.now() - 900000).toISOString(), // 15 mins ago
          updatedAt: new Date(Date.now() - 900000).toISOString(),
        },
      ];
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, []);

  // Filter configuration
  const filterFields = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'All', value: '' },
        { label: 'Paid', value: 'PAID' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Failed', value: 'FAILED' },
        { label: 'Cancelled', value: 'CANCELLED' },
      ],
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select' as const,
      options: [
        { label: 'All', value: '' },
        { label: 'Subscription', value: 'SUBSCRIPTION' },
        { label: 'One-time', value: 'ONE_TIME' },
        { label: 'Refund', value: 'REFUND' },
      ],
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'dateRange' as const,
    },
    {
      key: 'amountRange',
      label: 'Amount Range',
      type: 'numberRange' as const,
    },
  ];

  // Table columns
  const columns = [
    {
      title: 'Order Code',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (orderCode: number) => (
        <Text style={{ fontFamily: 'monospace', fontWeight: 500 }}>
          #{orderCode}
        </Text>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Transaction) => 
        formatVND(amount),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag 
          color={transactionApi.getStatusColor(status)}
          style={{ borderRadius: 4 }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => method || '-',
    },
    {
      title: 'Customer',
      dataIndex: 'buyerEmail',
      key: 'buyerEmail',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Transaction) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewTransaction(record)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  // Transaction actions
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  const handleExportTransactions = () => {
    transactionApi.exportTransactionsToCSV(transactions, 'transactions.csv');
    message.success('Transactions exported successfully');
  };

  // Bulk actions
  const bulkActions: DataTableAction[] = [
    {
      key: 'export',
      label: 'Export Selected',
      icon: <DownloadOutlined />,
      onClick: (selectedKeys) => {
        const selectedTransactions = transactions.filter(t => 
          selectedKeys.includes(t.id.toString())
        );
        transactionApi.exportTransactionsToCSV(selectedTransactions, 'selected-transactions.csv');
        message.success(`${selectedTransactions.length} transactions exported`);
      },
    },
  ];

  // Detail modal sections
  const detailSections = [
    {
      title: 'Transaction Details',
      fields: [
        { label: 'Order Code', key: 'orderCode' },
        { label: 'Amount', key: 'amount', render: (value: number, record: Transaction) => 
          formatVND(value) },
        { label: 'Currency', key: 'currency' },
        { label: 'Status', key: 'status', render: (status: string) => (
          <Tag color={transactionApi.getStatusColor(status)}>{status}</Tag>
        )},
        { label: 'Type', key: 'type' },
        { label: 'Payment Provider', key: 'paymentProvider' },
        { label: 'Payment Method', key: 'paymentMethod' },
        { label: 'Description', key: 'description', span: 2 },
      ],
    },
    {
      title: 'Customer Information',
      fields: [
        { label: 'Email', key: 'buyerEmail' },
        { label: 'Created At', key: 'createdAt', render: (date: string) => 
          new Date(date).toLocaleString() },
        { label: 'Updated At', key: 'updatedAt', render: (date: string) => 
          new Date(date).toLocaleString() },
      ],
    },
  ];

  // Chart data (mock data for demo)
  const chartData = [
    {
      name: 'Revenue',
      data: [4000, 3000, 2000, 2780, 1890, 2390, 3490],
    },
  ];
  const chartCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  const statusDistribution = [65, 20, 10, 5];
  const statusLabels = ['Paid', 'Pending', 'Failed', 'Cancelled'];

  return (
    <div style={{ padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, color: "#1e293b", fontWeight: 600 }}>
          Transaction Management
        </Title>
        <Text style={{ color: "#64748b", fontSize: 16 }}>
          Monitor and manage all payment transactions
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Revenue"
            value={stats ? `$${stats.totalRevenue?.toLocaleString() || '0'}` : '$0'}
            subtitle="All time"
            icon={<DollarOutlined />}
            trend={{ value: "+12.5%", isPositive: true }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Transactions"
            value={stats ? (stats.paidCount + stats.pendingCount + stats.failedCount + stats.cancelledCount) : 0}
            subtitle="All time"
            icon={<TransactionOutlined />}
            trend={{ value: "+8.2%", isPositive: true }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Pending Transactions"
            value={stats?.pendingCount || 0}
            subtitle="Awaiting processing"
            icon={<ClockCircleOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Success Rate"
            value={stats ? `${((stats.paidCount / (stats.paidCount + stats.failedCount)) * 100).toFixed(1)}%` : '0%'}
            subtitle="Payment success rate"
            icon={<RiseOutlined />}
            trend={{ value: "+2.1%", isPositive: true }}
          />
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={16}>
          <LineChart
            title="Revenue Trend"
            data={chartData}
            categories={chartCategories}
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} lg={8}>
          <DonutChart
            title="Transaction Status Distribution"
            data={statusDistribution}
            labels={statusLabels}
            loading={statsLoading}
          />
        </Col>
      </Row>

      {/* Filters */}
      <FilterPanel
        fields={filterFields}
        onFilter={(values) => {
          setFilters(values);
          fetchTransactions(values);
        }}
        onClear={() => {
          setFilters({});
          fetchTransactions();
        }}
        loading={loading}
      />

      {/* Transactions Table */}
      <DataTable
        title="Transactions"
        data={transactions}
        columns={columns}
        loading={loading}
        onRefresh={() => fetchTransactions(filters)}
        onExport={handleExportTransactions}
        bulkActions={bulkActions}
        rowKey="id"
      />

      {/* Transaction Detail Modal */}
      <DetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Transaction Details"
        data={selectedTransaction}
        sections={detailSections}
        width={800}
      />
    </div>
  );
};

export default TransactionManagement;