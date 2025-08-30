from app.store.state import db

class ResilienceService:
    def __init__(self, _db):
        self.db = _db

    def compute(self) -> float:
        # Simple proxy: completed_jobs / (1 + cost_penalty + active_blocks)
        completed = len(self.db.deliveries)
        cost_penalty = 0.0
        if self.db.routes:
            # sum rough path length
            cost_penalty = sum(len(p) for p in self.db.routes.values()) * 0.01
        blocks = len(self.db.blocked_edges)
        score = completed / (1.0 + cost_penalty + blocks)
        return round(score, 4)
