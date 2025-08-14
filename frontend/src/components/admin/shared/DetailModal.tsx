import React from "react";
import {
  Modal,
  Descriptions,
  Typography,
  Tag,
  Space,
  Button,
  Divider,
} from "antd";
import {
  CloseOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export interface DetailField {
  label: string;
  key: string;
  render?: (value: any, record: any) => React.ReactNode;
  span?: number;
}

export interface DetailSection {
  title: string;
  fields: DetailField[];
}

export interface DetailAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (record: any) => void;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  danger?: boolean;
  disabled?: boolean;
}

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: any;
  sections: DetailSection[];
  actions?: DetailAction[];
  loading?: boolean;
  width?: number;
  footer?: React.ReactNode;
}

const DetailModal: React.FC<DetailModalProps> = ({
  open,
  onClose,
  title,
  data,
  sections,
  actions = [],
  loading = false,
  width = 800,
  footer,
}) => {
  const renderFieldValue = (field: DetailField, record: any) => {
    const value = record?.[field.key];
    
    if (field.render) {
      return field.render(value, record);
    }

    if (value === null || value === undefined || value === '') {
      return <Text type="secondary">-</Text>;
    }

    if (typeof value === 'boolean') {
      return (
        <Tag color={value ? 'green' : 'red'}>
          {value ? 'Yes' : 'No'}
        </Tag>
      );
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : <Text type="secondary">-</Text>;
    }

    return String(value);
  };

  const defaultFooter = actions.length > 0 ? (
    <Space>
      {actions.map(action => (
        <Button
          key={action.key}
          type={action.type || 'default'}
          icon={action.icon}
          onClick={() => action.onClick(data)}
          danger={action.danger}
          disabled={action.disabled}
        >
          {action.label}
        </Button>
      ))}
    </Space>
  ) : null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0, color: "#1e293b" }}>
            {title}
          </Title>
        </div>
      }
      width={width}
      footer={footer !== undefined ? footer : defaultFooter}
      loading={loading}
      closeIcon={<CloseOutlined />}
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
    >
      {data && (
        <div style={{ marginTop: 16 }}>
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <>
                  <Title level={5} style={{ color: "#374151", marginBottom: 16 }}>
                    {section.title}
                  </Title>
                </>
              )}
              
              <Descriptions
                column={{ xs: 1, sm: 1, md: 2, lg: 2 }}
                bordered
                size="small"
                style={{ marginBottom: 24 }}
              >
                {section.fields.map(field => (
                  <Descriptions.Item
                    key={field.key}
                    label={
                      <Text style={{ fontWeight: 500, color: "#374151" }}>
                        {field.label}
                      </Text>
                    }
                    span={field.span}
                  >
                    {renderFieldValue(field, data)}
                  </Descriptions.Item>
                ))}
              </Descriptions>
              
              {sectionIndex < sections.length - 1 && <Divider />}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default DetailModal;