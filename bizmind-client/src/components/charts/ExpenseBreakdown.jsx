import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '../common/Card.jsx';

const PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export const ExpenseBreakdown = ({ data = [] }) => {
  const hasData = Array.isArray(data) && data.length > 0;
  const chartData = hasData
    ? data.map((d, idx) => ({ ...d, color: d.color || PALETTE[idx % PALETTE.length] }))
    : [];

  return (
    <Card title="Operating Expense Allocation" subtitle="Monthly cost distribution by category">
      <div className="h-64 w-full mt-4 flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Expense']}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 px-6">
            <p className="font-medium text-slate-600 dark:text-slate-300">No expense data yet</p>
            <p className="mt-1">Upload a CSV/XLSX with expense rows to see this breakdown.</p>
          </div>
        )}
      </div>
    </Card>
  );
};
