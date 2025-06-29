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
  callData: CallSystemPayload;
}

interface CallSystemPayload {
  customer_name: string;
  phone_number: string;
  product_name: string;
  product_id: string;
  discount: string;
  coupon_code: string;
  reason: string;
  campaign_name: string;
  campaign_id: string;
  original_price?: number;
  new_price?: number;
  savings_amount?: number;
  call_script: string;
  priority: 'high' | 'medium' | 'low';
  best_call_time: string;
  customer_timezone: string;
  purchase_history: {
    product_name: string;
    purchase_date: string;
    amount_paid: number;
  }[];
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

    // Get campaign information
    const campaign = await db.campaigns.getById(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if customer has purchased this product
    const customerPurchases = await db.purchases.getByCustomer(customerId);
    const productPurchase = customerPurchases.find(purchase => purchase.product_id === productId);

    if (!productPurchase) {
      return NextResponse.json(
        { error: 'Customer has not purchased this product' },
        { status: 400 }
      );
    }

    // Get customer's complete purchase history for context
    const purchaseHistory = customerPurchases.map(purchase => ({
      product_name: purchase.product?.name || 'Unknown Product',
      purchase_date: purchase.purchase_date,
      amount_paid: purchase.price_paid * purchase.quantity,
    }));

    // Calculate savings and generate coupon code
    const savingsAmount = originalPrice && newPrice ? originalPrice - newPrice : 0;
    const couponCode = `${triggerType.toUpperCase()}-${discountPercent || 10}-${Date.now().toString().slice(-6)}`;

    // Generate call script based on trigger type
    let callScript = '';
    let reason = '';
    let priority: 'high' | 'medium' | 'low' = 'medium';

    switch (triggerType) {
      case 'price_drop':
        reason = `Price drop alert for ${product.name} - Customer eligible for refund`;
        priority = 'high';
        callScript = `Hi ${customer.name}, this is [Agent Name] from [Company]. I have great news! The ${product.name} you purchased on ${new Date(productPurchase.purchase_date).toLocaleDateString()} has dropped in price from $${originalPrice} to $${newPrice}. You're eligible for a ${discountPercent}% refund of $${savingsAmount.toFixed(2)}. Would you like me to process this refund for you today? Your coupon code is ${couponCode}.`;
        break;
      case 'stock_alert':
        reason = `Stock availability notification for ${product.name}`;
        priority = 'medium';
        callScript = `Hi ${customer.name}, this is [Agent Name] from [Company]. The ${product.name} you previously purchased is back in stock and we're offering a special ${discountPercent}% discount for returning customers. Would you be interested in purchasing another one? Your exclusive coupon code is ${couponCode}.`;
        break;
      case 'promotion':
        reason = `Special promotion offer for ${product.name} customer`;
        priority = 'medium';
        callScript = `Hi ${customer.name}, this is [Agent Name] from [Company]. As a valued customer who purchased the ${product.name}, we're offering you an exclusive ${discountPercent}% discount on your next purchase. This limited-time offer expires soon. Your coupon code is ${couponCode}. Would you like to hear about our current deals?`;
        break;
      default:
        reason = `Customer outreach for ${product.name}`;
        callScript = `Hi ${customer.name}, this is [Agent Name] from [Company]. We have an update about your ${product.name} purchase.`;
    }

    // Create call trigger record in database
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

    // Prepare complete call system payload
    const callData: CallSystemPayload = {
      customer_name: customer.name,
      phone_number: customer.phone,
      product_name: product.name,
      product_id: product.id,
      discount: `${discountPercent || 10}%`,
      coupon_code: couponCode,
      reason: reason,
      campaign_name: campaign.name,
      campaign_id: campaign.id,
      original_price: originalPrice,
      new_price: newPrice,
      savings_amount: savingsAmount,
      call_script: callScript,
      priority: priority,
      best_call_time: "2:00 PM - 4:00 PM EST", // Default optimal call time
      customer_timezone: "EST", // Default timezone
      purchase_history: purchaseHistory,
    };

    // Log the complete call data for external system integration
    console.log('🚀 CALL SYSTEM INTEGRATION - Complete Call Data:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(callData, null, 2));
    console.log('='.repeat(60));

    // Here you would integrate with your actual call system (Omnidimension, etc.)
    // Example: await sendToCallSystem(callData);

    // Generate user-friendly message
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
      callData: callData,
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