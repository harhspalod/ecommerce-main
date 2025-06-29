# Complete Call System Integration Guide

## 🎯 Overview
This system provides complete call triggering with comprehensive JSON data packages for external call systems like Omnidimension. Every call trigger includes customer details, product information, campaign data, call scripts, and purchase history.

## 📊 Complete Call Data Package

When a call is triggered, the system generates a comprehensive JSON payload with all necessary information:

```json
{
  "customer_name": "Alice Johnson",
  "phone_number": "+1-555-123-4567",
  "product_name": "iPhone 15 Pro",
  "product_id": "uuid-product-id",
  "discount": "15%",
  "coupon_code": "PRICE_DROP-15-123456",
  "reason": "Price drop alert for iPhone 15 Pro - Customer eligible for refund",
  "campaign_name": "iPhone 15 Pro Holiday Sale",
  "campaign_id": "uuid-campaign-id",
  "original_price": 999.99,
  "new_price": 849.99,
  "savings_amount": 150.00,
  "call_script": "Hi Alice Johnson, this is [Agent Name] from [Company]. I have great news! The iPhone 15 Pro you purchased on 1/10/2024 has dropped in price from $999.99 to $849.99. You're eligible for a 15% refund of $150.00. Would you like me to process this refund for you today? Your coupon code is PRICE_DROP-15-123456.",
  "priority": "high",
  "best_call_time": "2:00 PM - 4:00 PM EST",
  "customer_timezone": "EST",
  "purchase_history": [
    {
      "product_name": "iPhone 15 Pro",
      "purchase_date": "2024-01-10",
      "amount_paid": 999.99
    },
    {
      "product_name": "Nike Air Max",
      "purchase_date": "2024-01-05",
      "amount_paid": 259.98
    }
  ]
}
```

## 🔧 Integration Methods

### Method 1: FastAPI Webhook Receiver
The included FastAPI server (`fastapi omniprsent/main.py`) receives complete call data:

```bash
# Start the FastAPI server
cd "fastapi omniprsent"
python main.py
```

The server will log all incoming call data and provide JSON for external system integration.

### Method 2: Direct API Integration
Integrate directly with the Next.js API endpoints:

```javascript
// Trigger individual call
const response = await fetch('/api/campaigns/trigger-call', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaignId: 'campaign-uuid',
    customerId: 'customer-uuid',
    productId: 'product-uuid',
    triggerType: 'price_drop',
    discountPercent: 15,
    newPrice: 849.99,
    originalPrice: 999.99
  })
});

const callData = await response.json();
// callData.callData contains the complete JSON package
```

### Method 3: Price Drop Mass Alerts
Trigger calls for all customers who purchased a specific product:

```javascript
// Trigger price drop for all customers
const response = await fetch('/api/campaigns/price-drop', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'product-uuid',
    oldPrice: 999.99,
    newPrice: 849.99,
    discountPercent: 15,
    campaignId: 'campaign-uuid'
  })
});
```

## 📞 Call Data Components

### Customer Information
- **Name**: Full customer name
- **Phone**: Formatted phone number
- **Email**: Customer email address
- **Purchase History**: Complete list of previous purchases

### Product Details
- **Product Name**: Full product name
- **Product ID**: Unique database identifier
- **Current Price**: Original price
- **New Price**: Discounted price (if applicable)
- **Savings Amount**: Calculated savings

### Campaign Information
- **Campaign Name**: Marketing campaign name
- **Campaign ID**: Unique campaign identifier
- **Discount Percentage**: Offer percentage
- **Coupon Code**: Auto-generated unique coupon

### Call Management
- **Call Script**: Complete personalized script
- **Priority Level**: High/Medium/Low priority
- **Best Call Time**: Optimal calling window
- **Reason**: Clear reason for the call

## 🎯 Call Trigger Types

### 1. Price Drop Alerts
**Trigger**: When product prices decrease
**Data Includes**: Original price, new price, savings amount, refund eligibility
**Script**: Personalized refund offer with coupon code

### 2. Stock Alerts
**Trigger**: When out-of-stock products become available
**Data Includes**: Product availability, special offers for returning customers
**Script**: Restock notification with exclusive discount

### 3. Promotional Campaigns
**Trigger**: Marketing campaign activation
**Data Includes**: Campaign details, exclusive offers, limited-time discounts
**Script**: Personalized promotional offer

## 🔄 Integration Workflow

1. **Campaign Setup**: Create product-connected campaigns in the CRM
2. **Customer Selection**: System automatically finds eligible customers based on purchase history
3. **Call Triggering**: Trigger calls individually or in bulk
4. **Data Generation**: Complete JSON package generated with all call information
5. **External System**: JSON data sent to your call system (Omnidimension, etc.)
6. **Call Execution**: Your system uses the provided script and customer data
7. **Tracking**: Call IDs provided for status tracking and reporting

## 🛠 Database Integration

The system uses Supabase with proper relationships:

- **Customers**: Contact information and profiles
- **Products**: Inventory with pricing and categories
- **Purchases**: Customer-product purchase history
- **Campaigns**: Marketing campaigns linked to specific products
- **Call Triggers**: Complete call records with all data

## 📈 Real-Time Features

- **Live Customer Lookup**: Instantly find customers who purchased specific products
- **Dynamic Script Generation**: Personalized call scripts based on customer and product data
- **Automatic Coupon Creation**: Unique coupon codes for each call
- **Purchase History Context**: Complete customer purchase context for agents
- **Priority Scoring**: Automatic priority assignment based on customer value and trigger type

## 🔐 Data Security

- **UUID Identifiers**: All database records use secure UUID primary keys
- **Customer Privacy**: Phone numbers only accessible through proper API authentication
- **Purchase Verification**: Calls only triggered for verified product purchases
- **Audit Trail**: Complete logging of all call triggers and data access

## 📊 Analytics & Reporting

The system tracks:
- **Call Trigger Rates**: How many calls are generated per campaign
- **Customer Eligibility**: Which customers are eligible for which campaigns
- **Campaign Performance**: ROI and conversion tracking
- **Product-Customer Connections**: Purchase history analytics

## 🚀 Getting Started

1. **Set up Supabase**: Create database with provided migration
2. **Configure Environment**: Add Supabase credentials to `.env.local`
3. **Start CRM System**: Run the Next.js application
4. **Set up Call Receiver**: Start the FastAPI webhook receiver
5. **Create Campaigns**: Set up product-connected marketing campaigns
6. **Trigger Calls**: Use the campaign trigger center to generate calls
7. **Integrate External System**: Use the JSON data with your call platform

The system is production-ready with complete data flow, proper database relationships, and comprehensive call information for seamless integration with any external call system!