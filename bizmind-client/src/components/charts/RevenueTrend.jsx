import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card.jsx';

export const RevenueTrend = ({ data = [] }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card title="Revenue Trajectory" subtitle="Actual revenue per period from your data">
      <div className="h-64 w-full mt-4 flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 px-6">
            <p className="font-medium text-slate-600 dark:text-slate-300">No revenue trend yet</p>
            <p className="mt-1">Upload date-stamped sales rows to see revenue over time.</p>
          </div>
        )}
      </div>
    </Card>
  );
};
