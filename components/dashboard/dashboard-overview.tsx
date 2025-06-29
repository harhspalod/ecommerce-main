'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Overview } from '@/components/dashboard/overview';
import { RecentSales } from '@/components/dashboard/recent-sales';
import { ActiveCampaigns } from '@/components/dashboard/active-campaigns';
import { Package, Users, Megaphone, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';

const stats = [
  {
    title: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1% from last month',
    icon: DollarSign,
    color: 'text-green-600',
  },
  {
    title: 'Total Orders',
    value: '2,350',
    change: '+180 from last month',
    icon: ShoppingCart,
    color: 'text-blue-600',
  },
  {
    title: 'Total Customers',
    value: '1,253',
    change: '+19% from last month',
    icon: Users,
    color: 'text-purple-600',
  },
  {
    title: 'Active Campaigns',
    value: '12',
    change: '+2 new campaigns',
    icon: Megaphone,
    color: 'text-orange-600',
  },
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Monitor your e-commerce business performance and campaign effectiveness.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue and growth trends</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest customer purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Marketing Campaigns</CardTitle>
          <CardDescription>Current campaigns and their performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ActiveCampaigns />
        </CardContent>
      </Card>
    </div>
  );
}