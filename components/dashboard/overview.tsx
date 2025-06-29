'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
  { name: 'Jan', total: 1200 },
  { name: 'Feb', total: 1900 },
  { name: 'Mar', total: 2500 },
  { name: 'Apr', total: 2100 },
  { name: 'May', total: 3200 },
  { name: 'Jun', total: 2800 },
  { name: 'Jul', total: 3500 },
  { name: 'Aug', total: 4200 },
  { name: 'Sep', total: 3800 },
  { name: 'Oct', total: 4500 },
  { name: 'Nov', total: 5100 },
  { name: 'Dec', total: 4800 },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
        <Tooltip
          formatter={(value: any) => [`$${value}`, 'Revenue']}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}