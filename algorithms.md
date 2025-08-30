## Algorithms behind AlgoLogiX

This document explains the core algorithms behind **AlgoLogiX** and how they fit together in the backend you have. It maps design choices to concrete implementations in the codebase and provides enough detail to reproduce or swap components during the hackathon.

---

## 0) Problem Model

We model a delivery region as a **weighted, undirected graph** \(G=(V,E,w)\):
- **V**: intersections / depots / delivery nodes
- **E**: roads between nodes
- **w(u,v)**: traversal cost (e.g., Euclidean distance; penalty-inflated if disrupted)

We also track:
- A set of **vehicles** \(\mathcal{K}\) with start node, fuel capacity \(F_k\), and load capacity \(C_k\)
- A set of **jobs** (deliveries) \(\mathcal{J}\) each at a node with demand \(d_j\) and optional deadline
- A stream of **events** (road blocks, fuel shortage, new orders) that change costs or constraints during runtime

The goal: **assign jobs to vehicles** and **plan routes** to minimize total cost (distance/time) while respecting capacities and adapting in real time when the world changes.

---

## 1) Initial Routing: Shortest Paths + VRP Heuristic

### 1.1 Shortest Paths (Dijkstra / A*)
We use NetworkX’s weighted shortest paths to get fast baselines. For synthetic graphs, edge weights are Euclidean distances between node coordinates.

- **Dijkstra** complexity: \(O\big((|E|+|V|)\log |V|\big)\) with a binary heap.
- **A*** (optional) uses a consistent heuristic (straight-line distance) and typically explores fewer nodes in geometric graphs.

**Why**: Reliable, deterministic, repeatable. A baseline any judge will expect.

### 1.2 Multi‑Vehicle Assignment (VRP seed via Clarke–Wright style)**
We use a **simple, explainable heuristic** to seed multi-vehicle plans:
1. Precompute SP distance \(dist(k, j)\) from each vehicle \(k\) to each job \(j\)
2. Assign each job to the nearest vehicle that has remaining capacity \(C_k\)
3. Greedily chain jobs into a path per vehicle by concatenating SP paths

This produces an **initial feasible plan** and a **total cost** that the adaptive layer can subsequently improve.

Trade‑off: This isn’t an optimal VRP solver, but it is **fast** and **robust** for live demos and gives the adaptive layer something to refine.

---

## 2) Adaptive Rerouting: Ant Colony Optimization (ACO)

When disruptions happen (e.g., "road_block"), edge weights are **inflated** (e.g., ×10). We then explore alternative paths with **ACO**, which balances exploitation (pheromone trails) and exploration (randomized selection):

### 2.1 State and Parameters
- Pheromone on edges: \(\tau_{uv} \in \mathbb{R}^+\) (initialized to 1)
- Heuristic visibility: \(\eta_{uv} = 1 / w(u,v)\)
- Hyperparameters: \(\alpha\) (pheromone weight), \(\beta\) (visibility weight), evaporation rate \(\rho\)

### 2.2 Transition Rule
From node \(u\), the probability to choose neighbor \(v\) among unvisited neighbors \(N_u\):
\[
P(u\to v) = \frac{\tau_{uv}^{\alpha} \cdot \eta_{uv}^{\beta}}{ \sum\limits_{x\in N_u} \tau_{ux}^{\alpha} \cdot \eta_{ux}^{\beta} }.
\]

### 2.3 Pheromone Update
After each iteration (many ants), we **evaporate** and **deposit**:
\[
\tau_{uv} \leftarrow (1-\rho)\,\tau_{uv} + \sum_{k\in\text{ants}} \frac{\Delta_{uv}^{(k)}}{L^{(k)}},\quad \Delta_{uv}^{(k)} = \begin{cases}1 & \text{if } (u,v) \in \text{path}^{(k)}\\0 & \text{otherwise}\end{cases}
\]
where \(L^{(k)}\) is the length of ant \(k\)'s path.

### 2.4 Termination and Fallback
We run for a fixed number of iterations and ants (hackathon-friendly). If no valid path is found (rare on connected graphs), we fall back to Dijkstra.

