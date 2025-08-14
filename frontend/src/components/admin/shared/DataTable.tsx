import React, { useState } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Space,
  Typography,
  Dropdown,
  message,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TableProps } from "antd/es/table";

const { Text } = Typography;

export interface DataTableAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedKeys: React.Key[]) => void;
  disabled?: boolean;
  danger?: boolean;
}

export interface DataTableProps<T = any> extends Omit<TableProps<T>, 'dataSource' | 'title'> {
  title: string;
  data: T[];
  columns: ColumnsType<T>;
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  actions?: DataTableAction[];
  bulkActions?: DataTableAction[];
  onRefresh?: () => void;
  onExport?: () => void;
  showSelection?: boolean;
  filters?: React.ReactNode;
  extra?: React.ReactNode;
}

const DataTable = <T extends Record<string, any>>({
  title,
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  onSearch,
  actions = [],
  bulkActions = [],
  onRefresh,
  onExport,
  showSelection = false,
  filters,
  extra,
  ...tableProps
}: DataTableProps<T>) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleBulkAction = (action: DataTableAction) => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select items first");
      return;
    }
    action.onClick(selectedRowKeys);
  };

  const rowSelection = showSelection || bulkActions.length > 0 ? {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record: T) => ({
      disabled: record.disabled,
    }),
  } : undefined;

  const bulkActionMenuItems = bulkActions.map(action => ({
    key: action.key,
    label: action.label,
    icon: action.icon,
    disabled: action.disabled,
    danger: action.danger,
    onClick: () => handleBulkAction(action),
  }));

  return (
    <Card
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: 600, color: "#1e293b" }}>
            {title}
          </Text>
          <Space>
            {searchable && (
              <Input
                placeholder={searchPlaceholder}
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
            )}
            {filters}
            {extra}
            {onRefresh && (
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                title="Refresh"
              />
            )}
            {onExport && (
              <Button
                icon={<DownloadOutlined />}
                onClick={onExport}
                title="Export"
              />
            )}
          </Space>
        </div>
      }
      style={{
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Bulk Actions Bar */}
      {selectedRowKeys.length > 0 && bulkActions.length > 0 && (
        <div
          style={{
            padding: "12px 24px",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#64748b" }}>
            {selectedRowKeys.length} item{selectedRowKeys.length !== 1 ? 's' : ''} selected
          </Text>
          <Space>
            {bulkActions.slice(0, 2).map(action => (
              <Button
                key={action.key}
                size="small"
                icon={action.icon}
                onClick={() => handleBulkAction(action)}
                disabled={action.disabled}
                danger={action.danger}
              >
                {action.label}
              </Button>
            ))}
            {bulkActions.length > 2 && (
              <Dropdown
                menu={{ items: bulkActionMenuItems.slice(2) }}
                trigger={['click']}
              >
                <Button size="small" icon={<MoreOutlined />} />
              </Dropdown>
            )}
          </Space>
        </div>
      )}

      <Table
        {...tableProps}
        dataSource={data}
        columns={columns}
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
          pageSizeOptions: ['10', '20', '50', '100'],
          ...tableProps.pagination,
        }}
        scroll={{ x: 'max-content' }}
        size="middle"
      />
    </Card>
  );
};

export default DataTable;