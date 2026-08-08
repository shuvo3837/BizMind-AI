import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiPieChart } from 'react-icons/fi';
import { Card } from '../common/Card.jsx';

export const ExpenseBreakdown = ({ data = [], isDataUploaded = false }) => {
  const hasData = Array.isArray(data) && data.length > 0 && data.some(item => (item.cost || item.value) > 0);

  return (
    <Card title="Operating Expense Allocation" subtitle="Cost distribution by category">
      {hasData ? (
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="cost"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || entry.fill || '#3b82f6'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Expense/Cost']}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 w-full mt-4 flex flex-col items-center justify-center bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center">
          <FiPieChart className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            No expense data available.
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-1">
            Expense information was not found in the available business data.
          </p>
        </div>
      )}
    </Card>
  );
};
