from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging
import json
from datetime import datetime

app = FastAPI(title="Call System Integration API with Priority Settings", version="2.0.0")

# Setup detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define the complete call trigger data structure with priority settings
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
    urgency_level: int  # 1-10 scale
    max_calls_per_day: int
    enable_weekend_calls: bool
    auto_schedule: bool
    customer_value_threshold: float
    purchase_history: List[PurchaseHistory]

class CallResponse(BaseModel):
    status: str
    call_id: str
    message: str
    scheduled_time: str
    priority_assigned: str

@app.post("/api/campaigns/trigger-call", response_model=CallResponse)
def trigger_call(data: CallTriggerRequest):
    """
    Receive complete call trigger data with priority settings from the CRM system
    This endpoint receives all customer, product, campaign data, and priority settings needed for the call
    """
    
    # Log the incoming comprehensive data with priority information
    logger.info("🚀 INCOMING CALL TRIGGER - COMPLETE DATA PACKAGE WITH PRIORITY SETTINGS")
    logger.info("=" * 100)
    logger.info("CUSTOMER INFORMATION:")
    logger.info(f"  Name: {data.customer_name}")
    logger.info(f"  Phone: {data.phone_number}")
    logger.info(f"  Timezone: {data.customer_timezone}")
    logger.info("")
    logger.info("PRODUCT & CAMPAIGN:")
    logger.info(f"  Product: {data.product_name} (ID: {data.product_id})")
    logger.info(f"  Campaign: {data.campaign_name} (ID: {data.campaign_id})")
    logger.info(f"  Reason: {data.reason}")
    logger.info(f"  Discount: {data.discount}")
    logger.info(f"  Coupon Code: {data.coupon_code}")
    logger.info("")
    logger.info("PRIORITY & CALL SETTINGS:")
    logger.info(f"  Priority Level: {data.priority.upper()}")
    logger.info(f"  Urgency Level: {data.urgency_level}/10")
    logger.info(f"  Best Call Time: {data.best_call_time}")
    logger.info(f"  Max Calls Per Day: {data.max_calls_per_day}")
    logger.info(f"  Weekend Calls: {'Enabled' if data.enable_weekend_calls else 'Disabled'}")
    logger.info(f"  Auto Schedule: {'Enabled' if data.auto_schedule else 'Disabled'}")
    logger.info(f"  Customer Value Threshold: ${data.customer_value_threshold}")
    logger.info("")
    
    if data.original_price and data.new_price:
        logger.info("PRICING INFORMATION:")
        logger.info(f"  Price Drop: ${data.original_price} → ${data.new_price}")
        logger.info(f"  Savings: ${data.savings_amount}")
        logger.info("")
    
    logger.info("CALL SCRIPT:")
    logger.info(f"  {data.call_script}")
    logger.info("")
    
    logger.info("PURCHASE HISTORY:")
    for purchase in data.purchase_history:
        logger.info(f"  - {purchase.product_name}: ${purchase.amount_paid} on {purchase.purchase_date}")
    logger.info("")
    
    # Determine call priority and scheduling based on settings
    priority_message = ""
    if data.priority == "high":
        priority_message = "🔴 HIGH PRIORITY - Process immediately with top agent assignment"
    elif data.priority == "medium":
        priority_message = "🟡 MEDIUM PRIORITY - Process within standard timeframes"
    else:
        priority_message = "🟢 LOW PRIORITY - Process when agents are available"
    
    logger.info(f"PRIORITY ASSIGNMENT: {priority_message}")
    logger.info("")
    
    # Log scheduling recommendations
    logger.info("SCHEDULING RECOMMENDATIONS:")
    if data.auto_schedule:
        logger.info(f"  ✅ Auto-schedule enabled - Call will be automatically queued")
    else:
        logger.info(f"  ⏸️ Manual scheduling required")
    
    if data.enable_weekend_calls:
        logger.info(f"  📅 Weekend calls enabled - Can schedule 7 days a week")
    else:
        logger.info(f"  📅 Weekdays only - Monday-Friday scheduling")
    
    logger.info(f"  ⏰ Optimal call window: {data.best_call_time} ({data.customer_timezone})")
    logger.info(f"  📊 Daily call limit: {data.max_calls_per_day} calls")
    logger.info("")
    
    logger.info("=" * 100)
    
    # Print the complete JSON for external system integration
    print("\n🔗 COMPLETE JSON DATA FOR EXTERNAL SYSTEM INTEGRATION:")
    print("=" * 80)
    print(json.dumps(data.dict(), indent=2, default=str))
    print("=" * 80)
    
    # Generate unique call ID with priority prefix
    priority_prefix = data.priority.upper()[0]  # H, M, or L
    call_id = f"CALL-{priority_prefix}-{datetime.now().strftime('%Y%m%d%H%M%S')}-{data.product_id[:8]}"
    
    # Here you would integrate with your actual call system (Omnidimension, etc.)
    # Example integrations with priority handling:
    
    # 1. Queue the call in your system with priority
    # call_system.queue_call(
    #     phone=data.phone_number,
    #     script=data.call_script,
    #     priority=data.priority,
    #     urgency=data.urgency_level,
    #     best_time=data.best_call_time,
    #     timezone=data.customer_timezone,
    #     weekend_enabled=data.enable_weekend_calls,
    #     auto_schedule=data.auto_schedule,
    #     customer_data=data.dict()
    # )
    
    # 2. Send to external webhook with priority settings
    # webhook_client.send_call_data({
    #     "call_data": data.dict(),
    #     "priority_settings": {
    #         "priority": data.priority,
    #         "urgency": data.urgency_level,
    #         "auto_schedule": data.auto_schedule
    #     }
    # })
    
    # 3. Store in database for processing with priority queue
    # database.store_call_trigger(data.dict(), priority=data.priority)
    
    # Simulate call scheduling with priority consideration
    if data.auto_schedule:
        if data.priority == "high":
            scheduled_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Immediate
            schedule_message = "immediately due to high priority"
        elif data.priority == "medium":
            scheduled_time = (datetime.now()).strftime('%Y-%m-%d %H:%M:%S')  # Within 30 minutes
            schedule_message = "within 30 minutes"
        else:
            scheduled_time = (datetime.now()).strftime('%Y-%m-%d %H:%M:%S')  # Within 2 hours
            schedule_message = "within 2 hours"
    else:
        scheduled_time = "Manual scheduling required"
        schedule_message = "pending manual review"
    
    logger.info(f"✅ Call scheduled {schedule_message} with ID: {call_id}")
    logger.info(f"📞 Priority level: {data.priority.upper()}")
    logger.info(f"⚡ Urgency level: {data.urgency_level}/10")
    
    return CallResponse(
        status="Call trigger received and processed with priority settings",
        call_id=call_id,
        message=f"Call scheduled for {data.customer_name} about {data.product_name} with {data.priority} priority",
        scheduled_time=scheduled_time,
        priority_assigned=data.priority
    )

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Call System Integration API with Priority Settings"}

@app.get("/api/calls/status/{call_id}")
def get_call_status(call_id: str):
    """Get the status of a specific call"""
    # Extract priority from call ID
    priority = "unknown"
    if call_id.startswith("CALL-H-"):
        priority = "high"
    elif call_id.startswith("CALL-M-"):
        priority = "medium"
    elif call_id.startswith("CALL-L-"):
        priority = "low"
    
    return {
        "call_id": call_id,
        "status": "scheduled",
        "priority": priority,
        "message": f"Call is queued for processing with {priority} priority"
    }

@app.get("/api/calls/priority-queue")
def get_priority_queue():
    """Get the current priority queue status"""
    return {
        "high_priority_calls": 5,
        "medium_priority_calls": 12,
        "low_priority_calls": 8,
        "total_queued": 25,
        "processing_order": "High → Medium → Low priority"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)