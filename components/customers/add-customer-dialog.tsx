'use client';

import { useState, useEffect } from 'react';
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
import { Plus, Trash2, Package, Database, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Customer, PurchasedProduct } from './customers-page';
import { db } from '@/lib/database';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCustomer: (customer: { name: string; email: string; phone: string; purchasedProducts: PurchasedProduct[] }) => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export function AddCustomerDialog({ open, onOpenChange, onAddCustomer }: AddCustomerDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [currentProduct, setCurrentProduct] = useState({
    productId: '',
    purchaseDate: '',
    quantity: '1',
    customPrice: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      if (!open) return;
      
      setLoadingProducts(true);
      try {
        const products = await db.products.getAll();
        setAvailableProducts(products);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [open]);

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

    const selectedProduct = availableProducts.find(p => p.id === currentProduct.productId);
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

  const removeProduct = (productId: string) => {
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

    const customerData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      purchasedProducts: purchasedProducts,
    };

    onAddCustomer(customerData);
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
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Add New Customer</span>
          </DialogTitle>
          <DialogDescription>
            Add a new customer with their complete purchase history. This creates the customer-product connections needed for campaign targeting.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Database Integration</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Customer and purchase records will be stored with proper UUID relationships for campaign targeting
          </p>
        </div>

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
              <CardDescription>Add products that this customer has purchased (creates campaign eligibility)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingProducts ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading products...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="productId">Product *</Label>
                      <Select value={currentProduct.productId} onValueChange={(value) => setCurrentProduct({ ...currentProduct, productId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProducts.map((product) => (
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
                </>
              )}
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
                          <Badge variant="outline">ID: {product.productId.slice(0, 8)}...</Badge>
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

                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium text-green-700 mb-2">Campaign Eligibility Created:</h4>
                  <div className="space-y-1 text-xs text-green-600">
                    {purchasedProducts.map((product, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">✓</Badge>
                        <span>Eligible for {product.productName} campaigns</span>
                      </div>
                    ))}
                  </div>
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