**Complexity**: Roughly \(O(\text{iters} \times \text{ants} \times \bar{d} \times |V|)\), where \(\bar{d}\) is avg degree. Tunable for demo speed.

**Why ACO?** Naturally suited to **dynamic graphs**; pheromones make good use of recent successful detours without getting stuck when costs change.

---

## 3) Assignment Refinement: Genetic Algorithm (GA)

We re-balance jobs across vehicles after disruptions or capacity changes using a simple, explainable **GA**.

### 3.1 Encoding (Chromosome)
A chromosome is a dict: \(\text{chrom}[k] = [j_1, j_2, ...]\), the **set/order of jobs** for vehicle \(k\). All jobs across vehicles cover \(\mathcal{J}\) exactly once.

### 3.2 Fitness
We reward lower stop counts and penalize capacity violations:
\[
\text{fitness}(\text{chrom}) = -\Big( \sum_{k\in\mathcal{K}} |\text{chrom}[k]| + \sum_{k\in\mathcal{K}} \max(0, \text{demand}(k) - C_k) \times \lambda \Big),
\]
with \(\lambda\) a large penalty (e.g., 100). You can extend fitness to include deadlines or fuel consumption.

### 3.3 Operators
- **Crossover**: Intersection-per-vehicle + fill missing jobs randomly (keeps common structure, introduces diversity)
- **Mutation**: With some probability, move a random job between vehicles

### 3.4 Loop
1. Initialize population with random feasible (or near-feasible) chromosomes
2. Sort by fitness; keep elite
3. Produce children via crossover + mutation until population is refilled
4. Repeat for \(G\) generations; return the best

**Complexity**: \(O(\text{pop}\times G\times f)\) where \(f\) is time to evaluate fitness. Small constants work well for hackathons.

**Why GA?** Flexible, easy to explain, good for **re-allocating jobs** when constraints change.

---

## 4) Learning From Experience: Tabular Q‑Learning

We use a **minimalist feedback loop** to showcase adaptivity over time. After each recomputation, we compute a reward \(r\) based on completed jobs and total cost and update a Q-table.

### 4.1 State & Action
- **State** \(s\): a summary of disruptions (e.g., set of blocked edges)
- **Action** \(a\): the assignment result (vehicle \(\to\) ordered list of jobs)

