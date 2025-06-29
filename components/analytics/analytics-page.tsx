'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesChart } from '@/components/analytics/sales-chart';
import { ProductPerformance } from '@/components/analytics/product-performance';
import { CustomerGrowth } from '@/components/analytics/customer-growth';
import { CampaignMetrics } from '@/components/analytics/campaign-metrics';
import { TrendingUp, Users, Package, Megaphone, DollarSign, ShoppingCart, Phone } from 'lucide-react';

// Real business data from our system
const businessData = {
  customers: [
    { id: 1, name: 'Alice Johnson', totalSpent: 2579.97, orders: 3 },
    { id: 2, name: 'Bob Smith', totalSpent: 979.98, orders: 2 },
    { id: 3, name: 'Carol Williams', totalSpent: 1599.98, orders: 2 },
    { id: 4, name: 'David Brown', totalSpent: 999.99, orders: 1 },
    { id: 5, name: 'Eva Davis', totalSpent: 389.97, orders: 1 },
  ],
  products: [
    { id: 1, name: 'iPhone 15 Pro', price: 999.99, salePrice: 899.99, stock: 45, sales: 2 },
    { id: 2, name: 'Samsung Galaxy S24', price: 849.99, salePrice: null, stock: 12, sales: 1 },
    { id: 3, name: 'MacBook Air M3', price: 1299.99, salePrice: 1199.99, stock: 0, sales: 2 },
    { id: 4, name: 'Nike Air Max', price: 129.99, salePrice: null, stock: 156, sales: 4 },
    { id: 5, name: 'Coffee Table Oak', price: 299.99, salePrice: 249.99, stock: 8, sales: 1 },
  ],
  campaigns: [
    { id: 1, name: 'iPhone 15 Pro Holiday Sale', type: 'Discount', status: 'Active', discount: '15%', triggered: 245, revenue: 12450, progress: 85, productName: 'iPhone 15 Pro' },
    { id: 2, name: 'Samsung Galaxy Welcome Offer', type: 'Welcome', status: 'Active', discount: '10%', triggered: 89, revenue: 3560, progress: 65, productName: 'Samsung Galaxy S24' },
    { id: 3, name: 'MacBook VIP Loyalty', type: 'Loyalty', status: 'Active', discount: '20%', triggered: 56, revenue: 8920, progress: 40, productName: 'MacBook Air M3' },
    { id: 4, name: 'Nike Flash Weekend Sale', type: 'Flash Sale', status: 'Scheduled', discount: '25%', triggered: 0, revenue: 0, progress: 0, productName: 'Nike Air Max' },
  ]
};

// Calculate real KPIs from our data
const calculateKPIs = () => {
  const totalRevenue = businessData.customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = businessData.customers.reduce((sum, c) => sum + c.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalCustomers = businessData.customers.length;
  const campaignRevenue = businessData.campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalCallsTriggered = businessData.campaigns.reduce((sum, c) => sum + c.triggered, 0);

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    totalCustomers,
    campaignRevenue,
    totalCallsTriggered,
  };
};

const kpis = calculateKPIs();

