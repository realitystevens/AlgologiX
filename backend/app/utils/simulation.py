import random
from app.store.state import db

ROAD_BLOCK_PROB = 0.05

def random_event():
    r = random.random()
    if r < ROAD_BLOCK_PROB and db.G is not None:
        # pick a random edge
        edges = list(db.G.edges)
        if not edges:
            return None
        u, v = random.choice(edges)
        return {"type": "road_block", "payload": {"u": u, "v": v}}
    return None
