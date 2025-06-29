'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomersTable } from '@/components/customers/customers-table';
import { AddCustomerDialog } from '@/components/customers/add-customer-dialog';
import { Plus, Users, Package, ShoppingCart, DollarSign } from 'lucide-react';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  lastOrder: string | null;
  purchasedProducts: PurchasedProduct[];
}

export interface PurchasedProduct {
  productId: number;
  productName: string;
  purchaseDate: string;
  quantity: number;
  price: number;
  totalAmount: number;
}

const initialCustomers: Customer[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 (555) 123-4567',
    orders: 3,
    totalSpent: 2579.97,
    lastOrder: '2024-01-15',
    purchasedProducts: [
      {
        productId: 1,
        productName: 'iPhone 15 Pro',
        purchaseDate: '2024-01-10',
        quantity: 1,
        price: 999.99,
        totalAmount: 999.99,
      },
      {
        productId: 4,
        productName: 'Nike Air Max',
        purchaseDate: '2024-01-05',
        quantity: 2,
        price: 129.99,
        totalAmount: 259.98,
      },
      {
        productId: 3,
        productName: 'MacBook Air M3',
        purchaseDate: '2024-01-15',
        quantity: 1,
        price: 1299.99,
        totalAmount: 1299.99,
      },
    ],
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '+1 (555) 987-6543',
    orders: 2,
    totalSpent: 979.98,
    lastOrder: '2024-01-12',
    purchasedProducts: [
      {
        productId: 2,
        productName: 'Samsung Galaxy S24',
        purchaseDate: '2024-01-08',
        quantity: 1,
        price: 849.99,
        totalAmount: 849.99,
      },
      {
        productId: 4,
        productName: 'Nike Air Max',
        purchaseDate: '2024-01-12',
        quantity: 1,
        price: 129.99,
        totalAmount: 129.99,
      },
    ],
  },
  {
    id: 3,
    name: 'Carol Williams',
    email: 'carol@example.com',
    phone: '+1 (555) 456-7890',
    orders: 2,
    totalSpent: 1599.98,
    lastOrder: '2024-01-15',
    purchasedProducts: [
      {
        productId: 3,
        productName: 'MacBook Air M3',
        purchaseDate: '2024-01-12',
        quantity: 1,
        price: 1299.99,
        totalAmount: 1299.99,
      },
      {
        productId: 5,
        productName: 'Coffee Table Oak',
        purchaseDate: '2024-01-15',
        quantity: 1,
        price: 299.99,
        totalAmount: 299.99,
      },
    ],
  },
  {
    id: 4,
    name: 'David Brown',
    email: 'david@example.com',
    phone: '+1 (555) 321-9876',
    orders: 1,
    totalSpent: 999.99,
    lastOrder: '2024-01-20',
    purchasedProducts: [
      {
        productId: 1,
        productName: 'iPhone 15 Pro',
        purchaseDate: '2024-01-20',
        quantity: 1,
        price: 999.99,
        totalAmount: 999.99,
      },
    ],
  },
  {
    id: 5,
    name: 'Eva Davis',
    email: 'eva@example.com',
    phone: '+1 (555) 654-3210',
    orders: 1,
    totalSpent: 389.97,
    lastOrder: '2024-01-18',
    purchasedProducts: [
      {
        productId: 4,
        productName: 'Nike Air Max',
        purchaseDate: '2024-01-18',
        quantity: 3,
        price: 129.99,
        totalAmount: 389.97,
      },
    ],
  },
];

export function CustomersPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'orders' | 'totalSpent' | 'lastOrder' | 'purchasedProducts'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Math.max(...customers.map(c => c.id)) + 1,
      orders: 0,
      totalSpent: 0,
      lastOrder: null,
      purchasedProducts: [],
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: number, customerData: Partial<Customer>) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === id ? { ...customer, ...customerData } : customer
    ));
  };

  const deleteCustomer = (id: number) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
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
            <p className="text-xs text-muted-foreground">{Math.round((stats.withPurchases / stats.total) * 100)}% of total</p>
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