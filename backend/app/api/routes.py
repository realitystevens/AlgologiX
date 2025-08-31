from fastapi import APIRouter, HTTPException
from typing import List

from app.models.schemas import (
    GraphLoadRequest, VehicleIn, DeliveryIn, EventIn,
    InitialRouteResponse, AdaptiveRouteResponse, ResilienceScoreResponse
)
from app.store.state import db

router = APIRouter()

# Lazy load services to reduce initial import time
def get_graph_service():
    from app.services.graph import GraphService
    return GraphService(db)

def get_vrp_service():
    from app.services.vrp import VRPService
    return VRPService(db)

def get_adaptive_service():
    from app.services.adaptive import AdaptiveService
    return AdaptiveService(db)

def get_resilience_service():
    from app.services.resilience import ResilienceService
    return ResilienceService(db)

@router.post("/graph/load")
def load_graph(req: GraphLoadRequest):
    graph_service = get_graph_service()
    graph_service.load_graph(req)
    return {"status": "ok", "nodes": db.G.number_of_nodes(), "edges": db.G.number_of_edges()}

@router.post("/vehicles")
def register_vehicles(vehicles: List[VehicleIn]):
    db.vehicles = {v.id: v for v in vehicles}
    return {"status": "ok", "count": len(db.vehicles)}

@router.post("/deliveries")
def register_deliveries(deliveries: List[DeliveryIn]):
    db.deliveries = {d.id: d for d in deliveries}
    return {"status": "ok", "count": len(db.deliveries)}

@router.post("/route/initial", response_model=InitialRouteResponse)
def initial_route():
    if db.G is None:
        raise HTTPException(400, "Graph not loaded")
    if not db.vehicles or not db.deliveries:
        raise HTTPException(400, "Vehicles and deliveries required")
    vrp_service = get_vrp_service()
    routes, cost = vrp_service.initial_plan()
    db.routes = routes
    return InitialRouteResponse(routes=routes, total_cost=cost)

@router.post("/events")
def post_event(event: EventIn):
    adaptive_service = get_adaptive_service()
    adaptive_service.ingest_event(event)
    return {"status": "ok"}

@router.post("/route/adaptive", response_model=AdaptiveRouteResponse)
def adaptive_route():
    if db.G is None:
        raise HTTPException(400, "Graph not loaded")
    adaptive_service = get_adaptive_service()
    routes, cost, details = adaptive_service.recompute()
    db.routes = routes
    return AdaptiveRouteResponse(routes=routes, total_cost=cost, details=details)

@router.get("/score/resilience", response_model=ResilienceScoreResponse)
def resilience_score():
    resilience_service = get_resilience_service()
    score = resilience_service.compute()
    return ResilienceScoreResponse(score=score)
