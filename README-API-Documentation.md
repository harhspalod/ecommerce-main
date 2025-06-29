# Sales Call Marketing Agent API Documentation

## Overview
This system provides APIs for triggering automated sales calls when product prices drop or promotional campaigns are activated. The system connects customers to their purchased products and automatically retrieves phone numbers for call scheduling.

## API Endpoints

### 1. Trigger Sales Call API
**Endpoint:** `POST /api/campaigns/trigger-call`

**Purpose:** Triggers a sales call for a specific customer about a specific product they purchased.

**Request Body:**
```json
{
  "campaignId": 1,
  "customerId": 123,
  "productId": 456,
  "triggerType": "price_drop",
  "discountPercent": 15,
  "newPrice": 849.99,
  "originalPrice": 999.99
}
```

**Request Parameters:**
- `campaignId` (number, required): ID of the marketing campaign
- `customerId` (number, required): ID of the customer to call
- `productId` (number, required): ID of the product related to the call
- `triggerType` (string, required): Type of trigger - "price_drop", "stock_alert", or "promotion"
- `discountPercent` (number, optional): Discount percentage for the offer
- `newPrice` (number, optional): New price of the product
- `originalPrice` (number, optional): Original price of the product

**Response:**
```json
{
  "success": true,
  "callId": "CALL-1705123456789-abc123def",
  "customerPhone": "+1-555-123-4567",
  "message": "Great news Alice Johnson! The iPhone 15 Pro you purchased has dropped in price from $999.99 to $849.99. You're eligible for a 15% refund!",
  "scheduledAt": "2024-01-15T14:35:00.000Z"
}
```

**Error Responses:**
- `400`: Missing required fields or customer hasn't purchased the product
- `404`: Customer or product not found
- `500`: Internal server error

### 2. Price Drop Alert API
**Endpoint:** `POST /api/campaigns/price-drop`

**Purpose:** Triggers calls for ALL customers who purchased a specific product when its price drops.

**Request Body:**
```json
{
  "productId": 1,
  "oldPrice": 999.99,
  "newPrice": 849.99,
  "discountPercent": 15,
  "campaignId": 123
}
```

**Response:**
```json
{
  "success": true,
  "affectedCustomers": 5,
  "callsTriggered": [
    "CALL-1705123456789-abc123def",
    "CALL-1705123456790-def456ghi"
  ],
  "message": "Price drop alert triggered for iPhone 15 Pro. 5 customers will be contacted."
}
```

### 3. Get Customer Phone Numbers API
**Endpoint:** `GET /api/customers/phone`

**Purpose:** Retrieve customer phone numbers based on various filters.

**Query Parameters:**
- `customerId` (optional): Get specific customer's phone
- `email` (optional): Search customers by email
- `productId` (optional): Get customers who purchased a specific product

**Examples:**
```
GET /api/customers/phone?customerId=123
GET /api/customers/phone?email=alice@example.com
GET /api/customers/phone?productId=456
```

**Response:**
```json
{
  "customers": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "+1-555-123-4567",
      "hasPurchased": true,
      "lastPurchaseDate": "2024-01-10"
    }
  ]
}
```

### 4. Purchase History API
**Endpoint:** `GET /api/customers/purchase-history`

**Purpose:** Get detailed purchase history with customer and product information.

**Query Parameters:**
- `customerId` (optional): Filter by customer ID
- `productId` (optional): Filter by product ID

**Response:**
```json
{
  "success": true,
  "purchases": [
    {
      "id": 1,
      "customerId": 1,
      "productId": 1,
      "customerName": "Alice Johnson",
      "customerEmail": "alice@example.com",
      "customerPhone": "+1-555-123-4567",
      "productName": "iPhone 15 Pro",
      "productPrice": 999.99,
      "quantity": 1,
      "purchaseDate": "2024-01-10",
      "totalAmount": 999.99
    }
  ],
  "total": 1
}
```

## How the System Works

### 1. Customer-Product Connection
- The system maintains a purchase history database linking customers to products
- When a price drop or campaign is triggered, it automatically finds all customers who purchased that specific product
- Only customers with purchase history for the product receive calls

### 2. Phone Number Retrieval
- Customer phone numbers are stored in the customer database
- The trigger API automatically retrieves the phone number when scheduling calls
- No manual phone number lookup required

### 3. Call Scheduling Flow
1. **Price Drop Detected** → API call to `/api/campaigns/price-drop`
2. **System Finds Customers** → Queries purchase history for the product
3. **Retrieves Phone Numbers** → Gets customer contact information
4. **Schedules Calls** → Creates call records with unique IDs
5. **Returns Results** → Provides call IDs and customer count

### 4. Campaign Integration
- Each call is linked to a specific campaign ID
- Campaigns can have different trigger types (price_drop, stock_alert, promotion)
- The system tracks which campaigns generate the most calls and conversions

## Example Usage Scenarios

### Scenario 1: Price Drop Alert
```javascript
// Product price drops from $999 to $849
const response = await fetch('/api/campaigns/price-drop', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 1,
    oldPrice: 999.99,
    newPrice: 849.99,
    discountPercent: 15,
    campaignId: 123
  })
});

// Result: All customers who bought iPhone 15 Pro get scheduled calls
```

### Scenario 2: Individual Customer Call
```javascript
// Trigger call for specific customer about their purchased product
const response = await fetch('/api/campaigns/trigger-call', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaignId: 1,
    customerId: 123,
    productId: 456,
    triggerType: 'promotion',
    discountPercent: 20
  })
});
```

### Scenario 3: Get Customers for Product
```javascript
// Find all customers who purchased a specific product
const response = await fetch('/api/customers/phone?productId=1');
const data = await response.json();

// Result: List of customers with phone numbers who bought product ID 1
```

## Integration with Omnidimension (or other call systems)

The API provides all necessary information for integration with external call systems:

1. **Customer Phone Number**: Retrieved automatically from database
2. **Call Script/Message**: Generated based on trigger type and product details
3. **Call ID**: Unique identifier for tracking
4. **Scheduling**: Timestamp for when call should be made

You can integrate this with your call system by:
1. Using the trigger APIs to get call details
2. Passing the phone number and message to your call system
3. Using the call ID for tracking and reporting

## Security Considerations

- All APIs validate that customers have actually purchased the products before triggering calls
- Customer data is protected and only accessible through proper API endpoints
- Call triggers are logged with unique IDs for audit trails
- Phone numbers are only returned for customers with verified purchase history