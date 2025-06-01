import requests
import sys
import json
from datetime import datetime

class OSVMarketplaceTester:
    def __init__(self, base_url="https://555f0a6d-41ba-4a3f-9c43-1485469147fc.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, url_path="", expected_status=200, method="GET", data=None):
        """Run a single test against the frontend application"""
        url = f"{self.base_url}/{url_path}"
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == "GET":
                response = requests.get(url)
            elif method == "POST":
                response = requests.post(url, json=data)
            
            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                
            return success, response
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_homepage(self):
        """Test the homepage is accessible"""
        success, response = self.run_test("Homepage", "")
        if success:
            print("Homepage content received successfully")
        return success, response

    def test_marketplace(self):
        """Test the marketplace page is accessible"""
        success, response = self.run_test("Marketplace", "marketplace")
        if success:
            print("Marketplace page content received successfully")
        return success, response

    def test_vessel_detail(self, vessel_id):
        """Test a specific vessel detail page"""
        success, response = self.run_test(f"Vessel Detail (ID: {vessel_id})", f"marketplace/{vessel_id}")
        if success:
            print(f"Vessel detail page for ID {vessel_id} loaded successfully")
        return success, response
    
    def test_ai_search_api(self, query_params):
        """Test the AI search API endpoint"""
        endpoint = "api/vessels/search"
        query_string = "&".join([f"{key}={value}" for key, value in query_params.items()])
        url_path = f"{endpoint}?{query_string}"
        
        success, response = self.run_test(f"AI Search API with params: {query_params}", url_path)
        
        if success:
            try:
                data = response.json()
                vessel_count = len(data)
                print(f"AI Search returned {vessel_count} vessels")
                if vessel_count > 0:
                    print(f"Sample vessel: {data[0]['name']} ({data[0]['vessel_type']})")
                return True, data
            except Exception as e:
                print(f"❌ Failed to parse response: {str(e)}")
                return False, None
        return False, None

def main():
    print("🚢 Testing OSV AI-Powered Marketplace 🚢")
    
    # Setup - use the public URL
    tester = OSVMarketplaceTester("https://555f0a6d-41ba-4a3f-9c43-1485469147fc.preview.emergentagent.com")
    print(f"Testing with URL: {tester.base_url}")
    
    # Test homepage
    homepage_success, _ = tester.test_homepage()
    if not homepage_success:
        print("❌ Homepage test failed, but continuing with other tests")
    
    # Test marketplace
    marketplace_success, _ = tester.test_marketplace()
    if not marketplace_success:
        print("❌ Marketplace test failed, but continuing with other tests")
    
    # Test AI Search API with different query parameters
    
    # Basic Queries
    print("\n🧠 Testing Basic AI Search Queries:")
    
    # Test PSV DP2 North Sea
    psv_dp2_params = {
        "query": "PSV DP2 North Sea"
    }
    psv_dp2_success, _ = tester.test_ai_search_api(psv_dp2_params)
    
    # Test AHTS with bollard pull
    ahts_params = {
        "query": "AHTS 120T bollard pull"
    }
    ahts_success, _ = tester.test_ai_search_api(ahts_params)
    
    # Test Crew boat Malaysia
    crew_boat_params = {
        "query": "Crew boat Malaysia"
    }
    crew_boat_success, _ = tester.test_ai_search_api(crew_boat_params)
    
    # Complex Queries
    print("\n🧠 Testing Complex AI Search Queries:")
    
    # "Need a PSV DP2 for North Sea operations, 30 days"
    complex_query1 = {
        "query": "Need a PSV DP2 for North Sea operations, 30 days"
    }
    complex_query1_success, _ = tester.test_ai_search_api(complex_query1)
    
    # "AHTS with 100T+ bollard pull Gulf of Mexico immediate"
    complex_query2 = {
        "query": "AHTS with 100T+ bollard pull Gulf of Mexico immediate"
    }
    complex_query2_success, _ = tester.test_ai_search_api(complex_query2)
    
    # "Dive support vessel with crane Brazil subsea work"
    complex_query3 = {
        "query": "Dive support vessel with crane Brazil subsea work"
    }
    complex_query3_success, _ = tester.test_ai_search_api(complex_query3)
    
    # Ambiguous Queries
    print("\n🧠 Testing Ambiguous AI Search Queries:")
    
    # "big boat"
    ambiguous_query1 = {
        "query": "big boat"
    }
    ambiguous_query1_success, _ = tester.test_ai_search_api(ambiguous_query1)
    
    # "vessel for towing"
    ambiguous_query2 = {
        "query": "vessel for towing"
    }
    ambiguous_query2_success, _ = tester.test_ai_search_api(ambiguous_query2)
    
    # "something offshore"
    ambiguous_query3 = {
        "query": "something offshore"
    }
    ambiguous_query3_success, _ = tester.test_ai_search_api(ambiguous_query3)
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    # Return success if all tests passed
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