### 4.2 Update Rule
Given learning rate \(\alpha\), discount \(\gamma\), and policy with exploration \(\epsilon\):
\[
Q(s,a) \leftarrow Q(s,a) + \alpha\left[r + \gamma\max_{a'} Q(s',a') - Q(s,a)\right]
\]
We keep \(s'=s\) for simplicity (myopic update) but the interface supports a richer state transition if you later log episodes.

### 4.3 Reward
A simple, shaped reward that encourages more completed jobs per unit cost:
\[
 r = \frac{\#\text{jobs completed}}{1 + \text{total cost}}
\]
You can extend this with on-time delivery bonuses or fuel savings.

**Why Q-Learning here?** To **demonstrate learning behavior** without heavy infra. It’s intentionally small but extensible to DQN later.

---

## 5) Resilience Score

A user-facing metric that reflects the network’s ability to maintain service under disruption:
\[
\text{Resilience} = \frac{\#\text{completed jobs}}{1 + \kappa\cdot \text{route length proxy} + \#\text{active blocks}}
\]
The current implementation uses total path length proxy (sum of node hops × small factor) as \(\kappa\)-scaled penalty. This is easy to compute and visually correlates with robustness in demos.

**Why define a new metric?** Judges appreciate a clear, consistent KPI beyond raw distance; “resilience” makes adaptivity measurable.

---

## 6) Putting It Together: Adaptive Pipeline

1. **Baseline**: Use SP + VRP heuristic to create the initial plan.
2. **Event arrives** (road block, fuel drop, new order):
   - Edge weights inflated / vehicle capacity reduced / jobs appended
3. **GA** reassigns jobs across vehicles (capacity-aware)
4. **ACO** computes segment paths between successive stops along new assignments
5. **Q-learning** logs outcome and updates Q(s,a)
6. **Resilience Score** updated for monitoring

This loop is idempotent and can be re-run on every event or on a timer.

---

## 7) Implementation Mapping (Codebase)

- **Graph ops**: `app/services/graph.py` (load synthetic graph, path lengths)
- **Initial plan**: `app/services/vrp.py` (nearest-vehicle + greedy chaining)
- **ACO**: `app/services/aco.py` (pheromone dict, probabilistic next-hop, evaporation, deposit)
- **GA planner**: `app/services/ga.py` (chromosome = dict vehicle→jobs, fitness, crossover, mutation)
- **Adaptive orchestration**: `app/services/adaptive.py` (events→recompute; ACO per segment; GA assignment; Q-learning update)
- **Resilience**: `app/services/resilience.py`
- **State store**: `app/store/state.py`
- **Config**: `app/core/config.py` (hyperparameters)
- **API**: `app/api/routes.py`

---

## 8) Key Data Structures

- **Graph**: NetworkX `Graph` with `weight` on edges
- **Vehicles**: dict `id → VehicleIn(start_node, fuel_capacity, load_capacity)`
- **Deliveries**: dict `id → DeliveryIn(node, demand, deadline?)`
- **Blocked edges**: set of `(u,v)` pairs; we penalize their weights instead of removing edges (keeps graph connected)
- **Routes**: dict `vehicle_id → [node0, node1, …]`

---

## 9) Parameter Tuning (Hackathon Defaults)

- **ACO**: `ants=20`, `iters=20`, `alpha=1`, `beta=3`, `evap=0.5`
- **GA**: `pop=30`, `gens=25`, `penalty λ=100`
- **RL**: `α=0.1`, `γ=0.9`, `ε=0.2`

**Tips**: Lower ants/iters for faster demos; increase when recording final video for smoother routes. Keep GA `pop` modest to avoid long recompute times.

---

## 10) Complexity Snapshot

- SP (per query): \(O((|E|+|V|)\log |V|)\)
- ACO (path): \(O(\text{iters}·\text{ants}·\bar{d}·|V|)\)
- GA (assignment): \(O(\text{pop}·\text{gens}·f)\)
- End-to-end recompute per event: additive of GA + ACO segments (usually manageable for \(|V|\le 500\) in demos)

---

## 11) Edge Cases & Safeguards

- **Disconnected graphs**: we stitch components when generating synthetic graphs
- **No ACO path found**: fallback to Dijkstra
- **Severe capacity shortage**: GA still returns a best‑effort plan; penalty reveals the problem; UI can surface a “capacity alert”
- **Hot edges**: inflation×10 on blocks retains reachability but discourages usage; tune factor based on demo dynamics

---

## 12) Extensions (Post‑Hackathon)

- Replace tabular Q with **DQN** and richer state (time‑of‑day, weather, historical incidents)
- Add **time windows** and **deadlines** to GA fitness
- Incorporate **fuel consumption models** and refueling stops
- Use real **OSM** graphs + live traffic feeds; parallelize ACO with multiprocessing
- Swap GA with **ALNS** (Adaptive Large Neighborhood Search) for stronger VRP performance

---

## 13) Minimal Pseudocode (Recompute)

```pseudo
function RECOMPUTE(G, vehicles, deliveries, blocked_edges):
    # Step 1: Job assignment via GA
    assign ← GA.plan(vehicles, deliveries)

    total_cost ← 0
    routes ← {}
    details ← {}

    # Step 2: Build each vehicle’s route via ACO segments
    for each vehicle k in vehicles:
        curr ← vehicles[k].start_node
        path_k ← [curr]
        segments_k ← []
        for job j in assign[k]:
            target ← deliveries[j].node
            sp ← ACO.best_path(G, curr, target)  # fallback to Dijkstra if None
            path_k ← path_k + sp[1:]
            total_cost ← total_cost + length(sp)
            segments_k.append({from: curr, to: target, len: |sp|})
            curr ← target
        routes[k] ← path_k
        details.segments[k] ← segments_k

    # Step 3: RL feedback
    s ← encode(blocked_edges)
    a ← encode(assign)
    r ← (#jobs completed) / (1 + total_cost)
    Q.update(s, a, r, s)

    return routes, total_cost, details
```
