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
import { toast } from 'sonner';
import { Product } from './products-page';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: Omit<Product, 'id' | 'status'>) => void;
}

export function AddProductDialog({ open, onOpenChange, onAddProduct }: AddProductDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    salePrice: '',
    stock: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }
    if (formData.salePrice && parseFloat(formData.salePrice) >= parseFloat(formData.price)) {
      newErrors.salePrice = 'Sale price must be less than regular price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const productData = {
      name: formData.name.trim(),
      category: formData.category,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      stock: parseInt(formData.stock),
      description: formData.description.trim(),
    };

    onAddProduct(productData);
    toast.success(`${productData.name} has been added successfully!`);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      name: '',
      category: '',
      price: '',
      salePrice: '',
      stock: '',
      description: '',
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Add a new product to your inventory. Fill in all the required information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Fashion">Fashion</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Books">Books</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                <SelectItem value="Beauty">Beauty</SelectItem>
                <SelectItem value="Toys">Toys</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="salePrice">Sale Price ($)</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                className={errors.salePrice ? 'border-red-500' : ''}
              />
              {errors.salePrice && <p className="text-sm text-red-500">{errors.salePrice}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              placeholder="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className={errors.stock ? 'border-red-500' : ''}
            />
            {errors.stock && <p className="text-sm text-red-500">{errors.stock}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Product description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}