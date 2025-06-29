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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Database, Users, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Campaign } from './campaigns-page';
import { db } from '@/lib/database';

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCampaign: (campaign: Omit<Campaign, 'id' | 'triggered' | 'revenue' | 'progress'>) => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export function CreateCampaignDialog({ open, onOpenChange, onCreateCampaign }: CreateCampaignDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'Scheduled',
    productId: '',
    discount: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [eligibleCustomers, setEligibleCustomers] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

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

  // Load eligible customers when product is selected
  useEffect(() => {
    const loadEligibleCustomers = async () => {
      if (!formData.productId) {
        setEligibleCustomers(0);
        return;
      }

      setLoadingCustomers(true);
      try {
        const purchases = await db.purchases.getByProduct(formData.productId);
        const uniqueCustomers = new Set(purchases.map(p => p.customer_id));
        setEligibleCustomers(uniqueCustomers.size);
      } catch (error) {
        console.error('Error loading eligible customers:', error);
        setEligibleCustomers(0);
      } finally {
        setLoadingCustomers(false);
      }
    };

    loadEligibleCustomers();
  }, [formData.productId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }
    if (!formData.type) {
      newErrors.type = 'Campaign type is required';
    }
    if (!formData.productId) {
      newErrors.productId = 'Product connection is required';
    }
    if (!formData.discount || parseFloat(formData.discount) <= 0 || parseFloat(formData.discount) > 50) {
      newErrors.discount = 'Discount must be between 1% and 50%';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const selectedProduct = availableProducts.find(p => p.id === formData.productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const campaignData = {
      name: formData.name.trim(),
      type: formData.type,
      status: formData.status,
      condition: `Product: ${selectedProduct?.name}`,
      discount: `${formData.discount}%`,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description.trim(),
      productId: formData.productId,
      productName: selectedProduct?.name,
    };

    onCreateCampaign(campaignData);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      name: '',
      type: '',
      status: 'Scheduled',
      productId: '',
      discount: '',
      startDate: '',
      endDate: '',
      description: '',
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Megaphone className="h-5 w-5" />
            <span>Create Product-Connected Campaign</span>
          </DialogTitle>
          <DialogDescription>
            Create a marketing campaign connected to a specific product. Only customers who purchased that product will be eligible for calls.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Database Integration</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Campaign will be stored with UUID and connected to product for automatic customer targeting
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                placeholder="Enter campaign name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Campaign Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Discount">Discount Campaign</SelectItem>
                  <SelectItem value="Welcome">Welcome Campaign</SelectItem>
                  <SelectItem value="Loyalty">Loyalty Campaign</SelectItem>
                  <SelectItem value="Flash Sale">Flash Sale</SelectItem>
                  <SelectItem value="Bulk">Bulk Purchase</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Product Connection</CardTitle>
              <CardDescription>Connect this campaign to a specific product. Only customers who purchased this product will be eligible.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingProducts ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading products...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="productId">Target Product *</Label>
                  <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                    <SelectTrigger className={errors.productId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select product to target" />
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
                  {errors.productId && <p className="text-sm text-red-500">{errors.productId}</p>}
                </div>
              )}

              {selectedProduct && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>Campaign Target: {selectedProduct.name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        This campaign will only be available to customers who have purchased {selectedProduct.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <div>
                          {loadingCustomers ? (
                            <div className="text-sm">Loading...</div>
                          ) : (
                            <>
                              <div className="text-lg font-bold text-blue-600">{eligibleCustomers}</div>
                              <div className="text-xs text-muted-foreground">eligible customers</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount Percentage *</Label>
              <Input
                id="discount"
                type="number"
                min="1"
                max="50"
                placeholder="15"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className={errors.discount ? 'border-red-500' : ''}
              />
              {errors.discount && <p className="text-sm text-red-500">{errors.discount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Campaign Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your campaign goals and strategy..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {selectedProduct && eligibleCustomers > 0 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-green-700 mb-2">Campaign Ready for Activation:</h4>
              <div className="space-y-1 text-xs text-green-600">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  <span>Connected to {selectedProduct.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  <span>{eligibleCustomers} customers eligible for calls</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  <span>Complete call data will be generated automatically</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  <span>Ready for external system integration</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Campaign</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}