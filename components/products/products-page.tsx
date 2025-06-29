'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductsTable } from '@/components/products/products-table';
import { AddProductDialog } from '@/components/products/add-product-dialog';
import { Plus, Package, AlertTriangle, XCircle, Grid3X3 } from 'lucide-react';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  salePrice: number | null;
  stock: number;
  status: string;
  description?: string;
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    category: 'Electronics',
    price: 999.99,
    salePrice: 899.99,
    stock: 45,
    status: 'In Stock',
    description: 'Latest iPhone with advanced features',
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24',
    category: 'Electronics',
    price: 849.99,
    salePrice: null,
    stock: 12,
    status: 'Low Stock',
    description: 'Premium Android smartphone',
  },
  {
    id: 3,
    name: 'MacBook Air M3',
    category: 'Electronics',
    price: 1299.99,
    salePrice: 1199.99,
    stock: 0,
    status: 'Out of Stock',
    description: 'Lightweight laptop with M3 chip',
  },
  {
    id: 4,
    name: 'Nike Air Max',
    category: 'Fashion',
    price: 129.99,
    salePrice: null,
    stock: 156,
    status: 'In Stock',
    description: 'Comfortable running shoes',
  },
  {
    id: 5,
    name: 'Coffee Table Oak',
    category: 'Furniture',
    price: 299.99,
    salePrice: 249.99,
    stock: 8,
    status: 'Low Stock',
    description: 'Solid oak coffee table',
  },
];

export function ProductsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (productData: Omit<Product, 'id' | 'status'>) => {
    const newProduct: Product = {
      ...productData,
      id: Math.max(...products.map(p => p.id)) + 1,
      status: productData.stock > 20 ? 'In Stock' : productData.stock > 0 ? 'Low Stock' : 'Out of Stock',
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: number, productData: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id 
        ? { 
            ...product, 
            ...productData,
            status: (productData.stock !== undefined) 
              ? (productData.stock > 20 ? 'In Stock' : productData.stock > 0 ? 'Low Stock' : 'Out of Stock')
              : product.status
          }
        : product
    ));
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.status === 'Low Stock').length,
    outOfStock: products.filter(p => p.status === 'Out of Stock').length,
    categories: new Set(products.map(p => p.category)).size,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory.
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Complete list of products with stock levels and pricing information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductsTable 
            products={products}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
          />
        </CardContent>
      </Card>

      <AddProductDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onAddProduct={addProduct}
      />
    </div>
  );
}