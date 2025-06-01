import requests
import sys
import json
from datetime import datetime
import time

class MaritimeMarketplaceTester:
    def __init__(self, base_url="https://555f0a6d-41ba-4a3f-9c43-1485469147fc.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_vessel_id = None

    def run_test(self, name, endpoint="", expected_status=200, method="GET", data=None, check_json=True, params=None):
        """Run a single test against the backend API"""
        url = f"{self.api_url}/{endpoint}".rstrip('/')
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        if params:
            print(f"Params: {params}")
        if data:
            print(f"Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == "GET":
                response = requests.get(url, params=params)
            elif method == "POST":
                response = requests.post(url, json=data)
            elif method == "PUT":
                response = requests.put(url, json=data)
            elif method == "DELETE":
                response = requests.delete(url)
            
            status_success = response.status_code == expected_status
            
            # Try to parse JSON response if check_json is True
            json_success = True
            response_data = None
            if check_json and status_success:
                try:
                    response_data = response.json()
                    # Print truncated response for large responses
                    if isinstance(response_data, list) and len(response_data) > 2:
                        print(f"Response data: (showing first 2 of {len(response_data)} items)")
                        print(json.dumps(response_data[:2], indent=2))
                    else:
                        print(f"Response data: {json.dumps(response_data, indent=2)}")
                except Exception as e:
                    json_success = False
                    print(f"❌ Failed to parse JSON response: {str(e)}")
                    print(f"Response text: {response.text}")
            
            success = status_success and (not check_json or json_success)
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
            else:
                print(f"❌ Failed - Expected status {expected_status}, got {response.status_code}")
                if not json_success:
                    print("❌ Failed - Could not parse JSON response")
                
            return success, response, response_data
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None, None

    def test_api_root(self):
        """Test the API root endpoint"""
        success, response, data = self.run_test("API Root Endpoint", "")
        if success:
            print("API root endpoint returned successfully")
            if data and "message" in data:
                print(f"Message: {data['message']}")
        return success, data

    def test_status_check_create(self):
        """Test creating a status check"""
        test_data = {
            "client_name": "Backend Test Client"
        }
        success, response, data = self.run_test(
            "Create Status Check", 
            "status", 
            method="POST", 
            data=test_data
        )
        if success:
            print("Status check created successfully")
            if data and "id" in data:
                print(f"Created status check with ID: {data['id']}")
        return success, data

    def test_status_check_list(self):
        """Test listing status checks"""
        success, response, data = self.run_test("List Status Checks", "status")
        if success:
            print("Status checks retrieved successfully")
            if isinstance(data, list):
                print(f"Retrieved {len(data)} status checks")
                if data:
                    print(f"First status check: {json.dumps(data[0], indent=2)}")
        return success, data
    
    # Vessel API Tests
    
    def test_seed_vessels(self):
        """Test seeding the database with sample vessels"""
        success, response, data = self.run_test(
            "Seed Vessels", 
            "vessels/seed", 
            method="POST"
        )
        if success:
            print("Vessels seeded successfully")
            if data and "message" in data:
                print(f"Message: {data['message']}")
        return success, data
    
    def test_get_vessels(self):
        """Test getting all vessels"""
        success, response, data = self.run_test("Get All Vessels", "vessels")
        if success:
            print("Vessels retrieved successfully")
            if isinstance(data, list):
                print(f"Retrieved {len(data)} vessels")
                if data:
                    # Save the first vessel ID for later tests
                    self.created_vessel_id = data[0]["id"]
        return success, data
    
    def test_get_vessels_with_filters(self):
        """Test getting vessels with various filters"""
        # Test with vessel type filter
        params = {"vessel_type": "Platform Supply Vessel"}
        success1, response1, data1 = self.run_test(
            "Get Vessels by Type", 
            "vessels", 
            params=params
        )
        
        # Test with location filter
        params = {"location": "Aberdeen"}
        success2, response2, data2 = self.run_test(
            "Get Vessels by Location", 
            "vessels", 
            params=params
        )
        
        # Test with price range filter
        params = {"min_daily_rate": 10000, "max_daily_rate": 25000}
        success3, response3, data3 = self.run_test(
            "Get Vessels by Price Range", 
            "vessels", 
            params=params
        )
        
        # Test with search query
        params = {"search": "PSV"}
        success4, response4, data4 = self.run_test(
            "Search Vessels", 
            "vessels", 
            params=params
        )
        
        # Test with sorting
        params = {"sort_by": "price-low"}
        success5, response5, data5 = self.run_test(
            "Get Vessels Sorted by Price (Low to High)", 
            "vessels", 
            params=params
        )
        
        # Test with pagination
        params = {"limit": 2, "offset": 0}
        success6, response6, data6 = self.run_test(
            "Get Vessels with Pagination", 
            "vessels", 
            params=params
        )
        
        return all([success1, success2, success3, success4, success5, success6])
    
    def test_get_vessel_by_id(self):
        """Test getting a specific vessel by ID"""
        if not self.created_vessel_id:
            print("❌ No vessel ID available for testing")
            return False, None
        
        success, response, data = self.run_test(
            "Get Vessel by ID", 
            f"vessels/{self.created_vessel_id}"
        )
        if success:
            print(f"Vessel with ID {self.created_vessel_id} retrieved successfully")
        return success, data
    
    def test_create_vessel(self):
        """Test creating a new vessel"""
        test_data = {
            "vessel_name": "Test Vessel",
            "vessel_type": "Test Vessel Type",
            "location": "Test Location",
            "daily_rate": 10000,
            "weekly_rate": 65000,
            "monthly_rate": 280000,
            "images": ["https://example.com/test-image.jpg"],
            "specifications": {
                "length": 50,
                "crew_capacity": 20,
                "tonnage": 2000,
                "year_built": 2022
            },
            "tags": ["Test", "API"],
            "features": ["Test Feature 1", "Test Feature 2"]
        }
        
        success, response, data = self.run_test(
            "Create Vessel", 
            "vessels", 
            method="POST", 
            data=test_data
        )
        if success:
            print("Vessel created successfully")
            if data and "id" in data:
                self.created_vessel_id = data["id"]
                print(f"Created vessel with ID: {self.created_vessel_id}")
        return success, data
    
    def test_update_vessel(self):
        """Test updating a vessel"""
        if not self.created_vessel_id:
            print("❌ No vessel ID available for testing")
            return False, None
        
        test_data = {
            "vessel_name": "Updated Test Vessel",
            "vessel_type": "Updated Test Vessel Type",
            "location": "Updated Test Location",
            "daily_rate": 12000,
            "tags": ["Updated", "API Test"]
        }
        
        success, response, data = self.run_test(
            "Update Vessel", 
            f"vessels/{self.created_vessel_id}", 
            method="PUT", 
            data=test_data
        )
        if success:
            print(f"Vessel with ID {self.created_vessel_id} updated successfully")
        return success, data
    
    def test_delete_vessel(self):
        """Test deleting a vessel"""
        if not self.created_vessel_id:
            print("❌ No vessel ID available for testing")
            return False, None
        
        success, response, data = self.run_test(
            "Delete Vessel", 
            f"vessels/{self.created_vessel_id}", 
            method="DELETE"
        )
        if success:
            print(f"Vessel with ID {self.created_vessel_id} deleted successfully")
        return success, data
    
    def test_search_suggestions(self):
        """Test search suggestions endpoint"""
        params = {"q": "PSV"}
        success, response, data = self.run_test(
            "Get Search Suggestions", 
            "vessels/search/suggestions", 
            params=params
        )
        if success:
            print("Search suggestions retrieved successfully")
            if data and "suggestions" in data:
                print(f"Retrieved {len(data['suggestions'])} suggestions")
        return success, data
    
    def test_get_vessel_types(self):
        """Test getting all vessel types"""
        success, response, data = self.run_test("Get Vessel Types", "vessels/types/list")
        if success:
            print("Vessel types retrieved successfully")
            if data and "vessel_types" in data:
                print(f"Retrieved {len(data['vessel_types'])} vessel types")
        return success, data
    
    def test_get_locations(self):
        """Test getting all locations"""
        success, response, data = self.run_test("Get Locations", "vessels/locations/list")
        if success:
            print("Locations retrieved successfully")
            if data and "locations" in data:
                print(f"Retrieved {len(data['locations'])} locations")
        return success, data
    
    def test_get_tags(self):
        """Test getting all tags"""
        success, response, data = self.run_test("Get Tags", "vessels/tags/list")
        if success:
            print("Tags retrieved successfully")
            if data and "tags" in data:
                print(f"Retrieved {len(data['tags'])} tags")
        return success, data
    
    def test_get_features(self):
        """Test getting all features"""
        success, response, data = self.run_test("Get Features", "vessels/features/list")
        if success:
            print("Features retrieved successfully")
            if data and "features" in data:
                print(f"Retrieved {len(data['features'])} features")
        return success, data

def main():
    print("🚢 Testing Maritime Marketplace Backend API 🚢")
    
    # Setup - use the public URL from frontend/.env
    tester = MaritimeMarketplaceTester("https://555f0a6d-41ba-4a3f-9c43-1485469147fc.preview.emergentagent.com")
    print(f"Testing with API URL: {tester.api_url}")
    
    # Test API root endpoint
    api_root_success, _ = tester.test_api_root()
    
    # Test status check endpoints
    status_create_success, created_status = tester.test_status_check_create()
    status_list_success, _ = tester.test_status_check_list()
    
    # Test vessel API endpoints
    print("\n🚢 Testing Vessel API Endpoints 🚢")
    
    # First seed the database with sample vessels
    seed_success, _ = tester.test_seed_vessels()
    
    # Test getting vessels with various filters
    get_vessels_success, _ = tester.test_get_vessels()
    get_vessels_filters_success = tester.test_get_vessels_with_filters()
    
    # Test getting a specific vessel
    get_vessel_by_id_success, _ = tester.test_get_vessel_by_id()
    
    # Test CRUD operations
    create_vessel_success, _ = tester.test_create_vessel()
    update_vessel_success, _ = tester.test_update_vessel()
    
    # Test search suggestions and metadata endpoints
    search_suggestions_success, _ = tester.test_search_suggestions()
    get_vessel_types_success, _ = tester.test_get_vessel_types()
    get_locations_success, _ = tester.test_get_locations()
    get_tags_success, _ = tester.test_get_tags()
    get_features_success, _ = tester.test_get_features()
    
    # Finally, test deleting a vessel
    delete_vessel_success, _ = tester.test_delete_vessel()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    # Return success if all tests passed
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
