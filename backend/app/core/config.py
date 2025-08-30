from pydantic import BaseModel
import os


class Settings(BaseModel):
    ENV: str = os.getenv("ENV", "dev")
    DEFAULT_GRAPH_N: int = int(os.getenv("DEFAULT_GRAPH_N", 50))
    ACO_ANTS: int = int(os.getenv("ACO_ANTS", 20))
    ACO_ITERS: int = int(os.getenv("ACO_ITERS", 20))
    GA_POP: int = int(os.getenv("GA_POP", 30))
    GA_GENS: int = int(os.getenv("GA_GENS", 25))
    RL_ALPHA: float = float(os.getenv("RL_ALPHA", 0.1))
    RL_GAMMA: float = float(os.getenv("RL_GAMMA", 0.9))
    RL_EPSILON: float = float(os.getenv("RL_EPSILON", 0.2))


settings = Settings()
