import requests
import sys
import json
from datetime import datetime

class MaritimeMarketplaceTester:
    def __init__(self, base_url="https://555f0a6d-41ba-4a3f-9c43-1485469147fc.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, endpoint="", expected_status=200, method="GET", data=None, check_json=True):
        """Run a single test against the backend API"""
        url = f"{self.api_url}/{endpoint}".rstrip('/')
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == "GET":
                response = requests.get(url)
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
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    # Return success if all tests passed
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
