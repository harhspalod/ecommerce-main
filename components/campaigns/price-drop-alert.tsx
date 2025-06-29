'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Phone, AlertTriangle, DollarSign, Users, Package } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/database';

interface PriceDropAlertProps {
  onAlertTriggered?: (data: any) => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export function PriceDropAlert({ onAlertTriggered }: PriceDropAlertProps) {
  const [formData, setFormData] = useState({
    productId: '',
    newPrice: '',
    campaignId: '',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAlert, setLastAlert] = useState<any>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const productsData = await db.products.getAll();
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const selectedProduct = products.find(p => p.id === formData.productId);
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
          productId: formData.productId,
          oldPrice,
          newPrice,
          discountPercent,
          campaignId: formData.campaignId || 'price-drop-campaign',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLastAlert(data);
        
        toast.success(
          <div>
            <div className="font-semibold">Price drop alert triggered!</div>
            <div className="text-sm">{data.affectedCustomers} customers will be contacted</div>
            <div className="text-xs text-muted-foreground mt-1">Complete call data sent to external systems</div>
          </div>
        );
        
        onAlertTriggered?.(data);
        
        // Reset form
        setFormData({
          productId: '',
          newPrice: '',
          campaignId: '',
        });

        // Log success for integration
        console.log('🎯 PRICE DROP ALERT SUCCESS:');
        console.log('Product:', selectedProduct?.name);
        console.log('Price Change:', `$${oldPrice} → $${newPrice}`);
        console.log('Customers Affected:', data.affectedCustomers);
        console.log('Calls Triggered:', data.callsTriggered.length);
        
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

  if (loadingProducts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span>Price Drop Alert System</span>
          </CardTitle>
          <CardDescription>Loading products...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            Complete customer data and call scripts are generated automatically.
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
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center space-x-2">
                        <span>{product.name}</span>
                        <Badge variant="outline">${product.price}</Badge>
                        <span className="text-muted-foreground text-xs">• {product.category}</span>
                      </div>
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
              placeholder="Enter campaign ID or leave empty for auto-generated"
              value={formData.campaignId}
              onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
            />
          </div>

          {selectedProduct && newPrice > 0 && (
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Price Drop Preview</span>
              </h4>
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
                  <span className="text-muted-foreground">Current Price:</span>
                  <p className="line-through text-red-600">${oldPrice.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">New Price:</span>
                  <p className="font-bold text-green-600">${newPrice.toFixed(2)}</p>
                </div>
              </div>
              {discountPercent > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {discountPercent}% Discount
                  </Badge>
                  <Badge variant="outline">
                    Save ${(oldPrice - newPrice).toFixed(2)}
                  </Badge>
                </div>
              )}
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Call Data Package:</strong> Customer names, phone numbers, purchase history, 
                  call scripts, coupon codes, and product details will be automatically generated for each eligible customer.
                </p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleTriggerAlert} 
            disabled={isLoading || !formData.productId || !formData.newPrice || newPrice >= oldPrice}
            className="w-full"
          >
            {isLoading ? 'Triggering Price Drop Alert...' : 'Trigger Price Drop Alert'}
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
            <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-green-700 font-medium">{lastAlert.message}</p>
              <p className="text-xs text-green-600 mt-1">
                Complete call data with customer details, scripts, and coupon codes has been generated for external system integration.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}