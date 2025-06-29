import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

interface CallTriggerRequest {
  campaignId: string;
  customerId: string;
  productId: string;
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
    const customer = await db.customers.getById(customerId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get product information
    const product = await db.products.getById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if customer has purchased this product
    const customerPurchases = await db.purchases.getByCustomer(customerId);
    const hasPurchased = customerPurchases.some(purchase => purchase.product_id === productId);

    if (!hasPurchased) {
      return NextResponse.json(
        { error: 'Customer has not purchased this product' },
        { status: 400 }
      );
    }

    // Create call trigger record
    const callTrigger = await db.callTriggers.create({
      campaign_id: campaignId,
      customer_id: customerId,
      product_id: productId,
      trigger_type: triggerType,
      discount_percent: discountPercent || null,
      new_price: newPrice || null,
      original_price: originalPrice || null,
      status: 'scheduled',
      scheduled_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Schedule 5 minutes from now
    });

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
      callId: callTrigger.id,
      customerPhone: customer.phone,
      message,
      scheduledAt: callTrigger.scheduled_at,
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