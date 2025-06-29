'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomersTable } from '@/components/customers/customers-table';
import { AddCustomerDialog } from '@/components/customers/add-customer-dialog';
import { Plus, Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { db } from '@/lib/database';
import { toast } from 'sonner';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  lastOrder: string | null;
  purchasedProducts: PurchasedProduct[];
  created_at: string;
  updated_at: string;
}

export interface PurchasedProduct {
  productId: string;
  productName: string;
  purchaseDate: string;
  quantity: number;
  price: number;
  totalAmount: number;
}

export function CustomersPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const [customersData, purchasesData] = await Promise.all([
        db.customers.getAll(),
        db.purchases.getAll()
      ]);

      // Transform customers data to include purchase information
      const enrichedCustomers: Customer[] = customersData.map(customer => {
        const customerPurchases = purchasesData.filter(p => p.customer_id === customer.id);
        
        const purchasedProducts: PurchasedProduct[] = customerPurchases.map(purchase => ({
          productId: purchase.product_id,
          productName: purchase.product?.name || 'Unknown Product',
          purchaseDate: purchase.purchase_date,
          quantity: purchase.quantity,
          price: purchase.price_paid,
          totalAmount: purchase.price_paid * purchase.quantity,
        }));

        const totalSpent = purchasedProducts.reduce((sum, p) => sum + p.totalAmount, 0);
        const lastOrder = purchasedProducts.length > 0 
          ? purchasedProducts.reduce((latest, p) => 
              new Date(p.purchaseDate) > new Date(latest) ? p.purchaseDate : latest
            , purchasedProducts[0].purchaseDate)
          : null;

        return {
          ...customer,
          orders: purchasedProducts.length,
          totalSpent,
          lastOrder,
          purchasedProducts,
        };
      });

      setCustomers(enrichedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const addCustomer = async (customerData: { name: string; email: string; phone: string; purchasedProducts: PurchasedProduct[] }) => {
    try {
      // Create customer
      const newCustomer = await db.customers.create({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
      });

      // Create purchases if any
      for (const product of customerData.purchasedProducts) {
        await db.purchases.create({
          customer_id: newCustomer.id,
          product_id: product.productId,
          quantity: product.quantity,
          price_paid: product.price,
          purchase_date: product.purchaseDate,
        });
      }

      toast.success(`${newCustomer.name} has been added successfully!`);
      loadCustomers(); // Reload to get updated data
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      await db.customers.update(id, {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
      });

      toast.success('Customer updated successfully!');
      loadCustomers(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await db.customers.delete(id);
      toast.success('Customer deleted successfully!');
      loadCustomers(); // Reload to get updated data
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  // Get unique products purchased by all customers
  const allPurchasedProducts = customers.flatMap(c => c.purchasedProducts);
  const uniqueProducts = Array.from(
    new Set(allPurchasedProducts.map(p => p.productName))
  );

  const stats = {
    total: customers.length,
    withPurchases: customers.filter(c => c.purchasedProducts.length > 0).length,
    totalProducts: uniqueProducts.length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">Loading customer data...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer base and track their purchase history with product connections.
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Buyers</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withPurchases}</div>
            <p className="text-xs text-muted-foreground">{stats.total > 0 ? Math.round((stats.withPurchases / stats.total) * 100) : 0}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Unique products purchased</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From all customers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Database</CardTitle>
          <CardDescription>
            Complete customer information with detailed purchase history and product connections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomersTable 
            customers={customers}
            onUpdateCustomer={updateCustomer}
            onDeleteCustomer={deleteCustomer}
          />
        </CardContent>
      </Card>

      <AddCustomerDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onAddCustomer={addCustomer}
      />
    </div>
  );
}