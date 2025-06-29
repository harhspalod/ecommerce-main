import { NextRequest, NextResponse } from 'next/server';

interface PriceDropAlert {
  productId: number;
  oldPrice: number;
  newPrice: number;
  discountPercent: number;
  campaignId?: number;
}

interface PriceDropResponse {
  success: boolean;
  affectedCustomers: number;
  callsTriggered: string[];
  message: string;
}

// Mock data
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
  { customerId: 1, productId: 1, purchaseDate: '2024-01-10', quantity: 1 },
  { customerId: 1, productId: 4, purchaseDate: '2024-01-05', quantity: 2 },
  { customerId: 2, productId: 2, purchaseDate: '2024-01-08', quantity: 1 },
  { customerId: 3, productId: 3, purchaseDate: '2024-01-12', quantity: 1 },
  { customerId: 3, productId: 5, purchaseDate: '2024-01-15', quantity: 1 },
];

export async function POST(request: NextRequest) {
  try {
    const body: PriceDropAlert = await request.json();
    const { productId, oldPrice, newPrice, discountPercent, campaignId } = body;

    // Validate required fields
    if (!productId || !oldPrice || !newPrice || !discountPercent) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, oldPrice, newPrice, discountPercent' },
        { status: 400 }
      );
    }

    // Validate price drop
    if (newPrice >= oldPrice) {
      return NextResponse.json(
        { error: 'New price must be lower than old price' },
        { status: 400 }
      );
    }

    // Get product information
    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Find customers who purchased this product
    const customerIds = mockPurchaseHistory
      .filter(ph => ph.productId === productId)
      .map(ph => ph.customerId);

    const affectedCustomers = mockCustomers.filter(c => customerIds.includes(c.id));

    // Trigger calls for each affected customer
    const callsTriggered: string[] = [];
    
    for (const customer of affectedCustomers) {
      try {
        // Call the trigger-call API for each customer
        const callResponse = await fetch(`${request.nextUrl.origin}/api/campaigns/trigger-call`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            campaignId: campaignId || 999, // Default campaign ID if not provided
            customerId: customer.id,
            productId,
            triggerType: 'price_drop',
            discountPercent,
            newPrice,
            originalPrice: oldPrice,
          }),
        });

        if (callResponse.ok) {
          const callData = await callResponse.json();
          callsTriggered.push(callData.callId);
        }
      } catch (error) {
        console.error(`Failed to trigger call for customer ${customer.id}:`, error);
      }
    }

    const response: PriceDropResponse = {
      success: true,
      affectedCustomers: affectedCustomers.length,
      callsTriggered,
      message: `Price drop alert triggered for ${product.name}. ${affectedCustomers.length} customers will be contacted.`,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error processing price drop alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}