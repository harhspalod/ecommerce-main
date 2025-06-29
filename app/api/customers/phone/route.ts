import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

interface CustomerPhoneRequest {
  customerId?: string;
  email?: string;
  productId?: string; // Get customers who purchased this product
}

interface CustomerPhoneResponse {
  customers: {
    id: string;
    name: string;
    email: string;
    phone: string;
    hasPurchased?: boolean;
    lastPurchaseDate?: string;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const email = searchParams.get('email');
    const productId = searchParams.get('productId');

    let customers = await db.customers.getAll();

    // Filter by specific customer ID
    if (customerId) {
      customers = customers.filter(c => c.id === customerId);
    }

    // Filter by email
    if (email) {
      customers = customers.filter(c => c.email.toLowerCase().includes(email.toLowerCase()));
    }

    // Filter by customers who purchased a specific product
    if (productId) {
      const productPurchases = await db.purchases.getByProduct(productId);
      const customerIds = productPurchases.map(purchase => purchase.customer_id);
      
      customers = customers.filter(c => customerIds.includes(c.id));
      
      // Add purchase information
      customers = customers.map(customer => {
        const purchase = productPurchases.find(
          p => p.customer_id === customer.id
        );
        return {
          ...customer,
          hasPurchased: true,
          lastPurchaseDate: purchase?.purchase_date,
        };
      });
    }

    const response: CustomerPhoneResponse = {
      customers,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching customer phone numbers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}