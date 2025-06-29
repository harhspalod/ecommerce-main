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
  callSettings?: {
    priority: 'high' | 'medium' | 'low';
    callTimePreference: string;
    timezone: string;
    maxCallsPerDay: number;
    enableWeekendCalls: boolean;
    customerValueThreshold: number;
    urgencyLevel: number;
    autoSchedule: boolean;
  };
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
  urgency_level: number;
  max_calls_per_day: number;
  enable_weekend_calls: boolean;
  auto_schedule: boolean;
  customer_value_threshold: number;
  purchase_history: {
    product_name: string;
    purchase_date: string;
    amount_paid: number;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: CallTriggerRequest = await request.json();
    const { campaignId, customerId, productId, triggerType, discountPercent, newPrice, originalPrice, callSettings } = body;

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

    // Calculate customer value for priority determination
    const customerValue = customerPurchases.reduce((sum, purchase) => 
      sum + (purchase.price_paid * purchase.quantity), 0
    );

    // Determine priority based on customer value and settings
    let finalPriority: 'high' | 'medium' | 'low' = callSettings?.priority || 'medium';
    
    if (callSettings?.customerValueThreshold && customerValue >= callSettings.customerValueThreshold) {
      finalPriority = 'high';
    }

    if (triggerType === 'price_drop' && originalPrice && newPrice) {
      const discountAmount = originalPrice - newPrice;
      if (discountAmount >= 100) { // High value price drops get priority
        finalPriority = 'high';
      }
    }

    // Calculate savings and generate coupon code
    const savingsAmount = originalPrice && newPrice ? originalPrice - newPrice : 0;
    const couponCode = `${triggerType.toUpperCase()}-${discountPercent || 10}-${Date.now().toString().slice(-6)}`;

    // Generate call script based on trigger type and priority
    let callScript = '';
    let reason = '';

    switch (triggerType) {
      case 'price_drop':
        reason = `Price drop alert for ${product.name} - Customer eligible for refund`;
        callScript = `Hi ${customer.name}, this is [Agent Name] from [Company]. I have great news! The ${product.name} you purchased on ${new Date(productPurchase.purchase_date).toLocaleDateString()} has dropped in price from $${originalPrice} to $${newPrice}. You're eligible for a ${discountPercent}% refund of $${savingsAmount.toFixed(2)}. Would you like me to process this refund for you today? Your coupon code is ${couponCode}.`;
        break;
      case 'stock_alert':
        reason = `Stock availability notification for ${product.name}`;
        callScript = `Hi ${customer.name}, this is [Agent Name] from [Company]. The ${product.name} you previously purchased is back in stock and we're offering a special ${discountPercent}% discount for returning customers. Would you be interested in purchasing another one? Your exclusive coupon code is ${couponCode}.`;
        break;
      case 'promotion':
        reason = `Special promotion offer for ${product.name} customer`;
        callScript = `Hi ${customer.name}, this is [Agent Name] from [Company]. As a valued customer who purchased the ${product.name}, we're offering you an exclusive ${discountPercent}% discount on your next purchase. This limited-time offer expires soon. Your coupon code is ${couponCode}. Would you like to hear about our current deals?`;
        break;
      default:
        reason = `Customer outreach for ${product.name}`;
        callScript = `Hi ${customer.name}, this is [Agent Name] from [Company]. We have an update about your ${product.name} purchase.`;
    }

    // Add priority-specific messaging
    if (finalPriority === 'high') {
      callScript += ' This is a priority call due to your valued customer status.';
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

    // Prepare complete call system payload with priority settings
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
      priority: finalPriority,
      best_call_time: callSettings?.callTimePreference || "2:00 PM - 4:00 PM EST",
      customer_timezone: callSettings?.timezone || "EST",
      urgency_level: callSettings?.urgencyLevel || 5,
      max_calls_per_day: callSettings?.maxCallsPerDay || 50,
      enable_weekend_calls: callSettings?.enableWeekendCalls || false,
      auto_schedule: callSettings?.autoSchedule || true,
      customer_value_threshold: callSettings?.customerValueThreshold || 500,
      purchase_history: purchaseHistory,
    };

    // Log the complete call data for external system integration
    console.log('🚀 CALL SYSTEM INTEGRATION - Complete Call Data with Priority Settings:');
    console.log('='.repeat(80));
    console.log('CUSTOMER INFO:');
    console.log(`  Name: ${callData.customer_name}`);
    console.log(`  Phone: ${callData.phone_number}`);
    console.log(`  Customer Value: $${customerValue.toFixed(2)}`);
    console.log('');
    console.log('PRODUCT & CAMPAIGN:');
    console.log(`  Product: ${callData.product_name} (${callData.product_id})`);
    console.log(`  Campaign: ${callData.campaign_name} (${callData.campaign_id})`);
    console.log(`  Discount: ${callData.discount}`);
    console.log(`  Coupon: ${callData.coupon_code}`);
    console.log('');
    console.log('CALL PRIORITY & SETTINGS:');
    console.log(`  Priority: ${callData.priority.toUpperCase()}`);
    console.log(`  Urgency Level: ${callData.urgency_level}/10`);
    console.log(`  Best Call Time: ${callData.best_call_time}`);
    console.log(`  Timezone: ${callData.customer_timezone}`);
    console.log(`  Max Daily Calls: ${callData.max_calls_per_day}`);
    console.log(`  Weekend Calls: ${callData.enable_weekend_calls ? 'Enabled' : 'Disabled'}`);
    console.log(`  Auto Schedule: ${callData.auto_schedule ? 'Enabled' : 'Disabled'}`);
    console.log('');
    console.log('CALL SCRIPT:');
    console.log(`  ${callData.call_script}`);
    console.log('');
    console.log('COMPLETE JSON FOR EXTERNAL SYSTEM:');
    console.log(JSON.stringify(callData, null, 2));
    console.log('='.repeat(80));

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