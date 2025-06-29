'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Search } from 'lucide-react';
import { Product } from './products-page';
import { EditProductDialog } from './edit-product-dialog';
import { toast } from 'sonner';

interface ProductsTableProps {
  products: Product[];
  onUpdateProduct: (id: number, product: Partial<Product>) => void;
  onDeleteProduct: (id: number) => void;
}

export function ProductsTable({ products, onUpdateProduct, onDeleteProduct }: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(product => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === 'all' || product.category === categoryFilter)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'default';
      case 'Low Stock':
        return 'secondary';
      case 'Out of Stock':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      onDeleteProduct(product.id);
      toast.success(`${product.name} has been deleted successfully`);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    onUpdateProduct(updatedProduct.id, updatedProduct);
    setEditingProduct(null);
    toast.success(`${updatedProduct.name} has been updated successfully`);
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  {product.salePrice ? (
                    <span className="text-green-600">${product.salePrice.toFixed(2)}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(product.status)}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(product)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          onUpdateProduct={handleUpdateProduct}
        />
      )}
    </div>
  );
}