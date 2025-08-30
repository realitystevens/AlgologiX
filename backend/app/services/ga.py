import random
from typing import Dict, List


class GAPlanner:
    def __init__(self, vehicles: dict, jobs: dict, pop: int, gens: int):
        self.vehicles = vehicles
        self.jobs = jobs
        self.pop = pop
        self.gens = gens

    def _random_chrom(self) -> Dict[str, List[str]]:
        ids = list(self.jobs.keys())
        random.shuffle(ids)
        buckets = {vid: [] for vid in self.vehicles}
        for i, jid in enumerate(ids):
            vid = list(self.vehicles.keys())[i % len(self.vehicles)]
            buckets[vid].append(jid)
        return buckets

    def _fitness(self, chrom: Dict[str, List[str]]) -> float:
        # Simple penalty for capacity violation + route length proxy (#stops)
        penalty = 0.0
        cost = 0.0
        for vid, arr in chrom.items():
            cap = self.vehicles[vid].load_capacity
            demand = sum(self.jobs[j].demand for j in arr)
            if demand > cap:
                penalty += (demand - cap) * 100.0
            cost += len(arr)
        return -(cost + penalty)

    def _mutate(self, chrom: Dict[str, List[str]], rate: float = 0.2):
        if random.random() < rate:
            # move one job between vehicles
            vs = list(chrom.keys())
            a, b = random.sample(vs, 2)
            if chrom[a]:
                j = random.choice(chrom[a])
                chrom[a].remove(j)
                chrom[b].append(j)

    def _crossover(self, c1, c2):
        child = {vid: [] for vid in self.vehicles}
        for vid in child:
            set1 = set(c1[vid])
            set2 = set(c2[vid])
            inter = list(set1 & set2)
            child[vid] = inter
        # add missing jobs
        all_jobs = set(self.jobs.keys())
        assigned = set(j for arr in child.values() for j in arr)
        missing = list(all_jobs - assigned)
        random.shuffle(missing)
        for j in missing:
            vid = random.choice(list(child.keys()))
            child[vid].append(j)
        return child

    def plan(self) -> Dict[str, List[str]]:
        pop = [self._random_chrom() for _ in range(self.pop)]
        for _ in range(self.gens):
            pop.sort(key=self._fitness, reverse=True)
            elite = pop[: max(2, self.pop // 5)]
            children = elite.copy()
            while len(children) < self.pop:
                p1, p2 = random.sample(elite, 2)
                child = self._crossover(p1, p2)
                self._mutate(child)
                children.append(child)
            pop = children
        pop.sort(key=self._fitness, reverse=True)
        return pop[0]
