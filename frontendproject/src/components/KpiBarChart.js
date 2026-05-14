import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

/**
 * KpiBarChart: Display Current vs Target values
 * Modern premium bar chart with smooth animations
 */
export default function KpiBarChart({ kpiName, currentValue, target }) {
  if (currentValue == null || target == null) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No data available</div>;
  }

  const data = [
    {
      name: kpiName,
      'Current': currentValue,
      'Target': target,
    }
  ];

  // Determine if current meets target
  const metTarget = currentValue >= target;
  const currentBarColor = metTarget ? '#10B981' : '#2563EB';

  return (
    <div style={{ width: '100%', height: '320px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="4 2" stroke="#e0e7ff" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px', fontWeight: 500 }} />
          <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
          <Tooltip
  contentStyle={{ 
    background: '#ffffff', 
    border: '1px solid #e0e7ff', 
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    padding: '8px 12px',
    fontSize: '12px'
  }}
  formatter={(value, name) => [`${value.toFixed(1)}`, name]}
  labelStyle={{ color: '#0f172a', fontWeight: 600 }}
/>
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            iconType="circle"
          />
          <Bar 
            dataKey="Current" 
            fill={currentBarColor} 
            radius={[10, 10, 0, 0]}
            animationDuration={800}
            animationEasing="ease-in-out"
          />
          <Bar 
            dataKey="Target" 
            fill="#F59E0B" 
            radius={[10, 10, 0, 0]}
            animationDuration={800}
            animationEasing="ease-in-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}