from fastapi import FastAPI
from app.api.routes import router as api_router
from app.core.config import settings

app = FastAPI(
    title="AlgoLogiX Backend",
    version="0.1.0",
    description="Adaptive logistics optimizer with ACO/GA/RL",
)

app.include_router(api_router)


@app.get("/")
def root():
    return {"name": "AlgoLogiX Backend", "env": settings.ENV}
