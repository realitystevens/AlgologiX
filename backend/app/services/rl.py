from collections import defaultdict
import random
from app.core.config import settings


class QLearner:
    def __init__(self, alpha=None, gamma=None, epsilon=None):
        self.alpha = settings.RL_ALPHA if alpha is None else alpha
        self.gamma = settings.RL_GAMMA if gamma is None else gamma
        self.epsilon = settings.RL_EPSILON if epsilon is None else epsilon
        # Q[state][action] -> value
        self.Q = defaultdict(lambda: defaultdict(float))

    def choose(self, state, actions):
        if not actions:
            return None
        if random.random() < self.epsilon:
            return random.choice(actions)
        # greedy
        return max(actions, key=lambda a: self.Q[state][a])

    def update(self, s, a, r, s_next, actions_next):
        max_next = max([self.Q[s_next][an]
                       for an in actions_next], default=0.0)
        self.Q[s][a] += self.alpha * (r + self.gamma * max_next - self.Q[s][a])
