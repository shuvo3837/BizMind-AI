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
import { AlertTriangle } from 'lucide-react';

export const InventoryBarChart = ({ data = [], insight }) => {
  const hasData = Array.isArray(data) && data.length > 0;
  const sorted = hasData
    ? [...data].sort((a, b) => (b.stock || 0) - (a.stock || 0))
    : [];
  const belowCount = sorted.filter((i) => i.belowReorder).length;
  const totalValue = sorted.reduce((s, i) => s + (i.inventoryValue || 0), 0);

  return (
    <Card
      title="Inventory vs Reorder Level"
      subtitle="Current stock compared to your reorder threshold (latest record per product)"
    >
      <div className="h-64 w-full mt-2 flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sorted}
              margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="productName"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                angle={-25}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val, name, props) => {
                  const row = props?.payload;
                  if (name === 'Stock') {
                    return [`${Number(val).toLocaleString()} units`, 'Current Stock'];
                  }
                  if (name === 'Reorder Level') {
                    return [`${val != null ? Number(val).toLocaleString() : '—'}`, 'Reorder Level'];
                  }
                  return [val, name];
                }}
              />
              <Bar dataKey="stock" name="Stock" fill="#6366f1" radius={[6, 6, 0, 0]}>
                {sorted.map((entry, idx) => (
                  <Cell
                    key={`stock-${idx}`}
                    fill={entry.belowReorder ? '#f43f5e' : '#6366f1'}
                  />
                ))}
              </Bar>
              <Bar dataKey="reorderLevel" name="Reorder Level" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 px-6">
            <p className="font-medium text-slate-600 dark:text-slate-300">No inventory data yet</p>
            <p className="mt-1">Upload inventory rows including stock and reorder level to see SKU health.</p>
          </div>
        )}
      </div>

      {hasData && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 px-3 py-2">
            <p className="text-slate-400 uppercase tracking-wider text-[10px]">Products</p>
            <p className="font-semibold text-slate-700 dark:text-slate-100 mt-0.5">{sorted.length}</p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 px-3 py-2">
            <p className="text-slate-400 uppercase tracking-wider text-[10px]">Inventory Value</p>
            <p className="font-semibold text-slate-700 dark:text-slate-100 mt-0.5">${totalValue.toLocaleString()}</p>
          </div>
          <div className={`rounded-lg px-3 py-2 ${belowCount > 0 ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30'}`}>
            <p className={`uppercase tracking-wider text-[10px] ${belowCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              Below Reorder
            </p>
            <p className={`font-semibold mt-0.5 ${belowCount > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
              {belowCount}
            </p>
          </div>
        </div>
      )}

      {hasData && belowCount > 0 && (
        <div className="mt-3 border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <AlertTriangle size={14} />
            Low Stock Alert
          </div>
          <ul className="mt-2 space-y-1">
            {sorted
              .filter((i) => i.belowReorder)
              .slice(0, 5)
              .map((i) => (
                <li key={i.productName} className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300">
                  <span className="font-medium">{i.productName}</span>
                  <span>
                    <span className="text-rose-600 font-semibold">{i.stock}</span>
                    <span className="text-slate-400"> / reorder at {i.reorderLevel}</span>
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {insight && (
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 border-l-2 border-rose-400 pl-2">
          {insight}
        </p>
      )}
    </Card>
  );
};
