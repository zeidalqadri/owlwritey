from fastapi import FastAPI, APIRouter, Query, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import re


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class VesselSpecifications(BaseModel):
    length: Optional[float] = None
    crew_capacity: Optional[int] = None
    tonnage: Optional[float] = None
    year_built: Optional[int] = None
    deck_space: Optional[float] = None
    fuel_capacity: Optional[float] = None

class Vessel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vessel_name: str
    vessel_type: str
    location: str
    daily_rate: Optional[float] = None
    weekly_rate: Optional[float] = None
    monthly_rate: Optional[float] = None
    images: Optional[List[str]] = []
    specifications: Optional[VesselSpecifications] = None
    availability_status: Optional[str] = "Available"
    rating: Optional[float] = None
    total_reviews: Optional[int] = None
    tags: Optional[List[str]] = []
    is_featured: Optional[bool] = False
    discount_percentage: Optional[float] = None
    features: Optional[List[str]] = []
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class VesselCreate(BaseModel):
    vessel_name: str
    vessel_type: str
    location: str
    daily_rate: Optional[float] = None
    weekly_rate: Optional[float] = None
    monthly_rate: Optional[float] = None
    images: Optional[List[str]] = []
    specifications: Optional[VesselSpecifications] = None
    availability_status: Optional[str] = "Available"
    rating: Optional[float] = None
    total_reviews: Optional[int] = None
    tags: Optional[List[str]] = []
    is_featured: Optional[bool] = False
    discount_percentage: Optional[float] = None
    features: Optional[List[str]] = []
    description: Optional[str] = None

class VesselSearchParams(BaseModel):
    search: Optional[str] = None
    vessel_type: Optional[str] = None
    location: Optional[str] = None
    min_daily_rate: Optional[float] = None
    max_daily_rate: Optional[float] = None
    min_year_built: Optional[int] = None
    max_year_built: Optional[int] = None
    availability_status: Optional[str] = None
    is_featured: Optional[bool] = None
    tags: Optional[List[str]] = None
    features: Optional[List[str]] = None
    sort_by: Optional[str] = "featured"  # featured, price-low, price-high, rating, newest
    limit: Optional[int] = 50
    offset: Optional[int] = 0

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
