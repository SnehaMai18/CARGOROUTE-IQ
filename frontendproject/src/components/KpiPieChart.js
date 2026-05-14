import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

/**
 * KpiPieChart: Modern donut chart showing Current, Target, and Difference
 * Center displays current percentage
 */
export default function KpiPieChart({ kpiName, currentValue, target }) {
  if (currentValue == null || target == null) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No data available</div>;
  }

  const difference = Math.abs(currentValue - target);
  
  const data = [
    { name: 'Current', value: currentValue, fill: '#2563EB' },  // Blue
    { name: 'Target', value: target, fill: '#F59E0B' },         // Amber
    { name: 'Gap', value: difference, fill: '#EF4444' }  // Red
  ].filter(d => d.value > 0);

  // Display current value (already a percentage) in center
  const currentPercent = typeof currentValue === 'number' ? Math.round(currentValue) : currentValue;

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    // Only show labels for significant slices
    if (percent < 0.08) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ fontSize: '11px', fontWeight: '600' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div style={{ width: '100%', height: '320px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            innerRadius={50}
            outerRadius={85}
            fill="#2563EB"
            dataKey="value"
            animationDuration={800}
            animationEasing="ease-in-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(val) => `${val.toFixed(1)}`}
            contentStyle={{ 
              background: '#ffffff', 
              border: '1px solid #e0e7ff', 
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '8px 12px',
              fontSize: '12px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={30}
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
          {currentPercent}%
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
          Current
        </div>
      </div>
    </div>
  );
}
