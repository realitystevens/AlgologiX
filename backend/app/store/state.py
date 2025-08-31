from dataclasses import dataclass, field
from typing import Dict, TYPE_CHECKING
from app.models.schemas import VehicleIn, DeliveryIn

if TYPE_CHECKING:
    import networkx as nx

@dataclass
class DBState:
    G: 'nx.Graph | None' = None
    vehicles: Dict[str, VehicleIn] = field(default_factory=dict)
    deliveries: Dict[str, DeliveryIn] = field(default_factory=dict)
    blocked_edges: set[tuple[int, int]] = field(default_factory=set)
    routes: Dict[str, list[int]] = field(default_factory=dict)

db = DBState()
