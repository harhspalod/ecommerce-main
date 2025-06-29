import { NextRequest, NextResponse } from 'next/server';

interface PurchaseHistoryRequest {
  customerId?: number;
  productId?: number;
}

interface PurchaseRecord {
  id: number;
  customerId: number;
  productId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  productPrice: number;
  quantity: number;
  purchaseDate: string;
  totalAmount: number;
}

// Mock data - replace with your actual database
const mockCustomers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-123-4567' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '+1-555-987-6543' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', phone: '+1-555-456-7890' },
  { id: 4, name: 'David Brown', email: 'david@example.com', phone: '+1-555-321-9876' },
  { id: 5, name: 'Eva Davis', email: 'eva@example.com', phone: '+1-555-654-3210' },
];

const mockProducts = [
  { id: 1, name: 'iPhone 15 Pro', price: 999.99, category: 'Electronics' },
  { id: 2, name: 'Samsung Galaxy S24', price: 849.99, category: 'Electronics' },
  { id: 3, name: 'MacBook Air M3', price: 1299.99, category: 'Electronics' },
  { id: 4, name: 'Nike Air Max', price: 129.99, category: 'Fashion' },
  { id: 5, name: 'Coffee Table Oak', price: 299.99, category: 'Furniture' },
];

const mockPurchaseHistory = [
  { id: 1, customerId: 1, productId: 1, purchaseDate: '2024-01-10', quantity: 1 },
  { id: 2, customerId: 1, productId: 4, purchaseDate: '2024-01-05', quantity: 2 },
  { id: 3, customerId: 2, productId: 2, purchaseDate: '2024-01-08', quantity: 1 },
  { id: 4, customerId: 3, productId: 3, purchaseDate: '2024-01-12', quantity: 1 },
  { id: 5, customerId: 3, productId: 5, purchaseDate: '2024-01-15', quantity: 1 },
  { id: 6, customerId: 4, productId: 1, purchaseDate: '2024-01-20', quantity: 1 },
  { id: 7, customerId: 5, productId: 4, purchaseDate: '2024-01-18', quantity: 3 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const productId = searchParams.get('productId');

    let filteredHistory = mockPurchaseHistory;

    // Filter by customer ID
    if (customerId) {
      const id = parseInt(customerId);
      filteredHistory = filteredHistory.filter(ph => ph.customerId === id);
    }

    // Filter by product ID
    if (productId) {
      const id = parseInt(productId);
      filteredHistory = filteredHistory.filter(ph => ph.productId === id);
    }

    // Enrich with customer and product details
    const enrichedHistory: PurchaseRecord[] = filteredHistory.map(purchase => {
      const customer = mockCustomers.find(c => c.id === purchase.customerId);
      const product = mockProducts.find(p => p.id === purchase.productId);

      return {
        id: purchase.id,
        customerId: purchase.customerId,
        productId: purchase.productId,
        customerName: customer?.name || 'Unknown Customer',
        customerEmail: customer?.email || '',
        customerPhone: customer?.phone || '',
        productName: product?.name || 'Unknown Product',
        productPrice: product?.price || 0,
        quantity: purchase.quantity,
        purchaseDate: purchase.purchaseDate,
        totalAmount: (product?.price || 0) * purchase.quantity,
      };
    });

    return NextResponse.json({
      success: true,
      purchases: enrichedHistory,
      total: enrichedHistory.length,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching purchase history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}