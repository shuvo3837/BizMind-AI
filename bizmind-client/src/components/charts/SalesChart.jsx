import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card.jsx';

export const SalesChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { category: 'SaaS Subscriptions', amount: 92000 },
    { category: 'Hardware Units', amount: 48000 },
    { category: 'Consulting Services', amount: 28500 },
    { category: 'Enterprise Add-ons', amount: 16000 }
  ];

  return (
    <Card title="Sales Breakdown by Revenue Stream" subtitle="Gross income contribution across product lines">
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']}
            />
            <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
