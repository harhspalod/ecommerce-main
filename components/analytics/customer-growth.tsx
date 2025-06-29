'use client';

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

// Real customer growth data based on our system
const data = [
  { name: 'Jan', customers: 1, newCustomers: 1, totalSpent: 2579.97 }, // Alice joins
  { name: 'Feb', customers: 2, newCustomers: 1, totalSpent: 979.98 },  // Bob joins
  { name: 'Mar', customers: 3, newCustomers: 1, totalSpent: 1599.98 }, // Carol joins
  { name: 'Apr', customers: 4, newCustomers: 1, totalSpent: 999.99 },  // David joins
  { name: 'May', customers: 5, newCustomers: 1, totalSpent: 389.97 },  // Eva joins
  { name: 'Jun', customers: 6, newCustomers: 1, totalSpent: 800 },     // Projected
  { name: 'Jul', customers: 8, newCustomers: 2, totalSpent: 1200 },    // Projected
  { name: 'Aug', customers: 11, newCustomers: 3, totalSpent: 1500 },   // Projected
  { name: 'Sep', customers: 13, newCustomers: 2, totalSpent: 1100 },   // Projected
  { name: 'Oct', customers: 16, newCustomers: 3, totalSpent: 1800 },   // Projected
  { name: 'Nov', customers: 20, newCustomers: 4, totalSpent: 2200 },   // Projected
  { name: 'Dec', customers: 25, newCustomers: 5, totalSpent: 2800 },   // Projected
];

export function CustomerGrowth() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <XAxis 
          dataKey="name" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <Tooltip
          formatter={(value: any, name: string) => [
            value, 
            name === 'customers' ? 'Total Customers' : 
            name === 'newCustomers' ? 'New Customers' : 'Total Spent'
          ]}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Area
          type="monotone"
          dataKey="customers"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="newCustomers"
          stroke="hsl(var(--chart-2))"
          fill="hsl(var(--chart-2))"
          fillOpacity={0.1}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}