# AlgoLogiX Technical Documentation

This document provides technical details about **datasets, models, and the step-by-step architecture** of AlgoLogiX, as required for hackathon submission.

---

## 1. Dataset Details

AlgoLogiX operates on **graph-structured data** that represents logistics networks.

### Synthetic Dataset
- **Nodes (n_nodes):** Each node represents a location — depot, delivery point, or intersection.
- **Edges:** Roads connecting nodes, each with a weight (distance or travel time).
- **Weights:** By default, Euclidean distances between randomly generated coordinates. Adjusted dynamically when disruptions occur (e.g., road block multiplies weight ×10).

### Input Structures
- **Vehicles:** JSON list with parameters:
  - `id` → unique identifier
  - `start_node` → node where vehicle begins
  - `fuel_capacity` → how far it can travel
  - `load_capacity` → maximum deliveries it can carry

- **Deliveries:** JSON list with parameters:
  - `id` → delivery ID
  - `node` → delivery location node
  - `demand` → package size/weight
  - `deadline` (optional) → delivery time constraint

- **Events:** JSON list representing disruptions:
  - `road_block`: blocks edge(s)
  - `fuel_shortage`: reduces vehicle fuel capacity
  - `new_order`: adds new delivery

### Example Dataset Snippet
```json
{
  "n_nodes": 10,
  "vehicles": [
    {"id": "truck_1", "start_node": 0, "fuel_capacity": 100, "load_capacity": 20}
  ],
  "deliveries": [
    {"id": "d1", "node": 5, "demand": 3},
    {"id": "d2", "node": 7, "demand": 4}
  ],
  "events": [
    {"type": "road_block", "edge": [3, 4]}
  ]
}
```

---

## 2. Models & Algorithms Implemented

AlgoLogiX combines several algorithmic paradigms to balance speed, robustness, and adaptability.

### 2.1 Graph Algorithms (Dijkstra & A*)
- **Purpose:** Compute baseline shortest paths between nodes.
- **Library:** `networkx`
- **Benefit:** Provides deterministic, guaranteed-optimal routes as fallback.

### 2.2 VRP Heuristic (Clarke-Wright Inspired)
- **Purpose:** Initial allocation of deliveries to multiple vehicles.
- **Method:** Greedy nearest-vehicle assignment with capacity constraints.
- **Benefit:** Produces a quick, feasible baseline solution.

### 2.3 Ant Colony Optimization (ACO)
- **Purpose:** Dynamic rerouting when disruptions occur.
- **Method:** Probabilistic path selection guided by pheromone trails and heuristic visibility.
- **Benefit:** Adapts well to changing road conditions.

### 2.4 Genetic Algorithm (GA)
- **Purpose:** Reassign deliveries across vehicles when resources change.
- **Method:** Chromosome encodes assignments; crossover + mutation evolve better solutions.
- **Benefit:** Handles sudden resource constraints gracefully.

### 2.5 Reinforcement Learning (Q-Learning)
- **Purpose:** Learn from past disruptions to improve future routing.
- **Method:** Tabular Q-learning with states = disruptions, actions = assignments.
- **Benefit:** Demonstrates adaptivity and learning over repeated runs.

### 2.6 Resilience Score (Novel Metric)
- **Purpose:** Evaluate system robustness under disruption.
- **Formula:**
```
Resilience Score = (Completed Deliveries / Total Deliveries) * (Adaptation Success Rate) * 100
```
- **Benefit:** Provides a simple, judge-friendly KPI for adaptability.

---

## 3. Step-by-Step Solution Architecture

AlgoLogiX backend is built with **FastAPI** and follows a modular service-oriented architecture.

### Step 1: Input & Graph Construction
- API accepts JSON with `n_nodes`, `vehicles`, `deliveries`, and `events`.
- Synthetic graph generated with nodes & edges (random or dataset-based).
- Edge weights = distances; updated when disruptions occur.

### Step 2: Initial Planning
- Compute shortest paths using Dijkstra/A*.
- Apply VRP heuristic to assign deliveries to vehicles.
- Generate baseline cost and feasible route plan.

### Step 3: Adaptive Optimization
- If events occur:
  - **ACO** reroutes around blocked edges.
  - **GA** reallocates deliveries if capacity/fuel constraints change.
  - **Q-learning** logs disruption–action–reward to improve policy.

### Step 4: Evaluation
- Compute **Resilience Score** based on completed deliveries vs disruptions.
- Expose routes, costs, and score via REST API.

### Step 5: Outputs
- **Routes:** Ordered list of nodes for each vehicle.
- **Metrics:** Total cost, resilience score.
- **Details:** Segments used, adaptations applied.

### Step 6: Documentation & Presentation
- **Video Demo:** Visual walkthrough of routing before and after disruptions.
- **Algorithms.md:** Deep dive into algorithmic design (see separate file).

---

## 4. System Diagram

```text
        +-------------+        +-------------------+
        |   Client    | <----> |   FastAPI Server  |
        +-------------+        +-------------------+
                                     |
                        +------------+-------------+
                        |                          |
                +-------+------+         +---------+-------+
                | Graph & VRP  |         | Adaptive Layer  |
                | (Dijkstra,   |         | (ACO, GA, RL)   |
                | A*)          |         |                 |
                +--------------+         +-----------------+
                        |                          |
                +-------+------+         +---------+-------+
                | Resilience   |         | Output Routes   |
                | Score Calc   |         | & Metrics       |
                +--------------+         +-----------------+
```

---

## 🔑 Summary
- **Dataset:** Synthetic logistics graphs (nodes, edges, vehicles, deliveries, disruptions).
- **Models:** Graph algorithms, VRP heuristic, ACO, GA, Q-learning.
- **Architecture:** Modular FastAPI backend with adaptive optimization pipeline.
- **Output:** Feasible, adaptive, and resilient logistics routes.

This structured design ensures AlgoLogiX is hackathon-ready, impactful, and easy to present.

