import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card.jsx';

export const RevenueTrend = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { period: 'W1', revenue: 38000, target: 35000 },
    { period: 'W2', revenue: 44000, target: 35000 },
    { period: 'W3', revenue: 49000, target: 35000 },
    { period: 'W4', revenue: 53500, target: 35000 }
  ];

  return (
    <Card title="Weekly Revenue Trajectory" subtitle="Actual pacing versus weekly targets">
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              formatter={(val) => [`$${val.toLocaleString()}`, '']}
            />
            <Line type="monotone" dataKey="revenue" name="Actual Revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="dash" dataKey="target" name="Target Goal" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
