import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { getAllUsers, getAllSubscriptions } from '../services/authApi';
import type { UserResponse, SubscriptionResponse } from '../types/auth';

const roleOptions = ['Tất cả', 'Free', 'Basic', 'Premium'];
const pieColors = ['#0079FF', '#00C897', '#FFB200'];

const cardStyle = (color: string): React.CSSProperties => ({
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: '1.5rem',
  flex: 1,
  minWidth: 180,
  margin: '0.5rem',
  borderTop: `4px solid ${color}`,
  textAlign: 'center',
});

const gridStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '2rem',
  flexWrap: 'wrap',
};

const tableSectionStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: '2rem',
  marginBottom: '2rem',
};

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    generatedImages: any[];
  }>>([]);
  const [roleFilter, setRoleFilter] = useState('Tất cả');
  const [dateFilter, setDateFilter] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [packageData, setPackageData] = useState<{ name: string; value: number; color: string }[]>(
    [
      { name: 'Free', value: 0, color: '#0079FF' },
      { name: 'Basic', value: 0, color: '#00C897' },
      { name: 'Premium', value: 0, color: '#FFB200' },
    ]
  );
  const [chartData, setChartData] = useState<{ date: string; sales: number }[]>([]);

  useEffect(() => {
    getAllUsers()
      .then((data: UserResponse[]) => {
        console.log("getAllUsers result:", data); 
        const mapped = data.map(u => ({
          id: u.id,
          name: (u.firstName && u.lastName)
            ? `${u.firstName} ${u.lastName}`
            : u.firstName || u.lastName || u.username,
          email: u.email,
          role:
            u.subscriptionTier === 'FREE' ? 'Free' :
            u.subscriptionTier === 'BASIC' ? 'Basic' :
            u.subscriptionTier === 'PREMIUM' ? 'Premium' :
            u.subscriptionTier === 'Free' ? 'Free' :
            u.subscriptionTier === 'Basic' ? 'Basic' :
            u.subscriptionTier === 'Premium' ? 'Premium' :
            'Free',
          status: u.isActive ? 'Hoạt động' : 'Khóa',
          createdAt: typeof u.createdAt === 'string'
            ? u.createdAt.slice(0, 10)
            : (u.createdAt && u.createdAt.toISOString
                ? u.createdAt.toISOString().slice(0, 10)
                : ''),
          generatedImages: Array.isArray(u.generatedImages) ? u.generatedImages : [],
        }));
        console.log("mapped users", mapped);
        setUsers(mapped);
      })
      .catch((err) => {
        console.error("getAllUsers error", err);
      });

    getAllSubscriptions()
      .then((subs: SubscriptionResponse[]) => {
        console.log("getAllSubscriptions result:", subs);
        const revenue = subs
          .filter(s => s.status === 'ACTIVE' || s.status === 'PAST_DUE')
          .reduce((sum, s) => sum + (typeof s.price === 'number' ? s.price : parseFloat(s.price)), 0);

        setTotalRevenue(revenue);

        const salesByDate: Record<string, number> = {};
        subs
          .filter(s => s.status === 'ACTIVE' || s.status === 'PAST_DUE')
          .forEach(s => {
            let dateStr = '';
            if (typeof s.createdAt === 'string') {
              dateStr = s.createdAt.slice(0, 10);
            } else if (s.createdAt && s.createdAt.toISOString) {
              dateStr = s.createdAt.toISOString().slice(0, 10);
            }
            if (dateStr) {
              const price = typeof s.price === 'number' ? s.price : parseFloat(s.price);
              salesByDate[dateStr] = (salesByDate[dateStr] || 0) + price;
            }
          });
        const chartArr = Object.entries(salesByDate)
          .map(([date, sales]) => ({ date, sales }))
          .sort((a, b) => a.date.localeCompare(b.date));
        setChartData(chartArr);

        const tierMap: Record<string, number> = { Free: 0, Basic: 0, Premium: 0 };
        subs.forEach(s => {
          if (s.tier === 'FREE') tierMap.Free += 1;
          else if (s.tier === 'BASIC') tierMap.Basic += 1;
          else if (s.tier === 'PREMIUM') tierMap.Premium += 1;
        });
        setPackageData([
          { name: 'Free', value: tierMap.Free, color: '#0079FF' },
          { name: 'Basic', value: tierMap.Basic, color: '#00C897' },
          { name: 'Premium', value: tierMap.Premium, color: '#FFB200' },
        ]);
      })
      .catch(() => {
      });
  }, []);

  const chartLabel = 'Tổng doanh số thực tế theo ngày ($)';

  const filteredUsers = users.filter(u =>
    (roleFilter === 'Tất cả' || u.role === roleFilter) &&
    (!dateFilter || u.createdAt >= dateFilter)
  );

  const handleUpdateRole = (id: number, newRole: string) => {
    setUsers(users => users.map(u => u.id === id ? { ...u, role: newRole } : u));
  };
  const handleToggleStatus = (id: number) => {
    setUsers(users => users.map(u =>
      u.id === id ? { ...u, status: u.status === 'Hoạt động' ? 'Khóa' : 'Hoạt động' } : u
    ));
  };

  const totalUsers = users.length;
  const totalUploadedImages = users.reduce((sum, u: any) => sum + (u.generatedImages?.length || 0), 0);
  const totalPackage = packageData.reduce((sum, p) => sum + p.value, 0);

  const stats = [
    { label: 'Người dùng', value: totalUsers, color: '#0079FF' },
    { label: 'Ảnh đã upload', value: totalUploadedImages, color: '#00C897' },
    { label: 'Doanh thu ($)', value: totalRevenue.toLocaleString(), color: '#FFB200' },
    { label: 'Gói dịch vụ', value: totalPackage, color: '#FF6B6B' },
  ];

  return (
    <div style={{ padding: '2rem', background: '#f5f6fa', minHeight: '100vh' }}>
      <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 8 }}>Welcome, Admin!</h1>
      <div style={{ color: '#888', marginBottom: 32 }}>Tổng quan hệ thống NeuraPix</div>
      <div style={gridStyle}>
        {stats.map((s) => (
          <div key={s.label} style={cardStyle(s.color)}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ color: '#888', marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 32 }}>
        <div style={{ flex: 2, minWidth: 320, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 600, flex: 1 }}>{chartLabel}</span>
          </div>
          <div style={{ width: '100%', maxWidth: 600, height: 220 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v: number) => `$${v.toLocaleString()}`} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`}/>
                <Bar dataKey="sales" fill="#0079FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 260, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Thị phần gói người dùng</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={packageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ value }) => value }>
                {packageData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip formatter={(value: number) => value } />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 24 }}>
            {packageData.map((pkg, idx) => {
              const percent = totalPackage ? ((pkg.value / totalPackage) * 100).toFixed(1) : '0.0';
              return (
                <div key={pkg.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ width: 16, height: 16, background: pkg.color, borderRadius: 4, marginRight: 8 }}></div>
                  <span style={{ minWidth: 70 }}>{pkg.name}</span>
                  <span style={{ color: '#888', marginLeft: 12 }}>{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={tableSectionStyle}>
        <h2 style={{ fontWeight: 600, marginBottom: 16 }}>Danh sách người dùng</h2>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc' }}>
            {roleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#f0f2f5' }}>
              <th style={{ padding: 10, border: '1px solid #eee', fontWeight: 500 }}>ID</th>
              <th style={{ padding: 10, border: '1px solid #eee', fontWeight: 500 }}>Tên</th>
              <th style={{ padding: 10, border: '1px solid #eee', fontWeight: 500 }}>Email</th>
              <th style={{ padding: 10, border: '1px solid #eee', fontWeight: 500 }}>Gói</th>
              <th style={{ padding: 10, border: '1px solid #eee', fontWeight: 500 }}>Ngày đăng ký</th>
              <th style={{ padding: 10, border: '1px solid #eee', fontWeight: 500 }}>Trạng thái</th>
              <th style={{ padding: 10, border: '1px solid #eee', fontWeight: 500 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td style={{ padding: 10, border: '1px solid #eee' }}>{u.id}</td>
                <td style={{ padding: 10, border: '1px solid #eee' }}>{u.name}</td>
                <td style={{ padding: 10, border: '1px solid #eee' }}>{u.email}</td>
                <td style={{ padding: 10, border: '1px solid #eee' }}>
                  <select value={u.role} onChange={e => handleUpdateRole(u.id, e.target.value)} style={{ padding: 4, borderRadius: 4 }}>
                    <option value="Free">Free</option>
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                  </select>
                </td>
                <td style={{ padding: 10, border: '1px solid #eee' }}>{u.createdAt}</td>
                <td style={{ padding: 10, border: '1px solid #eee' }}>{u.status}</td>
                <td style={{ padding: 10, border: '1px solid #eee' }}>
                  <button onClick={() => handleToggleStatus(u.id)} style={{ padding: '4px 10px', borderRadius: 4, background: u.status === 'Hoạt động' ? '#FF6B6B' : '#00C897', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    {u.status === 'Hoạt động' ? 'Khóa' : 'Mở khóa'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
