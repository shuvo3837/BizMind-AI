import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../common/Card.jsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const directionIcon = (dir) => {
  if (dir === 'increasing') return <TrendingUp size={14} className="text-emerald-500" />;
  if (dir === 'decreasing') return <TrendingDown size={14} className="text-rose-500" />;
  return <Minus size={14} className="text-slate-400" />;
};

const directionLabel = (dir) => {
  if (dir === 'increasing') return 'Trending up';
  if (dir === 'decreasing') return 'Trending down';
  return 'Stable';
};

export const RevenueTrend = ({ data = [], granularity = 'daily', trendStats, insight }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card
      title="Revenue Trend"
      subtitle={`Actual revenue over time — ${granularity === 'monthly' ? 'monthly' : 'daily'} buckets from your data`}
    >
      <div className="h-64 w-full mt-2 flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#cbd5e1', fontSize: '11px' }}
                formatter={(val, name) => {
                  if (name === 'Revenue') return [`$${Number(val).toLocaleString()}`, 'Revenue'];
                  if (name === 'Profit') return [`$${Number(val).toLocaleString()}`, 'Profit'];
                  return [Number(val).toLocaleString(), name];
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 px-6">
            <p className="font-medium text-slate-600 dark:text-slate-300">No revenue trend yet</p>
            <p className="mt-1">Upload date-stamped sales rows to see revenue evolve over time.</p>
          </div>
        )}
      </div>

      {hasData && trendStats && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 px-3 py-2">
            <p className="text-slate-400 uppercase tracking-wider text-[10px]">Total</p>
            <p className="font-semibold text-slate-700 dark:text-slate-100 mt-0.5">
              ${Number(trendStats.total || 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 px-3 py-2">
            <p className="text-slate-400 uppercase tracking-wider text-[10px]">Average / period</p>
            <p className="font-semibold text-slate-700 dark:text-slate-100 mt-0.5">
              ${Number(trendStats.average || 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 px-3 py-2">
            <p className="text-slate-400 uppercase tracking-wider text-[10px]">Highest</p>
            <p className="font-semibold text-slate-700 dark:text-slate-100 mt-0.5 truncate">
              {trendStats.highest?.period || '—'}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
              ${Number(trendStats.highest?.revenue || 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 px-3 py-2">
            <p className="text-slate-400 uppercase tracking-wider text-[10px]">Direction</p>
            <p className="font-semibold text-slate-700 dark:text-slate-100 mt-0.5 flex items-center gap-1">
              {directionIcon(trendStats.direction)}
              {directionLabel(trendStats.direction)}
            </p>
            <p className="text-[10px] text-slate-500">
              {trendStats.changePct == null
                ? 'No previous period available'
                : `${trendStats.changePct > 0 ? '+' : ''}${trendStats.changePct}% vs first period`}
            </p>
          </div>
        </div>
      )}

      {insight && (
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 border-l-2 border-emerald-400 pl-2">
          {insight}
        </p>
      )}
    </Card>
  );
};
