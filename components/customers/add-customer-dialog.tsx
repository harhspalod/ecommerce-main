'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Customer, PurchasedProduct } from './customers-page';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'orders' | 'totalSpent' | 'lastOrder'>) => void;
}

// Available products for selection
const availableProducts = [
  { id: 1, name: 'iPhone 15 Pro', price: 999.99 },
  { id: 2, name: 'Samsung Galaxy S24', price: 849.99 },
  { id: 3, name: 'MacBook Air M3', price: 1299.99 },
  { id: 4, name: 'Nike Air Max', price: 129.99 },
  { id: 5, name: 'Coffee Table Oak', price: 299.99 },
  { id: 6, name: 'Sony WH-1000XM5', price: 399.99 },
  { id: 7, name: 'iPad Pro 12.9"', price: 1099.99 },
  { id: 8, name: 'Dell XPS 13', price: 1199.99 },
  { id: 9, name: 'AirPods Pro', price: 249.99 },
  { id: 10, name: 'Samsung 55" QLED TV', price: 1299.99 },
];

export function AddCustomerDialog({ open, onOpenChange, onAddCustomer }: AddCustomerDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [currentProduct, setCurrentProduct] = useState({
    productId: '',
    purchaseDate: '',
    quantity: '1',
    customPrice: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCurrentProduct = () => {
    if (!currentProduct.productId) {
      toast.error('Please select a product');
      return false;
    }
    if (!currentProduct.purchaseDate) {
      toast.error('Please enter purchase date');
      return false;
    }
    if (!currentProduct.quantity || parseInt(currentProduct.quantity) <= 0) {
      toast.error('Please enter valid quantity');
      return false;
    }
    return true;
  };

  const addProduct = () => {
    if (!validateCurrentProduct()) return;

    const selectedProduct = availableProducts.find(p => p.id === parseInt(currentProduct.productId));
    if (!selectedProduct) return;

    const price = currentProduct.customPrice ? parseFloat(currentProduct.customPrice) : selectedProduct.price;
    const quantity = parseInt(currentProduct.quantity);

    // Check if product already exists
    const existingProductIndex = purchasedProducts.findIndex(p => p.productId === selectedProduct.id);
    
    if (existingProductIndex >= 0) {
      toast.error('This product is already added. Remove it first to add again.');
      return;
    }

    const newPurchase: PurchasedProduct = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      purchaseDate: currentProduct.purchaseDate,
      quantity: quantity,
      price: price,
      totalAmount: price * quantity,
    };

    setPurchasedProducts(prev => [...prev, newPurchase]);
    
    // Reset current product form
    setCurrentProduct({
      productId: '',
      purchaseDate: '',
      quantity: '1',
      customPrice: '',
    });

    toast.success(`${selectedProduct.name} added to purchase history`);
  };

  const removeProduct = (productId: number) => {
    setPurchasedProducts(prev => prev.filter(p => p.productId !== productId));
    toast.success('Product removed from purchase history');
  };

  const calculateTotals = () => {
    const totalSpent = purchasedProducts.reduce((sum, product) => sum + product.totalAmount, 0);
    const totalOrders = purchasedProducts.length;
    const lastOrder = purchasedProducts.length > 0 
      ? purchasedProducts.reduce((latest, product) => 
          new Date(product.purchaseDate) > new Date(latest) ? product.purchaseDate : latest
        , purchasedProducts[0].purchaseDate)
      : null;

    return { totalSpent, totalOrders, lastOrder };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { totalSpent, totalOrders, lastOrder } = calculateTotals();

    const customerData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      purchasedProducts: purchasedProducts,
    };

    onAddCustomer(customerData);
    toast.success(`${customerData.name} has been added with ${totalOrders} products!`);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
    });
    setPurchasedProducts([]);
    setCurrentProduct({
      productId: '',
      purchaseDate: '',
      quantity: '1',
      customPrice: '',
    });
    setErrors({});
  };

  const { totalSpent, totalOrders } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer with their complete purchase history. Fill in customer details and add all products they have purchased.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Information</CardTitle>
              <CardDescription>Basic customer contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter customer name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Add Product Purchase */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Product Purchase</CardTitle>
              <CardDescription>Add products that this customer has purchased</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productId">Product *</Label>
                  <Select value={currentProduct.productId} onValueChange={(value) => setCurrentProduct({ ...currentProduct, productId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} - ${product.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date *</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={currentProduct.purchaseDate}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, purchaseDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={currentProduct.quantity}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customPrice">Custom Price ($)</Label>
                  <Input
                    id="customPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Leave empty for default"
                    value={currentProduct.customPrice}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, customPrice: e.target.value })}
                  />
                </div>
              </div>

              <Button type="button" onClick={addProduct} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Product to Purchase History
              </Button>
            </CardContent>
          </Card>

          {/* Purchase History Summary */}
          {purchasedProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Purchase History ({purchasedProducts.length} products)</span>
                </CardTitle>
                <CardDescription>
                  Total Spent: ${totalSpent.toFixed(2)} • Total Orders: {totalOrders}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {purchasedProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{product.productName}</h4>
                          <Badge variant="outline">ID: {product.productId}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span>Date: {new Date(product.purchaseDate).toLocaleDateString()}</span>
                          <span>Qty: {product.quantity}</span>
                          <span>Price: ${product.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="font-bold text-green-600">${product.totalAmount.toFixed(2)}</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(product.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Customer {purchasedProducts.length > 0 && `(${purchasedProducts.length} products)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}