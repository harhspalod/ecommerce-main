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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Trash2, Search, Eye, Package } from 'lucide-react';
import { Customer } from './customers-page';
import { EditCustomerDialog } from './edit-customer-dialog';
import { CustomerDetailsDialog } from './customer-details-dialog';
import { toast } from 'sonner';

interface CustomersTableProps {
  customers: Customer[];
  onUpdateCustomer: (id: number, customer: Partial<Customer>) => void;
  onDeleteCustomer: (id: number) => void;
}

export function CustomersTable({ customers, onUpdateCustomer, onDeleteCustomer }: CustomersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(customer => {
    return (
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.purchasedProducts.some(p => 
        p.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  const handleDelete = (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete "${customer.name}"?`)) {
      onDeleteCustomer(customer.id);
      toast.success(`${customer.name} has been deleted successfully`);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    onUpdateCustomer(updatedCustomer.id, updatedCustomer);
    setEditingCustomer(null);
    toast.success(`${updatedCustomer.name} has been updated successfully`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search customers or products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Products Purchased</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`/avatars/${customer.id}.png`} />
                      <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.orders}</TableCell>
                <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {customer.purchasedProducts.slice(0, 2).map((product, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {product.productName}
                      </Badge>
                    ))}
                    {customer.purchasedProducts.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{customer.purchasedProducts.length - 2} more
                      </Badge>
                    )}
                    {customer.purchasedProducts.length === 0 && (
                      <span className="text-sm text-muted-foreground">No purchases</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleView(customer)} title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)} title="Edit Customer">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(customer)} title="Delete Customer">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingCustomer && (
        <EditCustomerDialog
          customer={editingCustomer}
          open={!!editingCustomer}
          onOpenChange={(open) => !open && setEditingCustomer(null)}
          onUpdateCustomer={handleUpdateCustomer}
        />
      )}

      {viewingCustomer && (
        <CustomerDetailsDialog
          customer={viewingCustomer}
          open={!!viewingCustomer}
          onOpenChange={(open) => !open && setViewingCustomer(null)}
        />
      )}
    </div>
  );
}