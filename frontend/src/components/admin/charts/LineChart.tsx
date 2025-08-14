import React from "react";
import { Card, Typography } from "antd";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

const { Text } = Typography;

interface LineChartProps {
  title: string;
  data: Array<{ name: string; data: number[] }>;
  categories: string[];
  height?: number;
  colors?: string[];
  loading?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  data,
  categories,
  height = 350,
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
  loading = false,
}) => {
  const options: ApexOptions = {
    chart: {
      type: 'line',
      height,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors,
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 3,
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
        formatter: (value: number) => {
          if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
          }
          if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
          }
          return value.toString();
        },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: 'inherit',
      fontSize: '14px',
      fontWeight: 500,
      labels: {
        colors: '#374151',
      },
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'inherit',
      },
      y: {
        formatter: (value: number) => {
          return new Intl.NumberFormat().format(value);
        },
      },
    },
    markers: {
      size: 0,
      hover: {
        size: 6,
      },
    },
  };

  return (
    <Card
      title={
        <Text style={{ fontSize: 16, fontWeight: 600, color: "#1e293b" }}>
          {title}
        </Text>
      }
      loading={loading}
      style={{
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
      bodyStyle={{ padding: "16px" }}
    >
      <Chart
        options={options}
        series={data}
        type="line"
        height={height}
      />
    </Card>
  );
};

export default LineChart;