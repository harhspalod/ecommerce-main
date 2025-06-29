from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import logging

app = FastAPI()

# Setup basic logging
logging.basicConfig(level=logging.INFO)

# Define expected structure of incoming call trigger data
class CallTriggerRequest(BaseModel):
    customer_name: str
    phone_number: str
    product_name: str
    discount: Optional[str] = None
    coupon_code: Optional[str] = None
    reason: str

@app.post("/api/campaigns/trigger-call")
def trigger_call(data: CallTriggerRequest):
    # Log the incoming data
    logging.info(f"Triggering call with data: {data}")
    print("🚀 Incoming Call Trigger JSON:")
    print(data.dict())
    
    # Here you can connect to Omnidimension or queue the call
    return {"status": "Call trigger received", "payload": data}
