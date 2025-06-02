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

class SearchQuery(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    query: str
    query_type: str = "natural_language"  # natural_language, filtered, keyword
    user_ip: Optional[str] = None
    user_agent: Optional[str] = None
    page_context: Optional[str] = None  # home, marketplace, etc.
    search_timestamp: datetime = Field(default_factory=datetime.utcnow)
    response_time_ms: Optional[float] = None
    results_count: Optional[int] = None
    clicked_result_ids: Optional[List[str]] = []
    session_id: Optional[str] = None

class SearchQueryCreate(BaseModel):
    query: str
    query_type: str = "natural_language"
    user_ip: Optional[str] = None
    user_agent: Optional[str] = None
    page_context: Optional[str] = None
    response_time_ms: Optional[float] = None
    results_count: Optional[int] = None
    session_id: Optional[str] = None

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

# Vessel API Endpoints

@api_router.post("/vessels", response_model=Vessel)
async def create_vessel(vessel: VesselCreate):
    """Create a new vessel listing"""
    vessel_dict = vessel.dict()
    vessel_obj = Vessel(**vessel_dict)
    result = await db.vessels.insert_one(vessel_obj.dict())
    return vessel_obj

@api_router.get("/vessels", response_model=List[Vessel])
async def get_vessels(
    search: Optional[str] = Query(None, description="Search query for vessel name, type, or location"),
    vessel_type: Optional[str] = Query(None, description="Filter by vessel type"),
    location: Optional[str] = Query(None, description="Filter by location"),
    min_daily_rate: Optional[float] = Query(None, description="Minimum daily rate"),
    max_daily_rate: Optional[float] = Query(None, description="Maximum daily rate"),
    min_year_built: Optional[int] = Query(None, description="Minimum year built"),
    max_year_built: Optional[int] = Query(None, description="Maximum year built"),
    availability_status: Optional[str] = Query(None, description="Filter by availability status"),
    is_featured: Optional[bool] = Query(None, description="Filter featured vessels"),
    tags: Optional[str] = Query(None, description="Comma-separated tags to filter by"),
    features: Optional[str] = Query(None, description="Comma-separated features to filter by"),
    sort_by: Optional[str] = Query("featured", description="Sort by: featured, price-low, price-high, rating, newest"),
    limit: Optional[int] = Query(50, description="Number of vessels to return"),
    offset: Optional[int] = Query(0, description="Number of vessels to skip")
):
    """Get vessels with filtering and search capabilities"""
    
    # Build MongoDB query
    query = {}
    
    # Search functionality
    if search:
        search_regex = re.compile(search, re.IGNORECASE)
        query["$or"] = [
            {"vessel_name": search_regex},
            {"vessel_type": search_regex},
            {"location": search_regex},
            {"tags": {"$in": [search_regex]}},
            {"features": {"$in": [search_regex]}}
        ]
    
    # Filters
    if vessel_type:
        query["vessel_type"] = vessel_type
    
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    if min_daily_rate is not None:
        query["daily_rate"] = {"$gte": min_daily_rate}
    
    if max_daily_rate is not None:
        if "daily_rate" in query:
            query["daily_rate"]["$lte"] = max_daily_rate
        else:
            query["daily_rate"] = {"$lte": max_daily_rate}
    
    if min_year_built is not None:
        query["specifications.year_built"] = {"$gte": min_year_built}
    
    if max_year_built is not None:
        if "specifications.year_built" in query:
            query["specifications.year_built"]["$lte"] = max_year_built
        else:
            query["specifications.year_built"] = {"$lte": max_year_built}
    
    if availability_status:
        query["availability_status"] = availability_status
    
    if is_featured is not None:
        query["is_featured"] = is_featured
    
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    
    if features:
        feature_list = [feature.strip() for feature in features.split(",")]
        query["features"] = {"$in": feature_list}
    
    # Sorting
    sort_criteria = []
    if sort_by == "price-low":
        sort_criteria = [("daily_rate", 1)]
    elif sort_by == "price-high":
        sort_criteria = [("daily_rate", -1)]
    elif sort_by == "rating":
        sort_criteria = [("rating", -1)]
    elif sort_by == "newest":
        sort_criteria = [("created_at", -1)]
    else:  # featured
        sort_criteria = [("is_featured", -1), ("rating", -1)]
    
    # Execute query
    cursor = db.vessels.find(query)
    if sort_criteria:
        cursor = cursor.sort(sort_criteria)
    
    cursor = cursor.skip(offset).limit(limit)
    vessels = await cursor.to_list(length=limit)
    
    return [Vessel(**vessel) for vessel in vessels]

@api_router.get("/vessels/{vessel_id}", response_model=Vessel)
async def get_vessel(vessel_id: str):
    """Get a specific vessel by ID"""
    vessel = await db.vessels.find_one({"id": vessel_id})
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    return Vessel(**vessel)

@api_router.put("/vessels/{vessel_id}", response_model=Vessel)
async def update_vessel(vessel_id: str, vessel_update: VesselCreate):
    """Update a vessel"""
    update_dict = vessel_update.dict()
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.vessels.update_one(
        {"id": vessel_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vessel not found")
    
    updated_vessel = await db.vessels.find_one({"id": vessel_id})
    return Vessel(**updated_vessel)

@api_router.delete("/vessels/{vessel_id}")
async def delete_vessel(vessel_id: str):
    """Delete a vessel"""
    result = await db.vessels.delete_one({"id": vessel_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vessel not found")
    return {"message": "Vessel deleted successfully"}

@api_router.get("/vessels/search/suggestions")
async def get_search_suggestions(q: str = Query(..., description="Search query")):
    """Get search suggestions for vessels"""
    if len(q) < 2:
        return {"suggestions": []}
    
    search_regex = re.compile(q, re.IGNORECASE)
    
    # Get unique vessel types, locations, and tags that match
    pipeline = [
        {
            "$match": {
                "$or": [
                    {"vessel_type": search_regex},
                    {"location": search_regex},
                    {"tags": {"$in": [search_regex]}},
                    {"vessel_name": search_regex}
                ]
            }
        },
        {
            "$group": {
                "_id": None,
                "vessel_types": {"$addToSet": "$vessel_type"},
                "locations": {"$addToSet": "$location"},
                "tags": {"$addToSet": "$tags"}
            }
        }
    ]
    
    result = await db.vessels.aggregate(pipeline).to_list(1)
    
    suggestions = []
    if result:
        data = result[0]
        # Add matching vessel types
        for vt in data.get("vessel_types", []):
            if re.search(search_regex, vt):
                suggestions.append({"type": "vessel_type", "value": vt})
        
        # Add matching locations
        for loc in data.get("locations", []):
            if re.search(search_regex, loc):
                suggestions.append({"type": "location", "value": loc})
        
        # Add matching tags
        for tag_list in data.get("tags", []):
            for tag in tag_list:
                if re.search(search_regex, tag) and tag not in [s["value"] for s in suggestions]:
                    suggestions.append({"type": "tag", "value": tag})
    
    return {"suggestions": suggestions[:10]}  # Limit to 10 suggestions

@api_router.get("/vessels/types/list")
async def get_vessel_types():
    """Get list of all vessel types"""
    vessel_types = await db.vessels.distinct("vessel_type")
    return {"vessel_types": vessel_types}

@api_router.get("/vessels/locations/list")
async def get_locations():
    """Get list of all locations"""
    locations = await db.vessels.distinct("location")
    return {"locations": locations}

@api_router.get("/vessels/tags/list")
async def get_tags():
    """Get list of all tags"""
    tags = await db.vessels.distinct("tags")
    flattened_tags = []
    for tag_list in tags:
        if isinstance(tag_list, list):
            flattened_tags.extend(tag_list)
        else:
            flattened_tags.append(tag_list)
    return {"tags": list(set(flattened_tags))}

@api_router.get("/vessels/features/list")
async def get_features():
    """Get list of all features"""
    features = await db.vessels.distinct("features")
    flattened_features = []
    for feature_list in features:
        if isinstance(feature_list, list):
            flattened_features.extend(feature_list)
        else:
            flattened_features.append(feature_list)
    return {"features": list(set(flattened_features))}

# Seed data endpoint for development
@api_router.post("/vessels/seed")
async def seed_vessels():
    """Seed the database with sample vessels for development"""
    
    # Check if vessels already exist
    count = await db.vessels.count_documents({})
    if count > 0:
        return {"message": f"Database already contains {count} vessels. Skipping seed."}
    
    sample_vessels = [
        {
            "vessel_name": "Ocean Pioneer PSV",
            "vessel_type": "Platform Supply Vessel",
            "location": "Aberdeen, Scotland",
            "daily_rate": 15000,
            "weekly_rate": 98000,
            "monthly_rate": 420000,
            "images": ["https://images.unsplash.com/photo-1568347877321-f8935c7dc5a3"],
            "specifications": {
                "length": 76,
                "crew_capacity": 28,
                "tonnage": 3200,
                "year_built": 2018,
                "deck_space": 650,
                "fuel_capacity": 1200
            },
            "availability_status": "Available",
            "rating": 4.8,
            "total_reviews": 42,
            "tags": ["DP2", "Offshore", "North Sea"],
            "is_featured": True,
            "discount_percentage": 15,
            "features": ["Dynamic Positioning", "ROV Support", "Crane Capability", "Mud Tanks"],
            "description": "Modern PSV with excellent safety record and experienced crew."
        },
        {
            "vessel_name": "Atlantic Anchor AHTS",
            "vessel_type": "Anchor Handling Tug Supply",
            "location": "Houston, Texas",
            "daily_rate": 22000,
            "weekly_rate": 140000,
            "monthly_rate": 600000,
            "images": ["https://images.unsplash.com/photo-1609337231803-2adad48ea1d1"],
            "specifications": {
                "length": 89,
                "crew_capacity": 35,
                "tonnage": 4500,
                "year_built": 2020,
                "deck_space": 800
            },
            "availability_status": "Limited",
            "rating": 4.9,
            "total_reviews": 38,
            "tags": ["DP3", "Heavy Lifting", "Gulf of Mexico"],
            "features": ["Advanced DP System", "Heavy Anchor Handling", "Towing Capability"],
            "description": "High-spec AHTS vessel perfect for demanding offshore operations."
        },
        {
            "vessel_name": "Nordic Crew Boat",
            "vessel_type": "Crew Transfer Vessel",
            "location": "Stavanger, Norway",
            "daily_rate": 8500,
            "weekly_rate": 52000,
            "monthly_rate": 220000,
            "images": ["https://images.unsplash.com/photo-1601311852860-1d8f42381551"],
            "specifications": {
                "length": 42,
                "crew_capacity": 60,
                "tonnage": 450,
                "year_built": 2019
            },
            "availability_status": "Available",
            "rating": 4.6,
            "total_reviews": 29,
            "tags": ["High Speed", "Passenger", "North Sea"],
            "features": ["High Speed Transfer", "Weather Protection", "Helipad"],
            "description": "Fast and efficient crew transfer vessel for North Sea operations."
        },
        {
            "vessel_name": "Deep Sea Constructor",
            "vessel_type": "Construction Support Vessel",
            "location": "Singapore",
            "daily_rate": 35000,
            "weekly_rate": 230000,
            "monthly_rate": 980000,
            "images": ["https://images.unsplash.com/photo-1568347877321-f8935c7dc5a3"],
            "specifications": {
                "length": 145,
                "crew_capacity": 120,
                "tonnage": 12000,
                "year_built": 2017,
                "deck_space": 2400
            },
            "availability_status": "Available",
            "rating": 4.9,
            "total_reviews": 56,
            "tags": ["DP3", "Heavy Lift", "Construction"],
            "is_featured": True,
            "features": ["Heavy Lift Crane", "ROV Support", "Diving Support", "Large Deck"],
            "description": "Specialized construction vessel for complex offshore projects."
        },
        {
            "vessel_name": "Wind Farm Support",
            "vessel_type": "Wind Farm Support Vessel",
            "location": "Amsterdam, Netherlands",
            "daily_rate": 18000,
            "weekly_rate": 115000,
            "monthly_rate": 490000,
            "images": ["https://images.unsplash.com/photo-1568347877321-f8935c7dc5a3"],
            "specifications": {
                "length": 78,
                "crew_capacity": 40,
                "tonnage": 3800,
                "year_built": 2021
            },
            "availability_status": "Available",
            "rating": 4.7,
            "total_reviews": 23,
            "tags": ["DP2", "Wind Farm", "Green Energy"],
            "features": ["Offshore Wind Support", "Walk-to-Work", "DP System"],
            "description": "Modern vessel designed specifically for offshore wind operations."
        },
        {
            "vessel_name": "Subsea Explorer",
            "vessel_type": "Dive Support Vessel",
            "location": "Rio de Janeiro, Brazil",
            "daily_rate": 28000,
            "weekly_rate": 180000,
            "monthly_rate": 770000,
            "images": ["https://images.unsplash.com/photo-1609337231803-2adad48ea1d1"],
            "specifications": {
                "length": 95,
                "crew_capacity": 80,
                "tonnage": 5200,
                "year_built": 2016
            },
            "availability_status": "Available",
            "rating": 4.8,
            "total_reviews": 44,
            "tags": ["DP3", "Saturation Diving", "ROV"],
            "features": ["Saturation Diving", "ROV Operations", "Hyperbaric Chamber"],
            "description": "Advanced dive support vessel for deep water operations."
        }
    ]
    
    # Create Vessel objects and insert them
    vessels_to_insert = []
    for vessel_data in sample_vessels:
        vessel_obj = Vessel(**vessel_data)
        vessels_to_insert.append(vessel_obj.dict())
    
    result = await db.vessels.insert_many(vessels_to_insert)
    
    return {
        "message": f"Successfully seeded {len(result.inserted_ids)} vessels",
        "vessel_ids": [str(id) for id in result.inserted_ids]
    }

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
