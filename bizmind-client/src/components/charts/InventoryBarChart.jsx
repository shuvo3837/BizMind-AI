import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card } from '../common/Card.jsx';

export const InventoryBarChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { product: 'Smart Hub', stock: 142, reorder: 30 },
    { product: 'IoT Sensor', stock: 18, reorder: 25 },
    { product: 'Gateway', stock: 88, reorder: 20 },
    { product: 'Power Unit', stock: 4, reorder: 10 }
  ];

  return (
    <Card title="Inventory Levels vs Reorder Thresholds" subtitle="SKU stock management and supply metrics">
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="product" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
            />
            <Bar dataKey="stock" name="Current Stock" fill="#6366f1" radius={[6, 6, 0, 0]} />
            <Bar dataKey="reorder" name="Reorder Level" fill="#f43f5e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
