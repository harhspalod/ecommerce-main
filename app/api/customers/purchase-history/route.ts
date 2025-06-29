import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

interface PurchaseHistoryRequest {
  customerId?: string;
  productId?: string;
}

interface PurchaseRecord {
  id: string;
  customerId: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  productPrice: number;
  quantity: number;
  purchaseDate: string;
  totalAmount: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const productId = searchParams.get('productId');

    let purchases;

    if (customerId) {
      purchases = await db.purchases.getByCustomer(customerId);
    } else if (productId) {
      purchases = await db.purchases.getByProduct(productId);
    } else {
      purchases = await db.purchases.getAll();
    }

    // Transform the data to match the expected format
    const enrichedHistory: PurchaseRecord[] = purchases.map(purchase => ({
      id: purchase.id,
      customerId: purchase.customer_id,
      productId: purchase.product_id,
      customerName: purchase.customer?.name || 'Unknown Customer',
      customerEmail: purchase.customer?.email || '',
      customerPhone: purchase.customer?.phone || '',
      productName: purchase.product?.name || 'Unknown Product',
      productPrice: purchase.product?.price || 0,
      quantity: purchase.quantity,
      purchaseDate: purchase.purchase_date,
      totalAmount: purchase.price_paid * purchase.quantity,
    }));

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