import { NextRequest, NextResponse } from 'next/server';

interface CustomerPhoneRequest {
  customerId?: number;
  email?: string;
  productId?: number; // Get customers who purchased this product
}

interface CustomerPhoneResponse {
  customers: {
    id: number;
    name: string;
    email: string;
    phone: string;
    hasPurchased?: boolean;
    lastPurchaseDate?: string;
  }[];
}

// Mock data - replace with your actual database
const mockCustomers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-123-4567' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '+1-555-987-6543' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', phone: '+1-555-456-7890' },
  { id: 4, name: 'David Brown', email: 'david@example.com', phone: '+1-555-321-9876' },
  { id: 5, name: 'Eva Davis', email: 'eva@example.com', phone: '+1-555-654-3210' },
];

const mockPurchaseHistory = [
  { customerId: 1, productId: 1, purchaseDate: '2024-01-10', quantity: 1 },
  { customerId: 1, productId: 4, purchaseDate: '2024-01-05', quantity: 2 },
  { customerId: 2, productId: 2, purchaseDate: '2024-01-08', quantity: 1 },
  { customerId: 3, productId: 3, purchaseDate: '2024-01-12', quantity: 1 },
  { customerId: 3, productId: 5, purchaseDate: '2024-01-15', quantity: 1 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const email = searchParams.get('email');
    const productId = searchParams.get('productId');

    let customers = mockCustomers;

    // Filter by specific customer ID
    if (customerId) {
      const id = parseInt(customerId);
      customers = customers.filter(c => c.id === id);
    }

    // Filter by email
    if (email) {
      customers = customers.filter(c => c.email.toLowerCase().includes(email.toLowerCase()));
    }

    // Filter by customers who purchased a specific product
    if (productId) {
      const prodId = parseInt(productId);
      const customerIds = mockPurchaseHistory
        .filter(ph => ph.productId === prodId)
        .map(ph => ph.customerId);
      
      customers = customers.filter(c => customerIds.includes(c.id));
      
      // Add purchase information
      customers = customers.map(customer => {
        const purchase = mockPurchaseHistory.find(
          ph => ph.customerId === customer.id && ph.productId === prodId
        );
        return {
          ...customer,
          hasPurchased: true,
          lastPurchaseDate: purchase?.purchaseDate,
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