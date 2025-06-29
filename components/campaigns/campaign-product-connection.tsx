'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Users, Phone, DollarSign, Package, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Campaign } from './campaigns-page';

interface CampaignProductConnectionProps {
  campaigns: Campaign[];
  onCampaignTriggered: (campaignId: number, callsCount: number) => void;
}

// Mock customer data with product connections
const mockCustomerProductData = [
  {
    productId: 1,
    productName: 'iPhone 15 Pro',
    customers: [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-123-4567', purchaseDate: '2024-01-10', amount: 999.99 },
      { id: 4, name: 'David Brown', email: 'david@example.com', phone: '+1-555-321-9876', purchaseDate: '2024-01-20', amount: 999.99 },
    ]
  },
  {
    productId: 2,
    productName: 'Samsung Galaxy S24',
    customers: [
      { id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '+1-555-987-6543', purchaseDate: '2024-01-08', amount: 849.99 },
    ]
  },
  {
    productId: 3,
    productName: 'MacBook Air M3',
    customers: [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-123-4567', purchaseDate: '2024-01-15', amount: 1299.99 },
      { id: 3, name: 'Carol Williams', email: 'carol@example.com', phone: '+1-555-456-7890', purchaseDate: '2024-01-12', amount: 1299.99 },
    ]
  },
  {
    productId: 4,
    productName: 'Nike Air Max',
    customers: [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-123-4567', purchaseDate: '2024-01-05', amount: 259.98 },
      { id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '+1-555-987-6543', purchaseDate: '2024-01-12', amount: 129.99 },
      { id: 5, name: 'Eva Davis', email: 'eva@example.com', phone: '+1-555-654-3210', purchaseDate: '2024-01-18', amount: 389.97 },
    ]
  },
  {
    productId: 5,
    productName: 'Coffee Table Oak',
    customers: [
      { id: 3, name: 'Carol Williams', email: 'carol@example.com', phone: '+1-555-456-7890', purchaseDate: '2024-01-15', amount: 299.99 },
    ]
  },
];

export function CampaignProductConnection({ campaigns, onCampaignTriggered }: CampaignProductConnectionProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [isTriggering, setIsTriggering] = useState(false);

  const selectedCampaign = campaigns.find(c => c.id === parseInt(selectedCampaignId));
  const eligibleCustomers = selectedCampaign?.productId 
    ? mockCustomerProductData.find(pcd => pcd.productId === selectedCampaign.productId)?.customers || []
    : [];

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

        return response.ok ? await response.json() : null;
      });

      const results = await Promise.all(callPromises);
      const successfulCalls = results.filter(r => r !== null);

      onCampaignTriggered(selectedCampaign.id, successfulCalls.length);
      toast.success(`Campaign "${selectedCampaign.name}" triggered! ${successfulCalls.length} calls scheduled.`);
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error triggering campaign:', error);
      toast.error('Failed to trigger campaign');
    } finally {
      setIsTriggering(false);
    }
  };

  const toggleCustomerSelection = (customerId: number) => {
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
            Select a campaign to instantly see eligible customers and trigger calls. Campaigns are connected to specific products.
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
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
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

      {selectedCampaign && eligibleCustomers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Eligible Customers ({eligibleCustomers.length})</span>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={selectAllCustomers}>
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
                      <div className="font-bold text-green-600">${customer.amount}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(customer.purchaseDate).toLocaleDateString()}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        Eligible for {selectedCampaign.discount} off
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
                      <>Triggering...</>
                    ) : (
                      <>
                        <Phone className="h-4 w-4 mr-2" />
                        Trigger Campaign Calls
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This will schedule calls to {selectedCustomers.length} customers about the {selectedCampaign.productName} {selectedCampaign.discount} discount offer.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedCampaign && eligibleCustomers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No customers have purchased {selectedCampaign.productName} yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}