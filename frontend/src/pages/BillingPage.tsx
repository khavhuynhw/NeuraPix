import { useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Divider,
  Statistic,
  Progress,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Alert,
  Badge,
  Tooltip,
} from "antd";
import {
  CreditCardOutlined,
  DownloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  CrownOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  SettingOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Mock data
const currentPlan = {
  name: "Pro Plan",
  price: 19,
  period: "month",
  features: [
    "500 images per month",
    "All styles & features",
    "High resolution",
    "Commercial license",
  ],
  nextBilling: "2024-02-15",
  status: "active",
  autoRenew: true,
};

const usageData = {
  imagesUsed: 234,
  imagesLimit: 500,
  resetDate: "2024-02-01",
  overageImages: 0,
  overageCost: 0,
};

const transactions = [
  {
    key: "1",
    id: "TXN-2024-001",
    date: "2024-01-15",
    description: "Pro Plan - Monthly Subscription",
    amount: 19.0,
    status: "completed",
    paymentMethod: "•••• 4242",
    invoice: "INV-2024-001",
  },
  {
    key: "2",
    id: "TXN-2023-012",
    date: "2023-12-15",
    description: "Pro Plan - Monthly Subscription",
    amount: 19.0,
    status: "completed",
    paymentMethod: "•••• 4242",
    invoice: "INV-2023-012",
  },
  {
    key: "3",
    id: "TXN-2023-011",
    date: "2023-11-15",
    description: "Pro Plan - Monthly Subscription",
    amount: 19.0,
    status: "completed",
    paymentMethod: "•••• 4242",
    invoice: "INV-2023-011",
  },
  {
    key: "4",
    id: "TXN-2023-010",
    date: "2023-10-15",
    description: "Pro Plan - Monthly Subscription",
    amount: 19.0,
    status: "completed",
    paymentMethod: "•••• 4242",
    invoice: "INV-2023-010",
  },
  {
    key: "5",
    id: "TXN-2023-009",
    date: "2023-10-05",
    description: "Additional Images (50 images)",
    amount: 5.0,
    status: "completed",
    paymentMethod: "•••• 4242",
    invoice: "INV-2023-009",
  },
];

const paymentMethods = [
  {
    key: "1",
    id: "card_1",
    type: "visa",
    last4: "4242",
    expiry: "12/26",
    isDefault: true,
  },
  {
    key: "2",
    id: "card_2",
    type: "mastercard",
    last4: "8888",
    expiry: "08/25",
    isDefault: false,
  },
];

export const BillingPage = () => {
  const [isAddCardModalVisible, setIsAddCardModalVisible] = useState(false);
  const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);
  const [form] = Form.useForm();

  const handleDownloadInvoice = (invoiceId: string) => {
    console.log("Downloading invoice:", invoiceId);
    // Handle invoice download logic
  };

  const handleAddPaymentMethod = (values: any) => {
    console.log("Adding payment method:", values);
    setIsAddCardModalVisible(false);
    form.resetFields();
  };

  const handleUpgradePlan = () => {
    console.log("Upgrading plan...");
    setIsUpgradeModalVisible(false);
  };

  const transactionColumns = [
    {
      title: "Transaction ID",
      dataIndex: "id",
      key: "id",
      render: (text: string) => (
        <Text style={{ fontFamily: "monospace", color: "#64748b" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <Text>{new Date(date).toLocaleDateString()}</Text>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <Text strong style={{ color: "#0079FF" }}>
          ${amount.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "completed"
              ? "green"
              : status === "pending"
                ? "orange"
                : "red"
          }
          icon={
            status === "completed" ? (
              <CheckCircleOutlined />
            ) : status === "pending" ? (
              <ExclamationCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Invoice",
      dataIndex: "invoice",
      key: "invoice",
      render: (invoice: string) => (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={() => handleDownloadInvoice(invoice)}
          style={{
            color: "#0079FF",
            padding: 0,
            height: "auto",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#3399FF";
            e.currentTarget.style.transform = "translateX(2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#0079FF";
            e.currentTarget.style.transform = "translateX(0)";
          }}
        >
          {invoice}
        </Button>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: "calc(100vh - 128px)",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
            <CreditCardOutlined style={{ marginRight: 12, color: "#0079FF" }} />
            Billing & Transactions
          </Title>
          <Paragraph
            style={{ color: "#64748b", fontSize: 16, margin: "8px 0 0 0" }}
          >
            Manage your subscription, payment methods, and view transaction
            history
          </Paragraph>
        </div>

        {/* Current Plan & Usage */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CrownOutlined style={{ color: "#FFD700" }} />
                  <span>Current Plan</span>
                </div>
              }
              extra={
                <Badge count="Active" style={{ backgroundColor: "#52c41a" }} />
              }
              style={{
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                border: "2px solid #0079FF",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 40px rgba(0, 121, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(0, 0, 0, 0.1)";
              }}
            >
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div>
                  <Title level={3} style={{ margin: 0, color: "#0079FF" }}>
                    {currentPlan.name}
                  </Title>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 4,
                      margin: "8px 0 0 0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: 700,
                        color: "#1f2937",
                      }}
                    >
                      ${currentPlan.price}
                    </Text>
                    <Text type="secondary">/{currentPlan.period}</Text>
                  </div>
                </div>

                <Space direction="vertical" size="small">
                  {currentPlan.features.map((feature, index) => (
                    <div
                      key={index}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      <Text>{feature}</Text>
                    </div>
                  ))}
                </Space>

                <Divider style={{ margin: "16px 0 16px 0" }} />

                <div>
                  <Text type="secondary">Next billing date:</Text>
                  <br />
                  <Text strong style={{ color: "#0079FF" }}>
                    {new Date(currentPlan.nextBilling).toLocaleDateString()}
                  </Text>
                </div>

                <Space>
                  <Button
                    type="primary"
                    icon={<SettingOutlined />}
                    onClick={() => setIsUpgradeModalVisible(true)}
                    style={{
                      background: "#0079FF",
                      borderColor: "#0079FF",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#3399FF";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(0, 121, 255, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#0079FF";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    Manage Plan
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    style={{
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#0079FF";
                      e.currentTarget.style.color = "#0079FF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#d9d9d9";
                      e.currentTarget.style.color = "rgba(0, 0, 0, 0.88)";
                    }}
                  >
                    Cancel Auto-Renew
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title="Usage This Month"
              style={{
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 40px rgba(0, 121, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(0, 0, 0, 0.1)";
              }}
            >
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <Statistic
                  title="Images Generated"
                  value={usageData.imagesUsed}
                  suffix={`/ ${usageData.imagesLimit}`}
                  valueStyle={{
                    color: "#0079FF",
                    fontSize: 32,
                    fontWeight: 700,
                  }}
                />

                <div>
                  <Text
                    type="secondary"
                    style={{ margin: "0 0 8px 0", display: "block" }}
                  >
                    Usage Progress
                  </Text>
                  <Progress
                    percent={
                      (usageData.imagesUsed / usageData.imagesLimit) * 100
                    }
                    strokeColor={{
                      "0%": "#0079FF",
                      "100%": "#00C7FF",
                    }}
                    trailColor="rgba(0, 121, 255, 0.1)"
                    strokeWidth={12}
                    style={{ margin: "0 0 16px 0" }}
                  />
                  <Text style={{ color: "#0079FF", fontWeight: 600 }}>
                    {usageData.imagesLimit - usageData.imagesUsed} images
                    remaining
                  </Text>
                </div>

                <div
                  style={{
                    background: "rgba(0, 121, 255, 0.05)",
                    padding: 16,
                    borderRadius: 8,
                    border: "1px solid rgba(0, 121, 255, 0.1)",
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Your usage resets on{" "}
                    {new Date(usageData.resetDate).toLocaleDateString()}
                  </Text>
                </div>

                {usageData.overageImages > 0 && (
                  <Alert
                    message="Overage Charges"
                    description={`You've used ${usageData.overageImages} additional images this month. Additional charge: $${usageData.overageCost.toFixed(2)}`}
                    type="warning"
                    showIcon
                  />
                )}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Payment Methods */}
        <Card
          title="Payment Methods"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddCardModalVisible(true)}
              style={{
                background: "#0079FF",
                borderColor: "#0079FF",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#3399FF";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0079FF";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Add Card
            </Button>
          }
          style={{
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            marginBottom: 32,
          }}
        >
          <Row gutter={[16, 16]}>
            {paymentMethods.map((method) => (
              <Col xs={24} sm={12} lg={8} key={method.key}>
                <Card
                  style={{
                    borderRadius: 12,
                    border: method.isDefault
                      ? "2px solid #0079FF"
                      : "1px solid #f0f0f0",
                    transition: "all 0.3s ease",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 25px rgba(0, 121, 255, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {method.isDefault && (
                    <div
                      style={{
                        position: "absolute",
                        top: -8,
                        right: 12,
                        background: "#0079FF",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Default
                    </div>
                  )}
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 24,
                          background:
                            method.type === "visa" ? "#1A1F71" : "#EB001B",
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {method.type.toUpperCase()}
                      </div>
                      <Text strong>•••• {method.last4}</Text>
                    </div>
                    <Text type="secondary">Expires {method.expiry}</Text>
                    <Space>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        style={{
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#0079FF";
                          e.currentTarget.style.borderColor = "#0079FF";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "rgba(0, 0, 0, 0.88)";
                          e.currentTarget.style.borderColor = "#d9d9d9";
                        }}
                      >
                        Edit
                      </Button>
                      {!method.isDefault && (
                        <Button
                          size="small"
                          icon={<DeleteOutlined />}
                          danger
                          style={{
                            transition: "all 0.3s ease",
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Transaction History */}
        <Card
          title="Transaction History"
          extra={
            <Space>
              <RangePicker
                value={selectedDateRange}
                onChange={setSelectedDateRange}
                style={{ marginRight: 8 }}
              />
              <Button
                icon={<DownloadOutlined />}
                style={{
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#0079FF";
                  e.currentTarget.style.color = "#0079FF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#d9d9d9";
                  e.currentTarget.style.color = "rgba(0, 0, 0, 0.88)";
                }}
              >
                Export
              </Button>
            </Space>
          }
          style={{
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Table
            columns={transactionColumns}
            dataSource={transactions}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} transactions`,
            }}
            scroll={{ x: 800 }}
            style={{
              "& .ant-table-thead > tr > th": {
                backgroundColor: "rgba(0, 121, 255, 0.05)",
                borderBottom: "2px solid rgba(0, 121, 255, 0.1)",
              },
            }}
          />
        </Card>

        {/* Modals */}
        <Modal
          title="Add Payment Method"
          open={isAddCardModalVisible}
          onCancel={() => setIsAddCardModalVisible(false)}
          footer={null}
          style={{ top: 50 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddPaymentMethod}
            style={{ margin: "24px 0 0 0" }}
          >
            <Form.Item
              name="cardNumber"
              label="Card Number"
              rules={[{ required: true, message: "Please enter card number" }]}
            >
              <Input
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                style={{
                  fontSize: 16,
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0079FF";
                  e.target.style.boxShadow = "0 0 0 2px rgba(0, 121, 255, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d9d9d9";
                  e.target.style.boxShadow = "none";
                }}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col xs={12}>
                <Form.Item
                  name="expiry"
                  label="Expiry Date"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input placeholder="MM/YY" maxLength={5} />
                </Form.Item>
              </Col>
              <Col xs={12}>
                <Form.Item
                  name="cvc"
                  label="CVC"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input placeholder="123" maxLength={4} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="name"
              label="Cardholder Name"
              rules={[
                { required: true, message: "Please enter cardholder name" },
              ]}
            >
              <Input placeholder="John Doe" />
            </Form.Item>
            <Form.Item style={{ margin: "24px 0 0 0" }}>
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button onClick={() => setIsAddCardModalVisible(false)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    background: "#0079FF",
                    borderColor: "#0079FF",
                  }}
                >
                  Add Card
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Manage Subscription"
          open={isUpgradeModalVisible}
          onCancel={() => setIsUpgradeModalVisible(false)}
          footer={null}
          style={{ top: 50 }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Alert
              message="Current Plan: Pro ($19/month)"
              description="You can upgrade, downgrade, or cancel your subscription below."
              type="info"
              showIcon
            />

            <div>
              <Title level={4}>Available Plans</Title>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <Card size="small" style={{ background: "#f8fafc" }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text strong>Free Plan</Text>
                      <br />
                      <Text type="secondary">10 images/month</Text>
                    </Col>
                    <Col>
                      <Text strong>$0/month</Text>
                    </Col>
                  </Row>
                </Card>

                <Card size="small" style={{ border: "2px solid #0079FF" }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text strong style={{ color: "#0079FF" }}>
                        Pro Plan (Current)
                      </Text>
                      <br />
                      <Text type="secondary">500 images/month</Text>
                    </Col>
                    <Col>
                      <Text strong style={{ color: "#0079FF" }}>
                        $19/month
                      </Text>
                    </Col>
                  </Row>
                </Card>

                <Card size="small">
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text strong>Enterprise Plan</Text>
                      <br />
                      <Text type="secondary">Unlimited images</Text>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        size="small"
                        style={{ background: "#0079FF" }}
                      >
                        Contact Sales
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Space>
            </div>

            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setIsUpgradeModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" danger onClick={handleUpgradePlan}>
                Cancel Subscription
              </Button>
            </Space>
          </Space>
        </Modal>
      </div>
    </div>
  );
};
