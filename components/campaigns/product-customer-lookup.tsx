'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, Users, Phone, DollarSign, Database } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/database';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CustomerWithPurchase {
  id: string;
  name: string;
  email: string;
  phone: string;
  purchaseDate: string;
  amount: number;
  quantity: number;
}

export function ProductCustomerLookup() {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productCustomers, setProductCustomers] = useState<CustomerWithPurchase[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

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

  // Load customers when product is selected
  useEffect(() => {
    const loadCustomers = async () => {
      if (!selectedProductId) {
        setProductCustomers([]);
        return;
      }

      setLoadingCustomers(true);
      try {
        const purchases = await db.purchases.getByProduct(selectedProductId);
        
        // Transform purchases to customer format
        const customers: CustomerWithPurchase[] = purchases.map(purchase => ({
          id: purchase.customer_id,
          name: purchase.customer?.name || 'Unknown Customer',
          email: purchase.customer?.email || '',
          phone: purchase.customer?.phone || '',
          purchaseDate: purchase.purchase_date,
          amount: purchase.price_paid * purchase.quantity,
          quantity: purchase.quantity,
        }));

        // Remove duplicates (same customer multiple purchases) - keep most recent
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
        }, [] as CustomerWithPurchase[]);

        setProductCustomers(uniqueCustomers);
      } catch (error) {
        console.error('Error loading customers:', error);
        toast.error('Failed to load customers');
      } finally {
        setLoadingCustomers(false);
      }
    };

    loadCustomers();
  }, [selectedProductId]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleTriggerCalls = async () => {
    if (selectedCustomers.length === 0) {
      toast.error('Please select at least one customer');
      return;
    }

    try {
      const callPromises = selectedCustomers.map(async (customerId) => {
        const customer = productCustomers.find(c => c.id === customerId);
        if (!customer) return null;

        const response = await fetch('/api/campaigns/trigger-call', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            campaignId: 'manual-campaign-' + Date.now(),
            customerId: customer.id,
            productId: selectedProductId,
            triggerType: 'promotion',
            discountPercent: 15,
          }),
        });

        if (response.ok) {
          const callData = await response.json();
          
          // Log the complete call data for integration
          console.log('📞 MANUAL CALL TRIGGERED - Complete Data Package:');
          console.log('Customer:', callData.callData.customer_name);
          console.log('Phone:', callData.callData.phone_number);
          console.log('Product:', callData.callData.product_name);
          console.log('Reason:', callData.callData.reason);
          console.log('Full JSON:', JSON.stringify(callData.callData, null, 2));
          
          return callData;
        }
        return null;
      });

      const results = await Promise.all(callPromises);
      const successfulCalls = results.filter(r => r !== null);

      toast.success(
        <div>
          <div className="font-semibold">{successfulCalls.length} calls triggered successfully!</div>
          <div className="text-sm">Complete call data logged to console</div>
          <div className="text-xs text-muted-foreground mt-1">Check console for JSON integration data</div>
        </div>
      );
      
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error triggering calls:', error);
      toast.error('Failed to trigger calls');
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
    setSelectedCustomers(productCustomers.map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedCustomers([]);
  };

  if (loadingProducts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Product-Customer Campaign Lookup</span>
          </CardTitle>
          <CardDescription>Loading products...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading products from database...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Product-Customer Campaign Lookup</span>
        </CardTitle>
        <CardDescription>
          Select a product to see all customers who purchased it and trigger targeted campaigns with complete call data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Real-Time Database Lookup</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Live customer data with purchase history and complete call information generation
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Select Product</label>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a product to see its customers" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="flex items-center space-x-2">
                    <span>{product.name}</span>
                    <Badge variant="outline">${product.price}</Badge>
                    <span className="text-xs text-muted-foreground">• {product.category}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h3 className="font-medium">{selectedProduct.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {loadingCustomers ? 'Loading customers...' : `${productCustomers.length} customers`} • ${selectedProduct.price} • {selectedProduct.category}
                </p>
              </div>
              <Badge variant="secondary">
                {loadingCustomers ? '...' : productCustomers.length} buyers
              </Badge>
            </div>

            {loadingCustomers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading customers from database...</p>
              </div>
            ) : productCustomers.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Customers who purchased this product:</h4>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={selectAllCustomers}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3">
                  {productCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedCustomers.includes(customer.id) 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => toggleCustomerSelection(customer.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/avatars/${customer.id}.png`} />
                            <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{customer.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">${customer.amount.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground">
                              on {new Date(customer.purchaseDate).toLocaleDateString()}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            Qty: {customer.quantity} • UUID: {customer.id.slice(0, 8)}...
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedCustomers.length > 0 && (
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-medium">{selectedCustomers.length} customers selected</span>
                        <Badge variant="secondary">Product: {selectedProduct.name}</Badge>
                      </div>
                      <Button onClick={handleTriggerCalls}>
                        <Phone className="h-4 w-4 mr-2" />
                        Trigger Calls
                      </Button>
                    </div>
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 font-medium">Complete Call Data Package Ready</p>
                      <p className="text-xs text-green-600 mt-1">
                        Each call will include: Customer details, product info, call script, coupon codes, and purchase history.
                        JSON data will be logged to console for external system integration.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No customers have purchased this product yet</p>
                <p className="text-sm mt-2">Add customers with purchase history to see them here</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}