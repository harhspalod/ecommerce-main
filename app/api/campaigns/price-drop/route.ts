import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

interface PriceDropAlert {
  productId: string;
  oldPrice: number;
  newPrice: number;
  discountPercent: number;
  campaignId?: string;
}

interface PriceDropResponse {
  success: boolean;
  affectedCustomers: number;
  callsTriggered: string[];
  message: string;
}

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
    const product = await db.products.getById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Find customers who purchased this product
    const productPurchases = await db.purchases.getByProduct(productId);
    const uniqueCustomers = Array.from(
      new Set(productPurchases.map(purchase => purchase.customer_id))
    );

    // Trigger calls for each affected customer
    const callsTriggered: string[] = [];
    
    for (const customerId of uniqueCustomers) {
      try {
        // Call the trigger-call API for each customer
        const callResponse = await fetch(`${request.nextUrl.origin}/api/campaigns/trigger-call`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            campaignId: campaignId || 'default-campaign',
            customerId,
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
        console.error(`Failed to trigger call for customer ${customerId}:`, error);
      }
    }

    const response: PriceDropResponse = {
      success: true,
      affectedCustomers: uniqueCustomers.length,
      callsTriggered,
      message: `Price drop alert triggered for ${product.name}. ${uniqueCustomers.length} customers will be contacted.`,
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