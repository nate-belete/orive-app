"""
Script to generate OpenAPI contract from the FastAPI app.
Run this after starting the backend server.
"""
import json
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

if __name__ == "__main__":
    openapi_schema = app.openapi()
    
    # Ensure contracts directory exists
    contracts_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "contracts")
    os.makedirs(contracts_dir, exist_ok=True)
    
    output_path = os.path.join(contracts_dir, "openapi.json")
    
    with open(output_path, "w") as f:
        json.dump(openapi_schema, f, indent=2)
    
    print(f"OpenAPI contract generated at: {output_path}")

