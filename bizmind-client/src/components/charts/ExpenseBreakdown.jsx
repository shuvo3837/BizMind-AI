import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '../common/Card.jsx';

const PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const RADIAN = Math.PI / 180;
const renderInsideLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (!percent || percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

export const ExpenseBreakdown = ({ data = [], insight }) => {
  const hasData = Array.isArray(data) && data.length > 0;
  const chartData = hasData
    ? data.map((d, idx) => ({
        name: d.category || 'Other',
        value: d.amount || 0,
        color: PALETTE[idx % PALETTE.length],
        percentage: d.percentage || 0,
      }))
    : [];

  const total = chartData.reduce((s, c) => s + (c.value || 0), 0);

  return (
    <Card title="Expense Allocation" subtitle="Operating expenses by category">
      <div className="h-64 w-full mt-2 flex items-center justify-center relative">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                label={renderInsideLabel}
                labelLine={false}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val, _name, props) => {
                  const p = props?.payload;
                  return [
                    `$${Number(val).toLocaleString()} (${p?.percentage || 0}%)`,
                    p?.name || 'Expense',
                  ];
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 px-6">
            <p className="font-medium text-slate-600 dark:text-slate-300">No operating expense data available</p>
            <p className="mt-1">
              Upload a CSV/XLSX with expense rows (rent, payroll, utilities, etc.) to see how your costs are distributed.
            </p>
          </div>
        )}

        {hasData && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Total</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                ${total.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {hasData && (
        <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {chartData.length}
          </span>{' '}
          {chartData.length === 1 ? 'category' : 'categories'} tracked
        </div>
      )}
      {insight && (
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 border-l-2 border-amber-400 pl-2">
          {insight}
        </p>
      )}
    </Card>
  );
};
