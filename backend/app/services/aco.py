import random
from typing import List
import networkx as nx
from app.core.config import settings


class ACO:
    def __init__(self, G: nx.Graph, alpha: float = 1.0, beta: float = 3.0, evap: float = 0.5):
        self.G = G
        self.alpha = alpha
        self.beta = beta
        self.evap = evap
        self.pher = {e: 1.0 for e in G.edges}

    def _prob(self, u: int, v: int) -> float:
        tau = self.pher.get((u, v), self.pher.get((v, u), 1.0)) ** self.alpha
        eta = (1.0 / self.G.edges[u, v]['weight']) ** self.beta
        return tau * eta

    def _choose_next(self, u: int, visited: set[int]):
        nbrs = [v for v in self.G.neighbors(u) if v not in visited]
        if not nbrs:
            return None
        weights = [self._prob(u, v) for v in nbrs]
        s = sum(weights)
        if s == 0:
            return random.choice(nbrs)
        r = random.random() * s
        cum = 0
        for v, w in zip(nbrs, weights):
            cum += w
            if r <= cum:
                return v
        return nbrs[-1]

    def _path_length(self, path: List[int]) -> float:
        return sum(self.G.edges[u, v]['weight'] for u, v in zip(path[:-1], path[1:]))

    def best_path(self, src: int, dst: int) -> List[int]:
        best_path = None
        best_len = float('inf')
        for _ in range(settings.ACO_ITERS):
            candidates = []
            for _ in range(settings.ACO_ANTS):
                visited = {src}
                curr = src
                path = [src]
                while curr != dst:
                    nxt = self._choose_next(curr, visited)
                    if nxt is None:
                        break
                    path.append(nxt)
                    visited.add(nxt)
                    curr = nxt
                if path[-1] == dst:
                    L = self._path_length(path)
                    candidates.append((L, path))
            # evaporate
            for e in list(self.pher.keys()):
                self.pher[e] *= (1 - self.evap)
            # deposit
            if candidates:
                Lmin, Pmin = min(candidates, key=lambda x: x[0])
                if Lmin < best_len:
                    best_len, best_path = Lmin, Pmin
                for L, P in candidates:
                    for u, v in zip(P[:-1], P[1:]):
                        key = (u, v) if (u, v) in self.pher else (v, u)
                        self.pher[key] = self.pher.get(key, 0.0) + 1.0 / L
        return best_path
