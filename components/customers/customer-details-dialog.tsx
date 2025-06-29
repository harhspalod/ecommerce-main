'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, Calendar, DollarSign, Phone, Mail } from 'lucide-react';
import { Customer } from './customers-page';

interface CustomerDetailsDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailsDialog({ customer, open, onOpenChange }: CustomerDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`/avatars/${customer.id}.png`} />
              <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <div>{customer.name}</div>
              <div className="text-sm text-muted-foreground font-normal">{customer.email}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete customer profile with purchase history and product connections.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customer.orders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${customer.totalSpent.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customer.purchasedProducts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Order</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">
                  {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : 'Never'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Purchase History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Purchase History</CardTitle>
              <CardDescription>
                All products purchased by this customer with details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customer.purchasedProducts.length > 0 ? (
                <div className="space-y-4">
                  {customer.purchasedProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{product.productName}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span>Purchased: {new Date(product.purchaseDate).toLocaleDateString()}</span>
                          <span>Qty: {product.quantity}</span>
                          <span>Price: ${product.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${product.totalAmount.toFixed(2)}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          Product ID: {product.productId}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No purchases yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}