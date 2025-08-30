from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Tuple


class GraphLoadRequest(BaseModel):
    mode: str = Field("synthetic", description="synthetic | geojson (future)")
    n_nodes: int = 50
    seed: int = 42


class VehicleIn(BaseModel):
    id: str
    start_node: int
    fuel_capacity: float = 100.0
    load_capacity: float = 100.0


class DeliveryIn(BaseModel):
    id: str
    node: int
    demand: float = 1.0
    deadline: Optional[float] = None


class EventIn(BaseModel):
    type: str  # 'road_block' | 'fuel_shortage' | 'new_order'
    payload: dict


class InitialRouteResponse(BaseModel):
    routes: Dict[str, List[int]]  # vehicle_id -> path of nodes
    total_cost: float


class AdaptiveRouteResponse(InitialRouteResponse):
    details: Dict[str, Dict]


class ResilienceScoreResponse(BaseModel):
    score: float
