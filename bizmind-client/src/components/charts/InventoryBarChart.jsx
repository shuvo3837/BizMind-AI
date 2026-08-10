import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card.jsx';

export const InventoryBarChart = ({ data = [] }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card title="Inventory Levels vs Reorder Thresholds" subtitle="SKU stock from your latest uploads">
      <div className="h-64 w-full mt-4 flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
        ) : (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 px-6">
            <p className="font-medium text-slate-600 dark:text-slate-300">No inventory data yet</p>
            <p className="mt-1">Upload rows with stock and reorder levels to see SKU health.</p>
          </div>
        )}
      </div>
    </Card>
  );
};
