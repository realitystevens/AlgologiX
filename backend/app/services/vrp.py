from typing import Dict, List
import networkx as nx
from app.store.state import db


class VRPService:
    def __init__(self, _db):
        self.db = _db

    def initial_plan(self) -> tuple[Dict[str, List[int]], float]:
        """Clarke–Wright savings-style heuristic over pairwise shortest paths.
        Simplified: assign each delivery to the nearest vehicle by SP, chain greedily.
        """
        G: nx.Graph = self.db.G
        vehicles = self.db.vehicles
        deliveries = list(self.db.deliveries.values())

        # Precompute SP distances from each vehicle start to delivery nodes
        sp_cache = {}
        for vid, v in vehicles.items():
            sp_cache[vid] = {}
            for d in deliveries:
                path = nx.shortest_path(
                    G, v.start_node, d.node, weight='weight')
                dist = nx.path_weight(G, path, weight='weight')
                sp_cache[vid][d.id] = (dist, path)

        # Assign each delivery to the vehicle with min distance (capacity respected)
        remaining_capacity = {
            vid: vehicles[vid].load_capacity for vid in vehicles}
        assignments: Dict[str, List[int]] = {
            vid: [vehicles[vid].start_node] for vid in vehicles}
        total_cost = 0.0

        for d in sorted(deliveries, key=lambda x: x.demand, reverse=True):
            best = None
            for vid in vehicles:
                if remaining_capacity[vid] >= d.demand:
                    dist, path = sp_cache[vid][d.id]
                    if best is None or dist < best[0]:
                        best = (dist, path, vid)
            if best is None:
                # if no capacity, assign to vehicle with most capacity (fallback)
                vid = max(remaining_capacity,
                          key=lambda k: remaining_capacity[k])
                dist, path = sp_cache[vid][d.id]
            else:
                dist, path, vid = best
            # append path (avoid duplicating start node)
            assignments[vid] += path[1:]
            remaining_capacity[vid] -= d.demand
            total_cost += dist

        return assignments, total_cost
