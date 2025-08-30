# AlgoLogiX - Adaptive Logistics Optimizer

**Real-time, resource-constrained logistics optimization for developing regions**

AlgoLogiX addresses critical logistics challenges in Africa, Asia, and other developing regions where traditional route optimization fails due to unpredictable constraints like fuel shortages, poor road conditions, weather disruptions, and sudden demand spikes.

## Core Innovation

Unlike static routing algorithms (Dijkstra, A\*), AlgoLogiX combines multiple world-class algorithmic approaches:

- **Graph Algorithms**: Dijkstra & A\* for base routing layer
- **Bio-Inspired Optimization**: Ant Colony Optimization (ACO) and Genetic Algorithms (GA) for dynamic rerouting under uncertainty
- **Machine Learning**: Q-Learning reinforcement learning that adapts from historical routing failures
- **Approximation Algorithms**: Guaranteed "good enough" solutions for resource-constrained environments

## Key Features

- **Adaptive Rerouting**: Real-time route adjustment as constraints change
- **Resilience Score**: Novel metric measuring network's ability to handle disruptions
- **Multi-Vehicle Optimization**: Clarke-Wright savings algorithm for VRP solutions
- **Learning Loop**: System improves routing strategies from past experiences
- **Resource Awareness**: Handles fuel capacity, load limits, and infrastructure constraints

## Architecture

| **React Frontend** | **FastAPI Backend** | **Algorithm Core** |
| ------------------ | ------------------- | ------------------ |
| • Dashboard        | • REST API          | • ACO/GA           |
| • Vehicle Mgmt     | • State Store       | • Q-Learning       |
| • Route Viz        | • Event System      | • NetworkX         |
| • Event Sim        | • Resilience        | • VRP Solver       |

**Data Flow**: Frontend ↔ Backend API ↔ Algorithm Engine

**Tech Stack**:

- **Backend**: FastAPI + NetworkX + ACO/GA/RL algorithms
- **Frontend**: React dashboard with real-time visualization
- **State Management**: In-memory store with modular, swappable components

## Impact

Perfect for:

- **Last-Mile Delivery**: E-commerce and food delivery in challenging urban environments
- **Humanitarian Aid**: Emergency supply distribution in crisis zones
- **Rural Logistics**: Medical supplies, agricultural products in remote areas
- **Fleet Management**: Ride-sharing and transportation services
- **Supply Chain**: Manufacturing and retail distribution networks

## Algorithm Performance

### Initial Routing

- **Dijkstra's Algorithm**: O(E + V log V) shortest path computation
- **Clarke-Wright Savings**: VRP heuristic with capacity constraints
- **Greedy Assignment**: Nearest vehicle allocation

### Adaptive Routing

- **Genetic Algorithm**: Population-based job reassignment
- **Ant Colony Optimization**: Pheromone-based pathfinding
- **Q-Learning**: State-action value learning with ε-greedy exploration
- **Real-time Adaptation**: Sub-second response to disruption events

### Resilience Metrics

- **Completion Rate**: Percentage of deliveries completed under constraints
- **Cost Efficiency**: Total routing cost vs baseline
- **Adaptation Speed**: Time to recompute after disruptions
- **Learning Curve**: Performance improvement over time

## Research & Algorithms

### Core Algorithms Implemented

1. **Graph Theory**: Dijkstra, A\*, Johnson's Algorithm
2. **Metaheuristics**: Ant Colony Optimization, Genetic Algorithms
3. **Machine Learning**: Q-Learning, Temporal Difference Learning
4. **Operations Research**: Vehicle Routing Problem, Capacity Constraints
5. **Approximation**: Greedy algorithms for real-time performance

### Novel Contributions

- **Hybrid ACO-GA Approach**: Combines exploration and exploitation
- **Resilience Score Formula**: Quantifies network adaptability
- **Dynamic Constraint Handling**: Real-time capacity and infrastructure updates
- **Learning-Enhanced Routing**: Historical performance improves future decisions

## Testing

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Frontend tests (if implemented)
cd frontend
npm test
```

## Documentation

- [API Documentation](http://localhost:8000/docs) - Interactive Swagger docs
- [Algorithm Details](algorithms.md) - Deep dive into implementations
