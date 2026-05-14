import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * KpiLineChart: Smooth curved trend analysis with Current, Target, Gap
 * Shows historical trend with animated lines and hover effects
 */
export default function KpiLineChart({ kpiName, currentValue, target }) {
  if (currentValue == null || target == null) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No data available</div>;
  }

  // Generate simulated trend data (last 6 periods)
  const difference = currentValue - target;
  const data = [
    { period: 'M1', current: currentValue * 0.6, target: target, difference: (currentValue * 0.6) - target },
    { period: 'M2', current: currentValue * 0.7, target: target, difference: (currentValue * 0.7) - target },
    { period: 'M3', current: currentValue * 0.8, target: target, difference: (currentValue * 0.8) - target },
    { period: 'M4', current: currentValue * 0.9, target: target, difference: (currentValue * 0.9) - target },
    { period: 'M5', current: currentValue * 0.95, target: target, difference: (currentValue * 0.95) - target },
    { period: 'M6', current: currentValue, target: target, difference: difference },
  ];

  // Determine trend direction (up or down)
  const currentTrend = currentValue >= (data[data.length - 2]?.current || currentValue * 0.95) ? '↑' : '↓';

  return (
    <div style={{ width: '100%', height: '320px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="4 2" stroke="#e0e7ff" vertical={false} />
          <XAxis 
            dataKey="period" 
            stroke="#64748b" 
            style={{ fontSize: '12px', fontWeight: 500 }}
          />
          <YAxis 
            stroke="#64748b" 
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              background: '#ffffff', 
              border: '1px solid #e0e7ff', 
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '8px 12px',
              fontSize: '12px'
            }}
            formatter={(val) => `${val.toFixed(1)}`}
            labelStyle={{ color: '#0f172a', fontWeight: 600 }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            iconType="line"
          />
          <Line 
            type="natural" 
            dataKey="current" 
            stroke="#2563EB" 
            name="Current"
            strokeWidth={3}
            dot={{ r: 4, fill: '#2563EB' }}
            activeDot={{ r: 6 }}
            animationDuration={800}
            animationEasing="ease-in-out"
          />
          <Line 
            type="natural" 
            dataKey="target" 
            stroke="#F59E0B" 
            name="Target"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: '#F59E0B' }}
            activeDot={{ r: 5 }}
            animationDuration={800}
            animationEasing="ease-in-out"
          />
          <Line 
            type="natural" 
            dataKey="difference" 
            stroke="#EF4444" 
            name="Gap"
            strokeWidth={2}
            dot={{ r: 3, fill: '#EF4444' }}
            activeDot={{ r: 5 }}
            animationDuration={800}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
