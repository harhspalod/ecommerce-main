'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Real sales data based on our customer purchases
const data = [
  { name: 'Jan', revenue: 2579.97, orders: 3, customers: 1 }, // Alice's purchases
  { name: 'Feb', revenue: 979.98, orders: 2, customers: 1 },  // Bob's purchases  
  { name: 'Mar', revenue: 1599.98, orders: 2, customers: 1 }, // Carol's purchases
  { name: 'Apr', revenue: 999.99, orders: 1, customers: 1 },  // David's purchase
  { name: 'May', revenue: 389.97, orders: 1, customers: 1 },  // Eva's purchase
  { name: 'Jun', revenue: 1200, orders: 2, customers: 2 },    // Projected
  { name: 'Jul', revenue: 1800, orders: 3, customers: 2 },    // Projected
  { name: 'Aug', revenue: 2200, orders: 4, customers: 3 },    // Projected
  { name: 'Sep', revenue: 1900, orders: 3, customers: 2 },    // Projected
  { name: 'Oct', revenue: 2500, orders: 4, customers: 3 },    // Projected
  { name: 'Nov', revenue: 2800, orders: 5, customers: 4 },    // Projected
  { name: 'Dec', revenue: 3200, orders: 6, customers: 4 },    // Projected
];

export function SalesChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
          tickFormatter={(value) => `$${value}`} 
        />
        <Tooltip
          formatter={(value: any, name: string) => [
            name === 'revenue' ? `$${value}` : value,
            name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Customers'
          ]}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="orders"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 3 }}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}