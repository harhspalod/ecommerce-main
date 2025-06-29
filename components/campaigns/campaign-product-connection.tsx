'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Users, Phone, DollarSign, Package, Zap, AlertCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Campaign } from './campaigns-page';
import { CallPrioritySettings as CallPrioritySettingsType } from './call-priority-settings';
import { db } from '@/lib/database';

interface CampaignProductConnectionProps {
  campaigns: Campaign[];
  onCampaignTriggered: (campaignId: string, callsCount: number) => void;
  callSettings?: CallPrioritySettingsType;
}

interface EligibleCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  purchaseDate: string;
  amount: number;
  quantity: number;
  customerValue: number;
}

export function CampaignProductConnection({ campaigns, onCampaignTriggered, callSettings }: CampaignProductConnectionProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [eligibleCustomers, setEligibleCustomers] = useState<EligibleCustomer[]>([]);
  const [isTriggering, setIsTriggering] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  // Load eligible customers when campaign is selected
  useEffect(() => {
    const loadEligibleCustomers = async () => {
      if (!selectedCampaign?.productId) {
        setEligibleCustomers([]);
        return;
      }

      setLoading(true);
      try {
        const [productPurchases, allPurchases] = await Promise.all([
          db.purchases.getByProduct(selectedCampaign.productId),
          db.purchases.getAll()
        ]);
        
        // Transform purchases to eligible customers format with customer value calculation
        const customers: EligibleCustomer[] = productPurchases.map(purchase => {
          // Calculate total customer value from all purchases
          const customerAllPurchases = allPurchases.filter(p => p.customer_id === purchase.customer_id);
          const customerValue = customerAllPurchases.reduce((sum, p) => sum + (p.price_paid * p.quantity), 0);

          return {
            id: purchase.customer_id,
            name: purchase.customer?.name || 'Unknown Customer',
            email: purchase.customer?.email || '',
            phone: purchase.customer?.phone || '',
            purchaseDate: purchase.purchase_date,
            amount: purchase.price_paid * purchase.quantity,
            quantity: purchase.quantity,
            customerValue: customerValue,
          };
        });

        // Remove duplicates (same customer multiple purchases) and sort by customer value
        const uniqueCustomers = customers.reduce((acc, current) => {
          const existing = acc.find(c => c.id === current.id);
          if (!existing) {
            acc.push(current);
          } else {
            // Keep the most recent purchase but maintain the total customer value
            if (new Date(current.purchaseDate) > new Date(existing.purchaseDate)) {
              const index = acc.findIndex(c => c.id === current.id);
              acc[index] = { ...current, customerValue: existing.customerValue };
            }
          }
          return acc;
        }, [] as EligibleCustomer[]);

        // Sort by customer value (high-value customers first)
        uniqueCustomers.sort((a, b) => b.customerValue - a.customerValue);

        setEligibleCustomers(uniqueCustomers);
      } catch (error) {
        console.error('Error loading eligible customers:', error);
        toast.error('Failed to load eligible customers');
      } finally {
        setLoading(false);
      }
    };

    loadEligibleCustomers();
  }, [selectedCampaign]);

  const handleTriggerCampaign = async () => {
    if (!selectedCampaign) {
      toast.error('Please select a campaign');
      return;
    }

    if (selectedCustomers.length === 0) {
      toast.error('Please select at least one customer');
      return;
    }

    setIsTriggering(true);

    try {
      const callPromises = selectedCustomers.map(async (customerId) => {
        const customer = eligibleCustomers.find(c => c.id === customerId);
        if (!customer) return null;

        const response = await fetch('/api/campaigns/trigger-call', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            campaignId: selectedCampaign.id,
            customerId: customer.id,
            productId: selectedCampaign.productId,
            triggerType: selectedCampaign.type.toLowerCase().replace(' ', '_'),
            discountPercent: parseInt(selectedCampaign.discount.replace('%', '')),
            callSettings: callSettings,
          }),
        });

        if (response.ok) {
          const callData = await response.json();
          
          // Log the complete call data for integration
          console.log('📞 CALL TRIGGERED WITH PRIORITY SETTINGS:');
          console.log('Customer:', callData.callData.customer_name);
          console.log('Phone:', callData.callData.phone_number);
          console.log('Priority:', callData.callData.priority);
          console.log('Customer Value:', `$${customer.customerValue.toFixed(2)}`);
          console.log('Urgency Level:', `${callData.callData.urgency_level}/10`);
          console.log('Call Time:', callData.callData.best_call_time);
          console.log('Timezone:', callData.callData.customer_timezone);
          console.log('Weekend Calls:', callData.callData.enable_weekend_calls);
          console.log('Auto Schedule:', callData.callData.auto_schedule);
          console.log('Full JSON:', JSON.stringify(callData.callData, null, 2));
          
          return callData;
        }
        return null;
      });

      const results = await Promise.all(callPromises);
      const successfulCalls = results.filter(r => r !== null);

      onCampaignTriggered(selectedCampaign.id, successfulCalls.length);
      
      toast.success(
        <div>
          <div className="font-semibold">Campaign "{selectedCampaign.name}" triggered!</div>
          <div className="text-sm">{successfulCalls.length} calls scheduled with priority settings</div>
          <div className="text-xs text-muted-foreground mt-1">Check console for complete call data with priority information</div>
        </div>
      );
      
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error triggering campaign:', error);
      toast.error('Failed to trigger campaign');
    } finally {
      setIsTriggering(false);
    }
  };

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const selectAllCustomers = () => {
    setSelectedCustomers(eligibleCustomers.map(c => c.id));
  };

  const selectHighValueCustomers = () => {
    const threshold = callSettings?.customerValueThreshold || 500;
    const highValueCustomers = eligibleCustomers.filter(c => c.customerValue >= threshold);
    setSelectedCustomers(highValueCustomers.map(c => c.id));
    toast.success(`Selected ${highValueCustomers.length} high-value customers (≥$${threshold})`);
  };

  const clearSelection = () => {
    setSelectedCustomers([]);
  };

  const getCustomerPriorityBadge = (customer: EligibleCustomer) => {
    const threshold = callSettings?.customerValueThreshold || 500;
    if (customer.customerValue >= threshold) {
      return <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">High Priority</Badge>;
    } else if (customer.customerValue >= threshold * 0.5) {
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">Medium Priority</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Standard Priority</Badge>;
    }
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'Active');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-orange-600" />
            <span>Campaign Trigger Center with Priority Settings</span>
          </CardTitle>
          <CardDescription>
            Select a campaign to see eligible customers with priority levels and trigger calls with complete JSON data for external systems.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {callSettings && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Active Call Settings</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-600">
                <div>Priority: <strong>{callSettings.priority.toUpperCase()}</strong></div>
                <div>Call Time: <strong>{callSettings.callTimePreference}</strong></div>
                <div>Timezone: <strong>{callSettings.timezone}</strong></div>
                <div>Value Threshold: <strong>${callSettings.customerValueThreshold}</strong></div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Active Campaign</label>
            <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a campaign to trigger" />
              </SelectTrigger>
              <SelectContent>
                {activeCampaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    <div className="flex items-center space-x-2">
                      <span>{campaign.name}</span>
                      <Badge variant="outline">{campaign.discount}</Badge>
                      <span className="text-muted-foreground">• {campaign.productName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCampaign && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Megaphone className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Campaign</p>
                    <p className="font-medium">{selectedCampaign.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Product</p>
                    <p className="font-medium">{selectedCampaign.productName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Discount</p>
                    <p className="font-medium text-green-600">{selectedCampaign.discount}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Eligible</p>
                    <p className="font-medium">{eligibleCustomers.length} customers</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCampaign && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Eligible Customers ({eligibleCustomers.length}) - Sorted by Value</span>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={selectHighValueCustomers} disabled={loading}>
                  Select High-Value
                </Button>
                <Button variant="outline" size="sm" onClick={selectAllCustomers} disabled={loading}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Customers who purchased {selectedCampaign.productName} with priority levels based on customer value.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-muted rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : eligibleCustomers.length > 0 ? (
              <div className="grid gap-3">
                {eligibleCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCustomers.includes(customer.id) 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => toggleCustomerSelection(customer.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`/avatars/${customer.id}.png`} />
                          <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-bold text-green-600">${customer.amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(customer.purchaseDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-1">
                          {getCustomerPriorityBadge(customer)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Value: <strong>${customer.customerValue.toFixed(2)}</strong>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Qty: {customer.quantity} • Eligible for {selectedCampaign.discount} off
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No customers have purchased {selectedCampaign.productName} yet</p>
              </div>
            )}

            {selectedCustomers.length > 0 && (
              <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium">{selectedCustomers.length} customers selected</span>
                    <Badge variant="secondary">
                      Campaign: {selectedCampaign.name}
                    </Badge>
                  </div>
                  <Button 
                    onClick={handleTriggerCampaign} 
                    disabled={isTriggering}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isTriggering ? (
                      <>Triggering Calls...</>
                    ) : (
                      <>
                        <Phone className="h-4 w-4 mr-2" />
                        Trigger Campaign Calls
                      </>
                    )}
                  </Button>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Complete Call Data Package with Priority Settings Ready</p>
                      <p>Each call will include: Customer details, priority level, call timing preferences, customer value, urgency settings, and complete purchase history.</p>
                      <p className="text-xs mt-1">JSON data with priority settings will be logged to console for external system integration.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}