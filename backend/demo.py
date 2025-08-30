"""
Run a Demo of the application
"""
from fastapi.testclient import TestClient
from app.main import app
import json


def demo():
    client = TestClient(app)

    print("AlgoLogiX Backend Demo")
    print("=" * 40)

    # Load graph
    print("Loading synthetic graph...")
    r = client.post("/graph/load", json={"mode": "synthetic", "n_nodes": 30})
    print(f"Graph loaded: {r.json()}")

    # Register vehicles
    print("\nRegistering vehicles...")
    vehicles = [
        {"id": "v1", "start_node": 0, "fuel_capacity": 100, "load_capacity": 10},
        {"id": "v2", "start_node": 1, "fuel_capacity": 100, "load_capacity": 10},
    ]
    r = client.post("/vehicles", json=vehicles)
    print(f"Vehicles registered: {r.json()}")

    # Register deliveries
    print("\nRegistering deliveries...")
    deliveries = [
        {"id": "d1", "node": 5, "demand": 2},
        {"id": "d2", "node": 10, "demand": 2},
        {"id": "d3", "node": 15, "demand": 2},
    ]
    r = client.post("/deliveries", json=deliveries)
    print(f"Deliveries registered: {r.json()}")

    # Initial routing
    print("\nComputing initial routes...")
    r = client.post("/route/initial")
    routes = r.json()
    print(f"Initial routes computed:")
    print(json.dumps(routes, indent=2))

    # Add disruption
    print("\nAdding road block disruption...")
    ev = {"type": "road_block", "payload": {"u": 0, "v": 1}}
    r = client.post("/events", json=ev)
    print(f"Event added: {r.json()}")

    # Adaptive routing
    print("\nComputing adaptive routes...")
    r = client.post("/route/adaptive")
    adaptive_routes = r.json()
    print(f"Adaptive routes computed:")
    print(json.dumps(adaptive_routes, indent=2))

    # Resilience score
    print("\nComputing resilience score...")
    rs = client.get("/score/resilience")
    score = rs.json()
    print(f"Resilience score: {score}")

    print("\nDemo completed successfully!")



if __name__ == "__main__":
    demo()
