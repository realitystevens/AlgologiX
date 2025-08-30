from dataclasses import dataclass, field
import networkx as nx
from typing import Dict
from app.models.schemas import VehicleIn, DeliveryIn

@dataclass
class DBState:
    G: nx.Graph | None = None
    vehicles: Dict[str, VehicleIn] = field(default_factory=dict)
    deliveries: Dict[str, DeliveryIn] = field(default_factory=dict)
    blocked_edges: set[tuple[int, int]] = field(default_factory=set)
    routes: Dict[str, list[int]] = field(default_factory=dict)

db = DBState()
