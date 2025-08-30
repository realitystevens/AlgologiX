from typing import Dict, List
import networkx as nx
from app.store.state import db
from app.services.aco import ACO
from app.services.ga import GAPlanner
from app.services.graph import GraphService
from app.services.rl import QLearner

class AdaptiveService:
    def __init__(self, _db):
        self.db = _db
        self.graph = GraphService(_db)
        self.ql = QLearner()

    def ingest_event(self, event):
        etype = event.type
        payload = event.payload
        if etype == 'road_block':
            u, v = payload['u'], payload['v']
            if self.db.G.has_edge(u, v):
                self.db.blocked_edges.add((u, v))
                self.db.G[u][v]['weight'] *= 10.0  # heavy penalty instead of removal
        elif etype == 'fuel_shortage':
            vid = payload['vehicle_id']
            amt = payload['reduction']
            if vid in self.db.vehicles:
                self.db.vehicles[vid].fuel_capacity = max(0.0, self.db.vehicles[vid].fuel_capacity - amt)
        elif etype == 'new_order':
            d = payload
            self.db.deliveries[d['id']] = d  # lightweight; schemas handled at API layer
        else:
            pass

    def _aco_sp(self, src: int, dst: int) -> List[int]:
        aco = ACO(self.db.G)
        path = aco.best_path(src, dst)
        if not path:
            # fallback to Dijkstra
            path = nx.shortest_path(self.db.G, src, dst, weight='weight')
        return path

    def recompute(self) -> tuple[Dict[str, List[int]], float, Dict]:
        # 1) GA to re-assign jobs under new capacities
        ga = GAPlanner(self.db.vehicles, self.db.deliveries, pop=20, gens=20)
        assign = ga.plan()  # {vehicle_id: [delivery_ids]}

        # 2) For each vehicle, create path chaining ACO shortest paths between successive stops
        routes: Dict[str, List[int]] = {}
        total_cost = 0.0
        details = {"segments": {}}
        for vid, jids in assign.items():
            vehicle = self.db.vehicles[vid]
            curr = vehicle.start_node
            path = [curr]
            vehicle_cost = 0.0
            segments = []
            for jid in jids:
                node = self.db.deliveries[jid].node
                sp = self._aco_sp(curr, node)
                segments.append({"from": curr, "to": node, "len": len(sp)})
                path.extend(sp[1:])
                # cost
                for u, v in zip(sp[:-1], sp[1:]):
                    vehicle_cost += self.db.G.edges[u, v]['weight']
                curr = node
            routes[vid] = path
            total_cost += vehicle_cost
            details["segments"][vid] = segments

        # 3) RL feedback: simple reward based on inverse cost and #completed jobs
        state = tuple(sorted((e for e in self.db.blocked_edges)))
        action = tuple(sorted(( (vid, tuple(assign[vid])) for vid in assign )))
        reward = sum(len(j) for j in assign.values()) / (1.0 + total_cost)
        self.ql.update(state, action, reward, state, [action])

        return routes, total_cost, details
