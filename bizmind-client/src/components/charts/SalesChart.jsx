import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiBarChart2 } from 'react-icons/fi';
import { Card } from '../common/Card.jsx';

export const SalesChart = ({ data = [], isDataUploaded = false }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card title="Sales Breakdown by Category" subtitle="Revenue distribution across business categories">
      {hasData ? (
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 w-full mt-4 flex flex-col items-center justify-center bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center">
          <FiBarChart2 className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            No business data available.
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-1">
            Upload your business data from the Upload Center to start analysis.
          </p>
        </div>
      )}
    </Card>
  );
};
