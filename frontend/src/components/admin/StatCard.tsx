import React from "react";
import { Card, Typography } from "antd";

const { Text } = Typography;

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
}) => {
  return (
    <Card
      style={{
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        height: "100%",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              color: "#64748b",
              fontWeight: 500,
              display: "block",
              marginBottom: 8,
            }}
          >
            {title}
          </Text>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#334155",
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {subtitle && (
            <Text
              style={{
                fontSize: 12,
                color: "#64748b",
                display: "block",
                marginBottom: 8,
              }}
            >
              {subtitle}
            </Text>
          )}
          {trend && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: trend.isPositive ? "#059669" : "#dc2626",
                  fontWeight: 500,
                }}
              >
                {trend.isPositive ? "↗" : "↘"} {trend.value}
              </Text>
            </div>
          )}
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            background: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#475569",
            fontSize: 20,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;