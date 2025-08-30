from fastapi import APIRouter, HTTPException
from typing import List

from app.models.schemas import (
    GraphLoadRequest, VehicleIn, DeliveryIn, EventIn,
    InitialRouteResponse, AdaptiveRouteResponse, ResilienceScoreResponse
)
from app.services.graph import GraphService
from app.services.vrp import VRPService
from app.services.adaptive import AdaptiveService
from app.services.resilience import ResilienceService
from app.store.state import db

router = APIRouter()

graph_service = GraphService(db)
vrp_service = VRPService(db)
adaptive_service = AdaptiveService(db)
resilience_service = ResilienceService(db)

@router.post("/graph/load")
def load_graph(req: GraphLoadRequest):
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
    routes, cost = vrp_service.initial_plan()
    db.routes = routes
    return InitialRouteResponse(routes=routes, total_cost=cost)

@router.post("/events")
def post_event(event: EventIn):
    adaptive_service.ingest_event(event)
    return {"status": "ok"}

@router.post("/route/adaptive", response_model=AdaptiveRouteResponse)
def adaptive_route():
    if db.G is None:
        raise HTTPException(400, "Graph not loaded")
    routes, cost, details = adaptive_service.recompute()
    db.routes = routes
    return AdaptiveRouteResponse(routes=routes, total_cost=cost, details=details)

@router.get("/score/resilience", response_model=ResilienceScoreResponse)
def resilience_score():
    score = resilience_service.compute()
    return ResilienceScoreResponse(score=score)
