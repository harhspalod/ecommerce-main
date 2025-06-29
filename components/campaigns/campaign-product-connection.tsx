'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Users, Phone, DollarSign, Package, Zap, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Campaign } from './campaigns-page';
import { db } from '@/lib/database';

interface CampaignProductConnectionProps {
  campaigns: Campaign[];
  onCampaignTriggered: (campaignId: string, callsCount: number) => void;
}

interface EligibleCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  purchaseDate: string;
  amount: number;
  quantity: number;
}

export function CampaignProductConnection({ campaigns, onCampaignTriggered }: CampaignProductConnectionProps) {
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
        const purchases = await db.purchases.getByProduct(selectedCampaign.productId);
        
        // Transform purchases to eligible customers format
        const customers: EligibleCustomer[] = purchases.map(purchase => ({
          id: purchase.customer_id,
          name: purchase.customer?.name || 'Unknown Customer',
          email: purchase.customer?.email || '',
          phone: purchase.customer?.phone || '',
          purchaseDate: purchase.purchase_date,
          amount: purchase.price_paid * purchase.quantity,
          quantity: purchase.quantity,
        }));

        // Remove duplicates (same customer multiple purchases)
        const uniqueCustomers = customers.reduce((acc, current) => {
          const existing = acc.find(c => c.id === current.id);
          if (!existing) {
            acc.push(current);
          } else {
            // Keep the most recent purchase
            if (new Date(current.purchaseDate) > new Date(existing.purchaseDate)) {
              const index = acc.findIndex(c => c.id === current.id);
              acc[index] = current;
            }
          }
          return acc;
        }, [] as EligibleCustomer[]);

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
          }),
        });

        if (response.ok) {
          const callData = await response.json();
          
          // Log the complete call data for integration
          console.log('📞 CALL TRIGGERED - Complete Data Package:');
          console.log('Customer:', callData.callData.customer_name);
          console.log('Phone:', callData.callData.phone_number);
          console.log('Product:', callData.callData.product_name);
          console.log('Campaign:', callData.callData.campaign_name);
          console.log('Reason:', callData.callData.reason);
          console.log('Coupon Code:', callData.callData.coupon_code);
          console.log('Call Script:', callData.callData.call_script);
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
          <div className="text-sm">{successfulCalls.length} calls scheduled with complete data</div>
          <div className="text-xs text-muted-foreground mt-1">Check console for full call data JSON</div>
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

  const clearSelection = () => {
    setSelectedCustomers([]);
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'Active');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-orange-600" />
            <span>Campaign Trigger Center</span>
          </CardTitle>
          <CardDescription>
            Select a campaign to instantly see eligible customers and trigger calls with complete JSON data for external systems.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <span>Eligible Customers ({eligibleCustomers.length})</span>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={selectAllCustomers} disabled={loading}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Customers who purchased {selectedCampaign.productName} and are eligible for this campaign.
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
                      <div className="text-right">
                        <div className="font-bold text-green-600">${customer.amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(customer.purchaseDate).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
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
                      <p className="font-medium">Complete Call Data Package Ready</p>
                      <p>Each call will include: Customer details, product info, campaign data, call script, coupon codes, and purchase history.</p>
                      <p className="text-xs mt-1">JSON data will be logged to console for external system integration.</p>
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