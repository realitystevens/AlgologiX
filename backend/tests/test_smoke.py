from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_smoke():
    r = client.post("/graph/load", json={"mode": "synthetic", "n_nodes": 30})
    assert r.status_code == 200

    vehicles = [
        {"id": "v1", "start_node": 0, "fuel_capacity": 100, "load_capacity": 10},
        {"id": "v2", "start_node": 1, "fuel_capacity": 100, "load_capacity": 10},
    ]
    deliveries = [
        {"id": "d1", "node": 5, "demand": 2},
        {"id": "d2", "node": 10, "demand": 2},
        {"id": "d3", "node": 15, "demand": 2},
    ]

    assert client.post("/vehicles", json=vehicles).status_code == 200
    assert client.post("/deliveries", json=deliveries).status_code == 200

    r = client.post("/route/initial")
    assert r.status_code == 200
    data = r.json()
    assert "routes" in data

    # add event
    ev = {"type": "road_block", "payload": {"u": 0, "v": 1}}
    assert client.post("/events", json=ev).status_code == 200

    r = client.post("/route/adaptive")
    assert r.status_code == 200

    rs = client.get("/score/resilience")
    assert rs.status_code == 200
