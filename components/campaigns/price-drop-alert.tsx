'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Phone, AlertTriangle, DollarSign, Users } from 'lucide-react';
import { toast } from 'sonner';

interface PriceDropAlertProps {
  onAlertTriggered?: (data: any) => void;
}

const mockProducts = [
  { id: 1, name: 'iPhone 15 Pro', price: 999.99, category: 'Electronics' },
  { id: 2, name: 'Samsung Galaxy S24', price: 849.99, category: 'Electronics' },
  { id: 3, name: 'MacBook Air M3', price: 1299.99, category: 'Electronics' },
  { id: 4, name: 'Nike Air Max', price: 129.99, category: 'Fashion' },
  { id: 5, name: 'Coffee Table Oak', price: 299.99, category: 'Furniture' },
];

export function PriceDropAlert({ onAlertTriggered }: PriceDropAlertProps) {
  const [formData, setFormData] = useState({
    productId: '',
    newPrice: '',
    campaignId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastAlert, setLastAlert] = useState<any>(null);

  const selectedProduct = mockProducts.find(p => p.id === parseInt(formData.productId));
  const oldPrice = selectedProduct?.price || 0;
  const newPrice = parseFloat(formData.newPrice) || 0;
  const discountPercent = oldPrice > 0 && newPrice > 0 ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0;

  const handleTriggerAlert = async () => {
    if (!formData.productId || !formData.newPrice) {
      toast.error('Please select a product and enter a new price');
      return;
    }

    if (newPrice >= oldPrice) {
      toast.error('New price must be lower than current price');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/campaigns/price-drop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: parseInt(formData.productId),
          oldPrice,
          newPrice,
          discountPercent,
          campaignId: formData.campaignId ? parseInt(formData.campaignId) : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLastAlert(data);
        toast.success(`Price drop alert triggered! ${data.affectedCustomers} customers will be contacted.`);
        onAlertTriggered?.(data);
        
        // Reset form
        setFormData({
          productId: '',
          newPrice: '',
          campaignId: '',
        });
      } else {
        toast.error(data.error || 'Failed to trigger price drop alert');
      }
    } catch (error) {
      console.error('Error triggering price drop alert:', error);
      toast.error('Failed to trigger price drop alert');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span>Price Drop Alert System</span>
          </CardTitle>
          <CardDescription>
            Automatically trigger sales calls when product prices drop for customers who previously purchased the item.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">Select Product</Label>
              <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {mockProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} - ${product.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPrice">New Price ($)</Label>
              <Input
                id="newPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.newPrice}
                onChange={(e) => setFormData({ ...formData, newPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaignId">Campaign ID (Optional)</Label>
            <Input
              id="campaignId"
              type="number"
              placeholder="Enter campaign ID"
              value={formData.campaignId}
              onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
            />
          </div>

          {selectedProduct && newPrice > 0 && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium">Price Drop Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Product:</span>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <p>{selectedProduct.category}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Old Price:</span>
                  <p className="line-through text-red-600">${oldPrice.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">New Price:</span>
                  <p className="font-bold text-green-600">${newPrice.toFixed(2)}</p>
                </div>
              </div>
              {discountPercent > 0 && (
                <Badge variant="secondary" className="mt-2">
                  {discountPercent}% Discount
                </Badge>
              )}
            </div>
          )}

          <Button 
            onClick={handleTriggerAlert} 
            disabled={isLoading || !formData.productId || !formData.newPrice}
            className="w-full"
          >
            {isLoading ? 'Triggering Alert...' : 'Trigger Price Drop Alert'}
          </Button>
        </CardContent>
      </Card>

      {lastAlert && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-green-600" />
              <span>Last Alert Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Customers Affected</p>
                  <p className="font-bold">{lastAlert.affectedCustomers}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Calls Triggered</p>
                  <p className="font-bold">{lastAlert.callsTriggered.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="default">Success</Badge>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">{lastAlert.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}