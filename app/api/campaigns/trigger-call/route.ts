import { NextRequest, NextResponse } from 'next/server';

interface CallTriggerRequest {
  campaignId: number;
  customerId: number;
  productId: number;
  triggerType: 'price_drop' | 'stock_alert' | 'promotion';
  discountPercent?: number;
  newPrice?: number;
  originalPrice?: number;
}

interface CallTriggerResponse {
  success: boolean;
  callId: string;
  customerPhone: string;
  message: string;
  scheduledAt: string;
}

// Mock customer database - replace with your actual database
const mockCustomers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-123-4567' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '+1-555-987-6543' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', phone: '+1-555-456-7890' },
  { id: 4, name: 'David Brown', email: 'david@example.com', phone: '+1-555-321-9876' },
  { id: 5, name: 'Eva Davis', email: 'eva@example.com', phone: '+1-555-654-3210' },
];

// Mock product database - replace with your actual database
const mockProducts = [
  { id: 1, name: 'iPhone 15 Pro', price: 999.99, category: 'Electronics' },
  { id: 2, name: 'Samsung Galaxy S24', price: 849.99, category: 'Electronics' },
  { id: 3, name: 'MacBook Air M3', price: 1299.99, category: 'Electronics' },
  { id: 4, name: 'Nike Air Max', price: 129.99, category: 'Fashion' },
  { id: 5, name: 'Coffee Table Oak', price: 299.99, category: 'Furniture' },
];

// Mock purchase history - replace with your actual database
const mockPurchaseHistory = [
  { customerId: 1, productId: 1, purchaseDate: '2024-01-10', quantity: 1 },
  { customerId: 1, productId: 4, purchaseDate: '2024-01-05', quantity: 2 },
  { customerId: 2, productId: 2, purchaseDate: '2024-01-08', quantity: 1 },
  { customerId: 3, productId: 3, purchaseDate: '2024-01-12', quantity: 1 },
  { customerId: 3, productId: 5, purchaseDate: '2024-01-15', quantity: 1 },
];

export async function POST(request: NextRequest) {
  try {
    const body: CallTriggerRequest = await request.json();
    const { campaignId, customerId, productId, triggerType, discountPercent, newPrice, originalPrice } = body;

    // Validate required fields
    if (!campaignId || !customerId || !productId || !triggerType) {
      return NextResponse.json(
        { error: 'Missing required fields: campaignId, customerId, productId, triggerType' },
        { status: 400 }
      );
    }

    // Get customer information
    const customer = mockCustomers.find(c => c.id === customerId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
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

    // Check if customer has purchased this product
    const hasPurchased = mockPurchaseHistory.some(
      ph => ph.customerId === customerId && ph.productId === productId
    );

    if (!hasPurchased) {
      return NextResponse.json(
        { error: 'Customer has not purchased this product' },
        { status: 400 }
      );
    }

    // Generate unique call ID
    const callId = `CALL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create call trigger record (save to database in real implementation)
    const callTrigger = {
      id: callId,
      campaignId,
      customerId,
      productId,
      customerPhone: customer.phone,
      customerName: customer.name,
      productName: product.name,
      triggerType,
      discountPercent,
      newPrice,
      originalPrice,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Schedule 5 minutes from now
    };

    // Log the call trigger (replace with actual database save)
    console.log('Call Trigger Created:', callTrigger);

    // Generate appropriate message based on trigger type
    let message = '';
    switch (triggerType) {
      case 'price_drop':
        message = `Great news ${customer.name}! The ${product.name} you purchased has dropped in price from $${originalPrice} to $${newPrice}. You're eligible for a ${discountPercent}% refund!`;
        break;
      case 'stock_alert':
        message = `Hi ${customer.name}! The ${product.name} is back in stock. Would you like to purchase another one?`;
        break;
      case 'promotion':
        message = `Special offer for ${customer.name}! Get ${discountPercent}% off on ${product.name} - limited time only!`;
        break;
      default:
        message = `Hi ${customer.name}! We have an update about your ${product.name}.`;
    }

    const response: CallTriggerResponse = {
      success: true,
      callId,
      customerPhone: customer.phone,
      message,
      scheduledAt: callTrigger.scheduledAt,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error triggering call:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}