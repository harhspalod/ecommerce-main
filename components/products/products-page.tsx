'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductsTable } from '@/components/products/products-table';
import { AddProductDialog } from '@/components/products/add-product-dialog';
import { Plus, Package, AlertTriangle, XCircle, Grid3X3 } from 'lucide-react';
import { db } from '@/lib/database';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  salePrice: number | null;
  stock: number;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function ProductsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await db.products.getAll();
      
      // Transform products data to include status
      const enrichedProducts: Product[] = productsData.map(product => ({
        ...product,
        salePrice: product.sale_price,
        status: product.stock > 20 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock',
      }));

      setProducts(enrichedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'status' | 'created_at' | 'updated_at'>) => {
    try {
      await db.products.create({
        name: productData.name,
        category: productData.category,
        price: productData.price,
        sale_price: productData.salePrice,
        stock: productData.stock,
        description: productData.description || null,
      });

      toast.success(`${productData.name} has been added successfully!`);
      loadProducts(); // Reload to get updated data
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      await db.products.update(id, {
        name: productData.name,
        category: productData.category,
        price: productData.price,
        sale_price: productData.salePrice,
        stock: productData.stock,
        description: productData.description,
      });

      toast.success('Product updated successfully!');
      loadProducts(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await db.products.delete(id);
      toast.success('Product deleted successfully!');
      loadProducts(); // Reload to get updated data
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.status === 'Low Stock').length,
    outOfStock: products.filter(p => p.status === 'Out of Stock').length,
    categories: new Set(products.map(p => p.category)).size,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">Loading product data...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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