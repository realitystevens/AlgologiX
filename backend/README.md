# AlgoLogiX – Backend

FastAPI service that implements the AlgoLogiX idea: initial shortest-path routing, adaptive re-routing with **Ant Colony Optimization (ACO)** and **Genetic Algorithm (GA)** heuristics, a simple **Q-Learning** feedback loop, and a **Resilience Score**. Uses **NetworkX** for graph ops. Includes a lightweight in-memory state store and clean modular architecture so users can swap components later.

URL to Backend - [algologix-api.vercel.app/](https://algologix-api.vercel.app/)

## Features:

- Initial routing: Dijkstra/A\* over a road graph (NetworkX)
- VRP heuristic: Clarke–Wright savings for multi-vehicle assignment
- Adaptive rerouting: Ant Colony Optimization (exploration) + GA (assignment evolution)
- Learning loop: tabular Q-Learning over simplified states/actions
- Resilience Score: measures ability to complete tasks under disruptions

## Quickstart

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload
```

## Example API

- `POST /graph/load` – load or generate a demo graph
- `POST /vehicles` – register vehicles
- `POST /deliveries` – register delivery jobs
- `POST /route/initial` – compute initial routes (Dijkstra + VRP)
- `POST /events` – post disruptions (road block, fuel shortage, new order)
- `POST /route/adaptive` – recompute using ACO/GA + constraints
- `GET  /score/resilience` – get current resilience score

Use with a React/Mapbox dashboard for demos.
