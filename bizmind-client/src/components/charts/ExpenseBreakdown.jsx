import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '../common/Card.jsx';

export const ExpenseBreakdown = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { name: 'Marketing & Ads', value: 24000, color: '#3b82f6' },
    { name: 'Payroll & Salaries', value: 22000, color: '#10b981' },
    { name: 'Cloud Infrastructure', value: 10500, color: '#f59e0b' },
    { name: 'Office & Logistics', value: 5800, color: '#ef4444' }
  ];

  return (
    <Card title="Operating Expense Allocation" subtitle="Monthly cost distribution by category">
      <div className="h-64 w-full mt-4">
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
              formatter={(val) => [`$${val.toLocaleString()}`, 'Expense']}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
