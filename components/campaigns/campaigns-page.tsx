'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignsTable } from '@/components/campaigns/campaigns-table';
import { CreateCampaignDialog } from '@/components/campaigns/create-campaign-dialog';
import { PriceDropAlert } from '@/components/campaigns/price-drop-alert';
import { ProductCustomerLookup } from '@/components/campaigns/product-customer-lookup';
import { CampaignProductConnection } from '@/components/campaigns/campaign-product-connection';
import { CallPrioritySettings, CallPrioritySettings as CallPrioritySettingsType } from '@/components/campaigns/call-priority-settings';
import { Plus, Megaphone, TrendingUp, Users, DollarSign, Phone, Settings } from 'lucide-react';
import { db } from '@/lib/database';
import { toast } from 'sonner';

export interface Campaign {
  id: string;
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
  productId?: string;
  productName?: string;
}

export function CampaignsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [callsTriggered, setCallsTriggered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [callSettings, setCallSettings] = useState<CallPrioritySettingsType>({
    priority: 'medium',
    callTimePreference: '2:00 PM - 4:00 PM',
    timezone: 'EST',
    maxCallsPerDay: 50,
    enableWeekendCalls: false,
    customerValueThreshold: 500,
    urgencyLevel: 5,
    autoSchedule: true,
  });

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const [campaignsData, callTriggersData] = await Promise.all([
        db.campaigns.getAll(),
        db.callTriggers.getAll()
      ]);

      // Transform campaigns data
      const enrichedCampaigns: Campaign[] = campaignsData.map(campaign => {
        const campaignCalls = callTriggersData.filter(call => call.campaign_id === campaign.id);
        const triggered = campaignCalls.length;
        const revenue = triggered * 50; // Mock revenue calculation
        const progress = Math.min((triggered / 10) * 100, 100); // Mock progress calculation

        return {
          id: campaign.id,
          name: campaign.name,
          type: campaign.type,
          status: campaign.status,
          condition: campaign.condition,
          discount: campaign.discount,
          triggered,
          revenue: `$${revenue.toLocaleString()}`,
          startDate: campaign.start_date,
          endDate: campaign.end_date,
          progress,
          description: campaign.description || undefined,
          productId: campaign.product_id || undefined,
          productName: campaign.product?.name || undefined,
        };
      });

      setCampaigns(enrichedCampaigns);
      setCallsTriggered(callTriggersData.length);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const addCampaign = async (campaignData: Omit<Campaign, 'id' | 'triggered' | 'revenue' | 'progress'>) => {
    try {
      await db.campaigns.create({
        name: campaignData.name,
        type: campaignData.type,
        status: campaignData.status,
        condition: campaignData.condition,
        discount: campaignData.discount,
        product_id: campaignData.productId || null,
        start_date: campaignData.startDate,
        end_date: campaignData.endDate,
        description: campaignData.description || null,
      });

      toast.success(`${campaignData.name} has been created successfully!`);
      loadCampaigns(); // Reload to get updated data
    } catch (error) {
      console.error('Error adding campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const updateCampaign = async (id: string, campaignData: Partial<Campaign>) => {
    try {
      await db.campaigns.update(id, {
        name: campaignData.name,
        type: campaignData.type,
        status: campaignData.status,
        condition: campaignData.condition,
        discount: campaignData.discount,
        product_id: campaignData.productId,
        start_date: campaignData.startDate,
        end_date: campaignData.endDate,
        description: campaignData.description,
      });

      toast.success('Campaign updated successfully!');
      loadCampaigns(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign');
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      await db.campaigns.delete(id);
      toast.success('Campaign deleted successfully!');
      loadCampaigns(); // Reload to get updated data
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const handlePriceDropAlert = (data: any) => {
    setCallsTriggered(prev => prev + data.callsTriggered.length);
    loadCampaigns(); // Reload to get updated data
  };

  const handleCampaignTriggered = (campaignId: string, callsCount: number) => {
    setCallsTriggered(prev => prev + callsCount);
    loadCampaigns(); // Reload to get updated data
  };

  const handleSettingsChange = (newSettings: CallPrioritySettingsType) => {
    setCallSettings(newSettings);
    toast.success('Call settings updated successfully!');
    
    // Log settings for external system integration
    console.log('📞 CALL SETTINGS UPDATED:');
    console.log('Priority:', newSettings.priority);
    console.log('Call Time:', newSettings.callTimePreference);
    console.log('Timezone:', newSettings.timezone);
    console.log('Max Daily Calls:', newSettings.maxCallsPerDay);
    console.log('Weekend Calls:', newSettings.enableWeekendCalls);
    console.log('Customer Value Threshold:', newSettings.customerValueThreshold);
    console.log('Urgency Level:', newSettings.urgencyLevel);
    console.log('Auto Schedule:', newSettings.autoSchedule);
  };

  const stats = {
    active: campaigns.filter(c => c.status === 'Active').length,
    totalRevenue: campaigns.reduce((sum, c) => sum + parseFloat(c.revenue.replace('$', '').replace(',', '')), 0),
    totalReached: campaigns.reduce((sum, c) => sum + c.triggered, 0),
    avgConversion: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.progress, 0) / campaigns.length : 0,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketing Campaigns</h1>
            <p className="text-muted-foreground">Loading campaign data...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Campaigns</h1>
          <p className="text-muted-foreground">
            Create product-connected campaigns and instantly trigger calls to eligible customers with priority settings.
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
          <TabsTrigger value="call-settings">Call Settings</TabsTrigger>
          <TabsTrigger value="price-alerts">Price Drop Alerts</TabsTrigger>
          <TabsTrigger value="product-lookup">Product-Customer Lookup</TabsTrigger>
        </TabsList>

        <TabsContent value="campaign-triggers" className="space-y-4">
          <CampaignProductConnection 
            campaigns={campaigns}
            onCampaignTriggered={handleCampaignTriggered}
            callSettings={callSettings}
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

        <TabsContent value="call-settings" className="space-y-4">
          <CallPrioritySettings 
            onSettingsChange={handleSettingsChange}
            currentSettings={callSettings}
          />
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