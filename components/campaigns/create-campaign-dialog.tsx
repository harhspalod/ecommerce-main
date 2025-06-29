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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Campaign } from './campaigns-page';

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCampaign: (campaign: Omit<Campaign, 'id' | 'triggered' | 'revenue' | 'progress'>) => void;
}

// Available products for campaign connection
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

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const selectedProduct = availableProducts.find(p => p.id === parseInt(formData.productId));

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
      productId: parseInt(formData.productId),
      productName: selectedProduct?.name,
    };

    onCreateCampaign(campaignData);
    toast.success(`${campaignData.name} has been created and connected to ${selectedProduct?.name}!`);
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
          <DialogTitle>Create Product-Connected Campaign</DialogTitle>
          <DialogDescription>
            Create a marketing campaign connected to a specific product. Only customers who purchased that product will be eligible.
          </DialogDescription>
        </DialogHeader>
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
              <div className="space-y-2">
                <Label htmlFor="productId">Target Product *</Label>
                <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                  <SelectTrigger className={errors.productId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select product to target" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - ${product.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && <p className="text-sm text-red-500">{errors.productId}</p>}
              </div>

              {selectedProduct && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Campaign Target: {selectedProduct.name}</p>
                  <p className="text-xs text-muted-foreground">
                    This campaign will only be available to customers who have purchased {selectedProduct.name}
                  </p>
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