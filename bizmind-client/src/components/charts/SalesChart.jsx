import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card } from '../common/Card.jsx';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#0ea5e9', '#a855f7'];

const tooltipFormatter = (value, name) => {
  if (name === 'revenue') return [`$${Number(value).toLocaleString()}`, 'Revenue'];
  if (name === 'units') return [Number(value).toLocaleString(), 'Units sold'];
  return [Number(value).toLocaleString(), name];
};

export const SalesChart = ({ data = [], insight }) => {
  const hasData = Array.isArray(data) && data.length > 0;
  const sorted = hasData
    ? [...data].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
    : [];
  const total = sorted.reduce((s, c) => s + (c.revenue || 0), 0);
  const top = sorted[0] || null;

  return (
    <Card
      title="Sales by Category"
      subtitle="Revenue contribution across product categories (sorted high to low)"
    >
      <div className="h-64 w-full mt-2 flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sorted}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={110}
                tick={{ fontSize: 11, fill: '#475569' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={tooltipFormatter}
              />
              <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                {sorted.map((entry, idx) => (
                  <Cell key={entry.category} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 px-6">
            <p className="font-medium text-slate-600 dark:text-slate-300">No sales data yet</p>
            <p className="mt-1">Upload a CSV/XLSX with category-annotated sales rows to see this breakdown.</p>
          </div>
        )}
      </div>

      {/* Footer summary */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        {hasData ? (
          <>
            <span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {sorted.length}
              </span>{' '}
              {sorted.length === 1 ? 'category' : 'categories'} •{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                ${total.toLocaleString()}
              </span>{' '}
              total
            </span>
            {top && (
              <span>
                Top: <span className="font-semibold text-slate-700 dark:text-slate-200">{top.category}</span>{' '}
                ({top.percentage || 0}%)
              </span>
            )}
          </>
        ) : (
          <span>No categories to summarize.</span>
        )}
      </div>
      {insight && (
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 border-l-2 border-emerald-400 pl-2">
          {insight}
        </p>
      )}
    </Card>
  );
};