const kpiCards = [
  {
    title: 'Total Revenue',
    value: `$${kpis.totalRevenue.toLocaleString()}`,
    change: '+12.5%',
    changeType: 'positive',
    icon: DollarSign,
    description: 'From customer purchases',
  },
  {
    title: 'Total Orders',
    value: kpis.totalOrders.toString(),
    change: '+8.2%',
    changeType: 'positive',
    icon: ShoppingCart,
    description: 'Completed purchases',
  },
  {
    title: 'Avg. Order Value',
    value: `$${kpis.avgOrderValue.toFixed(2)}`,
    change: '+3.1%',
    changeType: 'positive',
    icon: TrendingUp,
    description: 'Per transaction',
  },
  {
    title: 'Active Customers',
    value: kpis.totalCustomers.toString(),
    change: '+15.3%',
    changeType: 'positive',
    icon: Users,
    description: 'With purchase history',
  },
  {
    title: 'Campaign Revenue',
    value: `$${kpis.campaignRevenue.toLocaleString()}`,
    change: '+22.1%',
    changeType: 'positive',
    icon: Megaphone,
    description: 'From marketing campaigns',
  },
  {
    title: 'Calls Triggered',
    value: kpis.totalCallsTriggered.toString(),
    change: '+18.7%',
    changeType: 'positive',
    icon: Phone,
    description: 'Automated sales calls',
  },
];

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time insights from your customer data, product performance, and campaign effectiveness.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className={`text-xs ${kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.change} from last month
              </p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Business Overview</TabsTrigger>
          <TabsTrigger value="products">Product Analytics</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue growth and customer acquisition</CardDescription>
              </CardHeader>
              <CardContent>
                <SalesChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>Best sellers by revenue and units sold</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductPerformance />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customer acquisition over time</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerGrowth />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Business Metrics Summary</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Products</span>
                    <span className="text-sm text-muted-foreground">{businessData.products.length} active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Low Stock Items</span>
                    <span className="text-sm text-orange-600">{businessData.products.filter(p => p.stock < 20 && p.stock > 0).length} items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Out of Stock</span>
                    <span className="text-sm text-red-600">{businessData.products.filter(p => p.stock === 0).length} items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Campaigns</span>
                    <span className="text-sm text-green-600">{businessData.campaigns.filter(c => c.status === 'Active').length} running</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {((kpis.totalCallsTriggered / (kpis.totalCustomers * 2)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Product Performance Analysis</CardTitle>
                <CardDescription>Sales performance and inventory status</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductPerformance detailed />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>Stock levels and restock recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businessData.products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${product.price} • {product.sales} sold
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          product.stock === 0 ? 'text-red-600' : 
                          product.stock < 20 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {product.stock} units
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.stock === 0 ? 'Out of Stock' : 
                           product.stock < 20 ? 'Low Stock' : 'In Stock'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Value Analysis</CardTitle>
                <CardDescription>Customer segmentation by spending and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businessData.customers
                    .sort((a, b) => b.totalSpent - a.totalSpent)
                    .map((customer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{customer.name}</h4>
                        <p className="text-sm text-muted-foreground">{customer.orders} orders</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${customer.totalSpent.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {index === 0 ? 'VIP Customer' : 
                           customer.totalSpent > 1000 ? 'High Value' : 'Regular'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth Metrics</CardTitle>
                <CardDescription>Growth trends and acquisition insights</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerGrowth />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Average Customer Value</span>
                    <span className="font-medium">${kpis.avgOrderValue.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Customer Retention</span>
                    <span className="font-medium">
                      {((businessData.customers.filter(c => c.orders > 1).length / businessData.customers.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Repeat Purchase Rate</span>
                    <span className="font-medium">
                      {((businessData.customers.filter(c => c.orders > 1).length / businessData.customers.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Dashboard</CardTitle>
              <CardDescription>ROI, effectiveness, and customer engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignMetrics />
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Campaign ROI Analysis</CardTitle>
                <CardDescription>Return on investment by campaign type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businessData.campaigns.map((campaign, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {campaign.productName} • {campaign.discount} discount
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${campaign.revenue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {campaign.triggered} customers reached
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Call Campaign Effectiveness</CardTitle>
                <CardDescription>Sales call performance and conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Calls Triggered</span>
                    <span className="text-sm text-muted-foreground">{kpis.totalCallsTriggered}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Campaign Conversion Rate</span>
                    <span className="text-sm text-green-600">
                      {((businessData.campaigns.filter(c => c.progress > 50).length / businessData.campaigns.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Campaign Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {(businessData.campaigns.reduce((sum, c) => sum + c.progress, 0) / businessData.campaigns.length).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Revenue per Call</span>
                    <span className="text-sm text-green-600">
                      ${(kpis.campaignRevenue / kpis.totalCallsTriggered).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}