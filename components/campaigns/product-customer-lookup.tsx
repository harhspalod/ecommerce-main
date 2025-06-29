'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, Users, Phone, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const mockProducts = [
  { id: 1, name: 'iPhone 15 Pro', price: 999.99, category: 'Electronics' },
  { id: 2, name: 'Samsung Galaxy S24', price: 849.99, category: 'Electronics' },
  { id: 3, name: 'MacBook Air M3', price: 1299.99, category: 'Electronics' },
  { id: 4, name: 'Nike Air Max', price: 129.99, category: 'Fashion' },
  { id: 5, name: 'Coffee Table Oak', price: 299.99, category: 'Furniture' },
];

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

export function ProductCustomerLookup() {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);

  const selectedProduct = mockProducts.find(p => p.id === parseInt(selectedProductId));
  const productCustomers = mockCustomerProductData.find(pcd => pcd.productId === parseInt(selectedProductId))?.customers || [];

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
            campaignId: 1,
            customerId: customer.id,
            productId: parseInt(selectedProductId),
            triggerType: 'promotion',
            discountPercent: 15,
          }),
        });

        return response.ok ? await response.json() : null;
      });

      const results = await Promise.all(callPromises);
      const successfulCalls = results.filter(r => r !== null);

      toast.success(`${successfulCalls.length} calls triggered successfully!`);
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error triggering calls:', error);
      toast.error('Failed to trigger calls');
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
    setSelectedCustomers(productCustomers.map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedCustomers([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Product-Customer Campaign Lookup</span>
        </CardTitle>
        <CardDescription>
          Select a product to see all customers who purchased it and trigger targeted campaigns.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Product</label>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a product to see its customers" />
            </SelectTrigger>
            <SelectContent>
              {mockProducts.map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name} - ${product.price} ({product.category})
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
                  {productCustomers.length} customers • ${selectedProduct.price} • {selectedProduct.category}
                </p>
              </div>
              <Badge variant="secondary">
                {productCustomers.length} buyers
              </Badge>
            </div>

            {productCustomers.length > 0 ? (
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
                            <span className="text-sm font-medium">${customer.amount}</span>
                            <span className="text-xs text-muted-foreground">
                              on {new Date(customer.purchaseDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedCustomers.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">{selectedCustomers.length} customers selected</span>
                    </div>
                    <Button onClick={handleTriggerCalls}>
                      <Phone className="h-4 w-4 mr-2" />
                      Trigger Calls
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No customers have purchased this product yet</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}