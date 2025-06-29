from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging
import json
from datetime import datetime

app = FastAPI(title="Call System Integration API", version="1.0.0")

# Setup detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define the complete call trigger data structure
class PurchaseHistory(BaseModel):
    product_name: str
    purchase_date: str
    amount_paid: float

class CallTriggerRequest(BaseModel):
    customer_name: str
    phone_number: str
    product_name: str
    product_id: str
    discount: str
    coupon_code: str
    reason: str
    campaign_name: str
    campaign_id: str
    original_price: Optional[float] = None
    new_price: Optional[float] = None
    savings_amount: Optional[float] = None
    call_script: str
    priority: str  # 'high', 'medium', 'low'
    best_call_time: str
    customer_timezone: str
    purchase_history: List[PurchaseHistory]

class CallResponse(BaseModel):
    status: str
    call_id: str
    message: str
    scheduled_time: str

@app.post("/api/campaigns/trigger-call", response_model=CallResponse)
def trigger_call(data: CallTriggerRequest):
    """
    Receive complete call trigger data from the CRM system
    This endpoint receives all the customer, product, and campaign data needed for the call
    """
    
    # Log the incoming comprehensive data
    logger.info("🚀 INCOMING CALL TRIGGER - COMPLETE DATA PACKAGE")
    logger.info("=" * 80)
    logger.info(f"Customer: {data.customer_name}")
    logger.info(f"Phone: {data.phone_number}")
    logger.info(f"Product: {data.product_name} (ID: {data.product_id})")
    logger.info(f"Campaign: {data.campaign_name} (ID: {data.campaign_id})")
    logger.info(f"Reason: {data.reason}")
    logger.info(f"Discount: {data.discount}")
    logger.info(f"Coupon Code: {data.coupon_code}")
    logger.info(f"Priority: {data.priority}")
    logger.info(f"Best Call Time: {data.best_call_time}")
    
    if data.original_price and data.new_price:
        logger.info(f"Price Drop: ${data.original_price} → ${data.new_price}")
        logger.info(f"Savings: ${data.savings_amount}")
    
    logger.info("Call Script:")
    logger.info(f"  {data.call_script}")
    
    logger.info("Purchase History:")
    for purchase in data.purchase_history:
        logger.info(f"  - {purchase.product_name}: ${purchase.amount_paid} on {purchase.purchase_date}")
    
    logger.info("=" * 80)
    
    # Print the complete JSON for external system integration
    print("\n🔗 COMPLETE JSON DATA FOR EXTERNAL SYSTEM INTEGRATION:")
    print("=" * 60)
    print(json.dumps(data.dict(), indent=2, default=str))
    print("=" * 60)
    
    # Generate unique call ID
    call_id = f"CALL-{datetime.now().strftime('%Y%m%d%H%M%S')}-{data.product_id[:8]}"
    
    # Here you would integrate with your actual call system (Omnidimension, etc.)
    # Example integrations:
    
    # 1. Queue the call in your system
    # call_system.queue_call(
    #     phone=data.phone_number,
    #     script=data.call_script,
    #     priority=data.priority,
    #     customer_data=data.dict()
    # )
    
    # 2. Send to external webhook
    # webhook_client.send_call_data(data.dict())
    
    # 3. Store in database for processing
    # database.store_call_trigger(data.dict())
    
    # Simulate call scheduling
    scheduled_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    logger.info(f"✅ Call scheduled successfully with ID: {call_id}")
    
    return CallResponse(
        status="Call trigger received and processed",
        call_id=call_id,
        message=f"Call scheduled for {data.customer_name} about {data.product_name}",
        scheduled_time=scheduled_time
    )

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Call System Integration API"}

@app.get("/api/calls/status/{call_id}")
def get_call_status(call_id: str):
    """Get the status of a specific call"""
    # In a real implementation, you would check your call system's status
    return {
        "call_id": call_id,
        "status": "scheduled",
        "message": "Call is queued for processing"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)