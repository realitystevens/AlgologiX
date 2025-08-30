import networkx as nx
import numpy as np
from dataclasses import dataclass
from typing import Dict, List
from app.models.schemas import GraphLoadRequest


@dataclass
class DB:
    G: nx.Graph | None


class GraphService:
    def __init__(self, db):
        self.db = db

    def load_graph(self, req: GraphLoadRequest):
        if req.mode == "synthetic":
            np.random.seed(req.seed)
            G = nx.random_geometric_graph(req.n_nodes, radius=0.25)
            # ensure connectivity by adding a spanning tree if needed
            if not nx.is_connected(G):
                components = list(nx.connected_components(G))
                for i in range(len(components)-1):
                    a = list(components[i])[0]
                    b = list(components[i+1])[0]
                    G.add_edge(a, b)
            # assign weights as Euclidean distances
            pos = nx.get_node_attributes(G, 'pos')
            for u, v in G.edges:
                du = np.array(pos[u])
                dv = np.array(pos[v])
                dist = float(np.linalg.norm(du - dv))
                G.edges[u, v]['weight'] = dist
            self.db.G = G
        else:
            raise NotImplementedError(
                "geojson loader not implemented in hackathon version")

    # basic SPs
    def shortest_path(self, src: int, dst: int) -> List[int]:
        return nx.shortest_path(self.db.G, source=src, target=dst, weight='weight')

    def path_length(self, path: List[int]) -> float:
        w = 0.0
        for u, v in zip(path[:-1], path[1:]):
            w += self.db.G.edges[u, v]['weight']
        return w
