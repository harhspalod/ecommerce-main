'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignsTable } from '@/components/campaigns/campaigns-table';
import { CreateCampaignDialog } from '@/components/campaigns/create-campaign-dialog';
import { PriceDropAlert } from '@/components/campaigns/price-drop-alert';
import { ProductCustomerLookup } from '@/components/campaigns/product-customer-lookup';
import { CampaignProductConnection } from '@/components/campaigns/campaign-product-connection';
import { Plus, Megaphone, TrendingUp, Users, DollarSign, Phone } from 'lucide-react';

export interface Campaign {
  id: number;
  name: string;
  type: string;
  status: string;
  condition: string;
  discount: string;
  triggered: number;
  revenue: string;
  startDate: string;
  endDate: string;
  progress: number;
  description?: string;
  productId?: number; // Connected product
  productName?: string; // Connected product name
}

const initialCampaigns: Campaign[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro Holiday Sale',
    type: 'Discount',
    status: 'Active',
    condition: 'Product: iPhone 15 Pro',
    discount: '15%',
    triggered: 245,
    revenue: '$12,450',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    progress: 85,
    description: 'Holiday season discount campaign for iPhone customers',
    productId: 1,
    productName: 'iPhone 15 Pro',
  },
  {
    id: 2,
    name: 'Samsung Galaxy Welcome Offer',
    type: 'Welcome',
    status: 'Active',
    condition: 'Product: Samsung Galaxy S24',
    discount: '10%',
    triggered: 89,
    revenue: '$3,560',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    progress: 65,
    description: 'Welcome discount for Samsung Galaxy customers',
    productId: 2,
    productName: 'Samsung Galaxy S24',
  },
  {
    id: 3,
    name: 'MacBook VIP Loyalty',
    type: 'Loyalty',
    status: 'Active',
    condition: 'Product: MacBook Air M3',
    discount: '20%',
    triggered: 56,
    revenue: '$8,920',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    progress: 40,
    description: 'Loyalty program for MacBook customers',
    productId: 3,
    productName: 'MacBook Air M3',
  },
  {
    id: 4,
    name: 'Nike Flash Weekend Sale',
    type: 'Flash Sale',
    status: 'Scheduled',
    condition: 'Product: Nike Air Max',
    discount: '25%',
    triggered: 0,
    revenue: '$0',
    startDate: '2024-02-01',
    endDate: '2024-02-03',
    progress: 0,
    description: 'Weekend flash sale for Nike customers',
    productId: 4,
    productName: 'Nike Air Max',
  },
];

export function CampaignsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [callsTriggered, setCallsTriggered] = useState(0);

  const addCampaign = (campaignData: Omit<Campaign, 'id' | 'triggered' | 'revenue' | 'progress'>) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: Math.max(...campaigns.map(c => c.id)) + 1,
      triggered: 0,
      revenue: '$0',
      progress: 0,
    };
    setCampaigns(prev => [...prev, newCampaign]);
  };

  const updateCampaign = (id: number, campaignData: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id ? { ...campaign, ...campaignData } : campaign
    ));
  };

  const deleteCampaign = (id: number) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
  };

  const handlePriceDropAlert = (data: any) => {
    setCallsTriggered(prev => prev + data.callsTriggered.length);
  };

  const handleCampaignTriggered = (campaignId: number, callsCount: number) => {
    setCallsTriggered(prev => prev + callsCount);
    updateCampaign(campaignId, { 
      triggered: campaigns.find(c => c.id === campaignId)?.triggered + callsCount || callsCount 
    });
  };

  const stats = {
    active: campaigns.filter(c => c.status === 'Active').length,
    totalRevenue: campaigns.reduce((sum, c) => sum + parseFloat(c.revenue.replace('$', '').replace(',', '')), 0),
    totalReached: campaigns.reduce((sum, c) => sum + c.triggered, 0),
    avgConversion: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.progress, 0) / campaigns.length : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Campaigns</h1>
          <p className="text-muted-foreground">
            Create product-connected campaigns and instantly trigger calls to eligible customers.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">{campaigns.filter(c => c.status === 'Scheduled').length} scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total generated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers Reached</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReached.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Campaign triggers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgConversion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Campaign performance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Triggered</CardTitle>
            <Phone className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callsTriggered}</div>
            <p className="text-xs text-muted-foreground">Sales calls scheduled</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaign-triggers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaign-triggers">Campaign Triggers</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Management</TabsTrigger>
          <TabsTrigger value="price-alerts">Price Drop Alerts</TabsTrigger>
          <TabsTrigger value="product-lookup">Product-Customer Lookup</TabsTrigger>
        </TabsList>

        <TabsContent value="campaign-triggers" className="space-y-4">
          <CampaignProductConnection 
            campaigns={campaigns}
            onCampaignTriggered={handleCampaignTriggered}
          />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Management</CardTitle>
              <CardDescription>
                Monitor and control your marketing campaigns with automated discount triggers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignsTable 
                campaigns={campaigns}
                onUpdateCampaign={updateCampaign}
                onDeleteCampaign={deleteCampaign}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="price-alerts" className="space-y-4">
          <PriceDropAlert onAlertTriggered={handlePriceDropAlert} />
        </TabsContent>

        <TabsContent value="product-lookup" className="space-y-4">
          <ProductCustomerLookup />
        </TabsContent>
      </Tabs>

      <CreateCampaignDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onCreateCampaign={addCampaign}
      />
    </div>
  );
}