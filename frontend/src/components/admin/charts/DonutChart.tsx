import React from "react";
import { Card, Typography } from "antd";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

const { Text } = Typography;

interface DonutChartProps {
  title: string;
  data: number[];
  labels: string[];
  height?: number;
  colors?: string[];
  loading?: boolean;
  showLegend?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({
  title,
  data,
  labels,
  height = 300,
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"],
  loading = false,
  showLegend = true,
}) => {
  const options: ApexOptions = {
    chart: {
      type: 'donut',
      height,
    },
    colors,
    labels,
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        return `${val.toFixed(1)}%`;
      },
      style: {
        fontSize: '12px',
        fontFamily: 'inherit',
        fontWeight: 600,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontFamily: 'inherit',
              fontWeight: 600,
              color: '#374151',
            },
            value: {
              show: true,
              fontSize: '20px',
              fontFamily: 'inherit',
              fontWeight: 700,
              color: '#1e293b',
              formatter: (val: string) => {
                return parseInt(val).toLocaleString();
              },
            },
            total: {
              show: true,
              showAlways: false,
              label: 'Total',
              fontSize: '14px',
              fontFamily: 'inherit',
              fontWeight: 600,
              color: '#64748b',
              formatter: (w: any) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return total.toLocaleString();
              },
            },
          },
        },
      },
    },
    legend: {
      show: showLegend,
      position: 'bottom',
      horizontalAlign: 'center',
      fontFamily: 'inherit',
      fontSize: '14px',
      fontWeight: 500,
      labels: {
        colors: '#374151',
      },
      markers: {
        width: 12,
        height: 12,
        radius: 6,
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
          return value.toLocaleString();
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 250,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
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
        type="donut"
        height={height}
      />
    </Card>
  );
};

export default DonutChart;