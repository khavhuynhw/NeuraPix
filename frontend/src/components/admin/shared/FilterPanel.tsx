import React, { useState } from "react";
import {
  Card,
  Space,
  Button,
  Select,
  DatePicker,
  Input,
  InputNumber,
  Typography,
  Collapse,
  Row,
  Col,
} from "antd";
import {
  FilterOutlined,
  ClearOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

export interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'dateRange' | 'numberRange' | 'text' | 'multiSelect';
  options?: Array<{ label: string; value: any; }>;
  placeholder?: string;
  defaultValue?: any;
}

export interface FilterValues {
  [key: string]: any;
}

interface FilterPanelProps {
  fields: FilterField[];
  onFilter: (values: FilterValues) => void;
  onClear: () => void;
  loading?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  fields,
  onFilter,
  onClear,
  loading = false,
  collapsible = true,
  defaultCollapsed = true,
}) => {
  const [filterValues, setFilterValues] = useState<FilterValues>(() => {
    const initial: FilterValues = {};
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initial[field.key] = field.defaultValue;
      }
    });
    return initial;
  });

  const handleFieldChange = (key: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    const cleanedValues: FilterValues = {};
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          cleanedValues[key] = value;
        } else if (!Array.isArray(value)) {
          cleanedValues[key] = value;
        }
      }
    });
    onFilter(cleanedValues);
  };

  const handleClearFilters = () => {
    const cleared: FilterValues = {};
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        cleared[field.key] = field.defaultValue;
      }
    });
    setFilterValues(cleared);
    onClear();
  };

  const renderField = (field: FilterField) => {
    const value = filterValues[field.key];

    switch (field.type) {
      case 'select':
        return (
          <Select
            placeholder={field.placeholder || `Select ${field.label}`}
            value={value}
            onChange={(val) => handleFieldChange(field.key, val)}
            style={{ width: '100%' }}
            allowClear
          >
            {field.options?.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        );

      case 'multiSelect':
        return (
          <Select
            mode="multiple"
            placeholder={field.placeholder || `Select ${field.label}`}
            value={value}
            onChange={(val) => handleFieldChange(field.key, val)}
            style={{ width: '100%' }}
            allowClear
          >
            {field.options?.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        );

      case 'dateRange':
        return (
          <RangePicker
            value={value}
            onChange={(dates) => handleFieldChange(field.key, dates)}
            style={{ width: '100%' }}
            placeholder={['Start Date', 'End Date']}
          />
        );

      case 'numberRange':
        return (
          <Input.Group compact>
            <InputNumber
              placeholder="Min"
              value={value?.[0]}
              onChange={(val) => handleFieldChange(field.key, [val, value?.[1]])}
              style={{ width: '50%' }}
            />
            <InputNumber
              placeholder="Max"
              value={value?.[1]}
              onChange={(val) => handleFieldChange(field.key, [value?.[0], val])}
              style={{ width: '50%' }}
            />
          </Input.Group>
        );

      case 'text':
        return (
          <Input
            placeholder={field.placeholder || `Enter ${field.label}`}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            prefix={<SearchOutlined />}
          />
        );

      default:
        return null;
    }
  };

  const hasActiveFilters = Object.values(filterValues).some(value => 
    value !== undefined && value !== null && value !== '' && 
    (!Array.isArray(value) || value.length > 0)
  );

  const filterContent = (
    <div style={{ padding: collapsible ? 0 : 16 }}>
      <Row gutter={[16, 16]}>
        {fields.map(field => (
          <Col xs={24} sm={12} md={8} lg={6} key={field.key}>
            <div>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: 8,
                  display: "block",
                }}
              >
                {field.label}
              </Text>
              {renderField(field)}
            </div>
          </Col>
        ))}
      </Row>
      
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <Space>
          <Button
            onClick={handleClearFilters}
            icon={<ClearOutlined />}
            disabled={!hasActiveFilters}
          >
            Clear
          </Button>
          <Button
            type="primary"
            onClick={handleApplyFilters}
            icon={<FilterOutlined />}
            loading={loading}
            style={{
              background: "#3b82f6",
              borderColor: "#3b82f6",
            }}
          >
            Apply Filters
          </Button>
        </Space>
      </div>
    </div>
  );

  if (!collapsible) {
    return (
      <Card
        style={{
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          marginBottom: 16,
        }}
      >
        {filterContent}
      </Card>
    );
  }

  return (
    <Card
      style={{
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        marginBottom: 16,
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Collapse
        defaultActiveKey={defaultCollapsed ? [] : ['filters']}
        ghost
        expandIconPosition="end"
      >
        <Panel
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FilterOutlined />
              <Text style={{ fontWeight: 500 }}>Filters</Text>
              {hasActiveFilters && (
                <div
                  style={{
                    background: "#3b82f6",
                    color: "white",
                    borderRadius: 10,
                    padding: "2px 8px",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {Object.values(filterValues).filter(v => 
                    v !== undefined && v !== null && v !== '' && 
                    (!Array.isArray(v) || v.length > 0)
                  ).length}
                </div>
              )}
            </div>
          }
          key="filters"
        >
          {filterContent}
        </Panel>
      </Collapse>
    </Card>
  );
};

export default FilterPanel;