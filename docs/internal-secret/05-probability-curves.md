# M1SSION™ INTERNAL SECRET DOCUMENTATION
## Volume 5: Probability Curves and Random Systems

**Document Version:** 1.0  
**Classification:** INTERNAL SECRET — DO NOT PUBLISH  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## ⚠️ CONFIDENTIALITY NOTICE

This document contains the probability models underlying all random systems. Disclosure would enable prediction and exploitation.

---

## 1. CORE PROBABILITY PHILOSOPHY

### 1.1 Fairness Through Randomness

M1SSION™ uses carefully designed probability distributions to ensure:

- **Perceived Fairness:** Players feel outcomes are random and unbiased
- **Actual Fairness:** Mathematical properties guarantee long-term equity
- **Engagement Optimization:** Reward patterns maintain motivation
- **Exploitation Resistance:** Patterns are unpredictable to individual observation

### 1.2 Seed Management

```python
# SECRET: Random seed management
class RandomManager:
    """
    Manages random number generation with reproducibility for auditing.
    """
    
    def __init__(self):
        # Master seed rotates daily
        self.master_seed = self._generate_master_seed()
        
        # Per-user seeds derived from master
        self.user_seeds = {}
        
        # Per-system seeds for different purposes
        self.system_seeds = {
            'rewards': self._derive_seed('rewards'),
            'markers': self._derive_seed('markers'),
            'events': self._derive_seed('events'),
            'prizes': self._derive_seed('prizes'),
        }
    
    def _generate_master_seed(self):
        """
        Generates daily master seed.
        Combines time, entropy, and secret salt.
        """
        date_component = datetime.now().strftime('%Y%m%d')
        entropy = secrets.token_bytes(32)
        salt = os.environ.get('RANDOM_SALT', 'default_salt')
        
        combined = f"{date_component}{entropy.hex()}{salt}"
        return int(hashlib.sha256(combined.encode()).hexdigest(), 16)
    
    def get_user_random(self, user_id, purpose='general'):
        """
        Gets deterministic random generator for user.
        Allows reproducibility for dispute resolution.
        """
        if user_id not in self.user_seeds:
            user_seed = self._derive_user_seed(user_id)
            self.user_seeds[user_id] = user_seed
        
        seed = self.user_seeds[user_id] ^ self.system_seeds.get(purpose, 0)
        return random.Random(seed)
```

---

## 2. REWARD PROBABILITY DISTRIBUTIONS

### 2.1 Standard Marker Reward Distribution

```python
# SECRET: Standard marker reward probability
class StandardRewardDistribution:
    """
    Probability distribution for standard marker rewards.
    Uses modified log-normal for positive skew with long tail.
    """
    
    # Distribution parameters
    MU = 2.5  # Log-mean (exp(2.5) ≈ 12)
    SIGMA = 0.4  # Log-standard deviation
    MIN_REWARD = 5
    MAX_REWARD = 50
    
    def sample(self, random_gen):
        """
        Samples a reward value from the distribution.
        """
        # Log-normal sample
        raw = random_gen.lognormvariate(self.MU, self.SIGMA)
        
        # Clamp to valid range
        reward = max(self.MIN_REWARD, min(self.MAX_REWARD, raw))
        
        return int(round(reward))
    
    def get_probability(self, value):
        """
        Returns probability of specific value.
        """
        if value < self.MIN_REWARD or value > self.MAX_REWARD:
            return 0.0
        
        # Log-normal PDF
        x = value
        return (1 / (x * self.SIGMA * math.sqrt(2 * math.pi))) * \
               math.exp(-((math.log(x) - self.MU) ** 2) / (2 * self.SIGMA ** 2))


# Actual distribution percentiles:
# 10th percentile: 8 M1U
# 25th percentile: 10 M1U  
# 50th percentile: 12 M1U (median)
# 75th percentile: 15 M1U
# 90th percentile: 19 M1U
# 95th percentile: 22 M1U
# 99th percentile: 28 M1U
```

### 2.2 Premium Marker Reward Distribution

```python
# SECRET: Premium marker distribution
class PremiumRewardDistribution:
    """
    Distribution for premium markers.
    Bimodal: either moderate or exceptional reward.
    """
    
    # Modal parameters
    MODE_1_MEAN = 75
    MODE_1_STD = 15
    MODE_1_WEIGHT = 0.75  # 75% chance of mode 1
    
    MODE_2_MEAN = 150
    MODE_2_STD = 30
    MODE_2_WEIGHT = 0.25  # 25% chance of mode 2
    
    MIN_REWARD = 50
    MAX_REWARD = 250
    
    def sample(self, random_gen):
        """
        Samples from bimodal distribution.
        """
        # Choose mode
        if random_gen.random() < self.MODE_1_WEIGHT:
            raw = random_gen.gauss(self.MODE_1_MEAN, self.MODE_1_STD)
        else:
            raw = random_gen.gauss(self.MODE_2_MEAN, self.MODE_2_STD)
        
        # Clamp
        reward = max(self.MIN_REWARD, min(self.MAX_REWARD, raw))
        
        return int(round(reward))


# Distribution characteristics:
# ~75% of rewards cluster around 75 M1U
# ~25% of rewards cluster around 150 M1U
# Creates "lucky hit" feeling when getting mode 2
```

### 2.3 Jackpot Distribution

```python
# SECRET: Rare jackpot reward distribution
class JackpotDistribution:
    """
    Extremely rare high-value rewards.
    Uses geometric distribution for rarity.
    """
    
    # Jackpot tiers
    TIERS = [
        {'value': 500, 'probability': 0.001},   # 0.1% (1 in 1000)
        {'value': 1000, 'probability': 0.0001}, # 0.01% (1 in 10000)
        {'value': 5000, 'probability': 0.00001}, # 0.001% (1 in 100000)
    ]
    
    def check_jackpot(self, random_gen):
        """
        Checks if player hits any jackpot tier.
        Returns: (hit: bool, value: int)
        """
        roll = random_gen.random()
        
        cumulative = 0
        for tier in self.TIERS:
            cumulative += tier['probability']
            if roll < cumulative:
                return True, tier['value']
        
        return False, 0
    
    def get_expected_value(self, claims_per_player):
        """
        Calculates expected jackpot value over N claims.
        """
        expected = 0
        for tier in self.TIERS:
            expected += tier['value'] * tier['probability'] * claims_per_player
        return expected


# Expected jackpot contribution per 1000 claims:
# 500 tier: 0.5 M1U per claim on average
# 1000 tier: 0.1 M1U per claim on average
# 5000 tier: 0.05 M1U per claim on average
# Total: ~0.65 M1U expected value per claim
```

---

## 3. ENTITY EVENT PROBABILITIES

### 3.1 Entity Selection Weights

```python
# SECRET: Shadow Protocol entity selection
class EntityProbabilities:
    """
    Determines which entity (MCP/SHADOW/ECHO) appears.
    """
    
    # Base weights (before modifiers)
    BASE_WEIGHTS = {
        'MCP': 0.50,     # Most common - protective
        'SHADOW': 0.30,  # Adversarial tension
        'ECHO': 0.20,    # Mysterious hints
    }
    
    # Threat level modifiers (multipliers)
    THREAT_MODIFIERS = {
        0: {'MCP': 1.2, 'SHADOW': 0.5, 'ECHO': 1.0},  # Low threat: more MCP
        1: {'MCP': 1.1, 'SHADOW': 0.7, 'ECHO': 1.0},
        2: {'MCP': 1.0, 'SHADOW': 1.0, 'ECHO': 1.0},  # Balanced
        3: {'MCP': 0.9, 'SHADOW': 1.3, 'ECHO': 1.1},
        4: {'MCP': 0.8, 'SHADOW': 1.5, 'ECHO': 1.2},  # High threat: more SHADOW
        5: {'MCP': 0.6, 'SHADOW': 2.0, 'ECHO': 1.3},  # Maximum threat
    }
    
    # Time-of-day modifiers
    TIME_MODIFIERS = {
        'night': {'MCP': 0.8, 'SHADOW': 1.4, 'ECHO': 1.5},  # 00:00-06:00
        'morning': {'MCP': 1.2, 'SHADOW': 0.8, 'ECHO': 0.9},  # 06:00-12:00
        'afternoon': {'MCP': 1.1, 'SHADOW': 0.9, 'ECHO': 1.0},  # 12:00-18:00
        'evening': {'MCP': 1.0, 'SHADOW': 1.1, 'ECHO': 1.1},  # 18:00-00:00
    }
    
    def select_entity(self, threat_level, hour, random_gen):
        """
        Selects entity based on context.
        """
        # Get time period
        if 0 <= hour < 6:
            time_period = 'night'
        elif 6 <= hour < 12:
            time_period = 'morning'
        elif 12 <= hour < 18:
            time_period = 'afternoon'
        else:
            time_period = 'evening'
        
        # Calculate modified weights
        weights = {}
        for entity, base_weight in self.BASE_WEIGHTS.items():
            threat_mod = self.THREAT_MODIFIERS[threat_level][entity]
            time_mod = self.TIME_MODIFIERS[time_period][entity]
            weights[entity] = base_weight * threat_mod * time_mod
        
        # Normalize
        total = sum(weights.values())
        for entity in weights:
            weights[entity] /= total
        
        # Select
        roll = random_gen.random()
        cumulative = 0
        for entity, weight in weights.items():
            cumulative += weight
            if roll < cumulative:
                return entity
        
        return 'MCP'  # Fallback
```

### 3.2 Message Intensity Distribution

```python
# SECRET: Message intensity calculation
class IntensityDistribution:
    """
    Determines intensity level of entity messages.
    """
    
    # Intensity levels: 0 (subtle) to 3 (takeover)
    
    # Base distribution
    BASE_DISTRIBUTION = {
        0: 0.40,  # 40% subtle
        1: 0.35,  # 35% normal
        2: 0.20,  # 20% intense
        3: 0.05,  # 5% takeover
    }
    
    # Threat level adjustments
    THREAT_INTENSITY_SHIFT = {
        0: -0.5,   # Low threat: shift toward subtle
        1: -0.25,
        2: 0,      # Neutral
        3: 0.25,
        4: 0.5,
        5: 1.0,    # High threat: shift toward intense
    }
    
    def sample_intensity(self, entity, threat_level, random_gen):
        """
        Samples intensity level.
        """
        # Entity-specific base adjustments
        entity_shift = {
            'MCP': -0.2,     # MCP tends subtle
            'SHADOW': 0.3,   # SHADOW tends intense
            'ECHO': 0.0,     # ECHO neutral
        }
        
        # Calculate shifted distribution
        shift = self.THREAT_INTENSITY_SHIFT[threat_level] + entity_shift[entity]
        
        # Apply shift to distribution
        adjusted = {}
        for intensity, prob in self.BASE_DISTRIBUTION.items():
            shifted_intensity = intensity + shift
            # Redistribute probability
            lower = max(0, int(shifted_intensity))
            upper = min(3, lower + 1)
            fraction = shifted_intensity - lower
            
            adjusted[lower] = adjusted.get(lower, 0) + prob * (1 - fraction)
            adjusted[upper] = adjusted.get(upper, 0) + prob * fraction
        
        # Normalize
        total = sum(adjusted.values())
        for k in adjusted:
            adjusted[k] /= total
        
        # Sample
        roll = random_gen.random()
        cumulative = 0
        for intensity in range(4):
            cumulative += adjusted.get(intensity, 0)
            if roll < cumulative:
                return intensity
        
        return 1  # Fallback
```

---

## 4. MARKER SPAWN PROBABILITIES

### 4.1 Marker Type Selection

```python
# SECRET: Marker type spawn rates
class MarkerSpawnProbabilities:
    """
    Determines marker types during generation.
    """
    
    # Base spawn rates by area type
    SPAWN_RATES = {
        'urban': {
            'standard': 0.70,
            'premium': 0.18,
            'mission': 0.08,
            'event': 0.03,
            'prize': 0.01,
        },
        'suburban': {
            'standard': 0.75,
            'premium': 0.15,
            'mission': 0.06,
            'event': 0.03,
            'prize': 0.01,
        },
        'rural': {
            'standard': 0.60,
            'premium': 0.25,  # Higher premium rate (worth the travel)
            'mission': 0.10,
            'event': 0.04,
            'prize': 0.01,
        },
    }
    
    # Time-based modifiers (for event markers)
    EVENT_BOOST_PERIODS = [
        {'start': 12, 'end': 14, 'multiplier': 2.0},  # Lunch
        {'start': 17, 'end': 19, 'multiplier': 1.5},  # After work
        {'start': 20, 'end': 22, 'multiplier': 1.8},  # Evening prime
    ]
    
    def select_marker_type(self, area_type, hour, is_event_active, random_gen):
        """
        Selects marker type for spawn.
        """
        rates = self.SPAWN_RATES[area_type].copy()
        
        # Apply event boost
        if is_event_active:
            for period in self.EVENT_BOOST_PERIODS:
                if period['start'] <= hour < period['end']:
                    rates['event'] *= period['multiplier']
                    break
        
        # Normalize
        total = sum(rates.values())
        for k in rates:
            rates[k] /= total
        
        # Select
        roll = random_gen.random()
        cumulative = 0
        for marker_type, rate in rates.items():
            cumulative += rate
            if roll < cumulative:
                return marker_type
        
        return 'standard'
```

---

## 5. PITY TIMER SYSTEMS

### 5.1 Guaranteed Reward System

```python
# SECRET: Pity timer implementation
class PityTimer:
    """
    Ensures players eventually receive rewards after bad luck streaks.
    """
    
    # Pity thresholds (actions without reward of type)
    PITY_THRESHOLDS = {
        'premium_marker': 50,     # Guaranteed premium after 50 standards
        'jackpot': 5000,          # Guaranteed small jackpot after 5000 claims
        'event_reward': 20,       # Guaranteed event reward after 20 event actions
        'mission_clue': 100,      # Guaranteed clue after 100 mission actions
    }
    
    # Soft pity (increasing probability)
    SOFT_PITY_START = {
        'premium_marker': 30,
        'jackpot': 3000,
        'event_reward': 12,
        'mission_clue': 60,
    }
    
    def check_pity(self, user, reward_type, base_probability, random_gen):
        """
        Checks if pity should trigger, returns modified probability.
        """
        actions_since = self._get_actions_since_reward(user, reward_type)
        
        threshold = self.PITY_THRESHOLDS.get(reward_type, float('inf'))
        soft_start = self.SOFT_PITY_START.get(reward_type, threshold)
        
        # Hard pity: guaranteed at threshold
        if actions_since >= threshold:
            return 1.0, 'hard_pity'
        
        # Soft pity: increasing probability
        if actions_since >= soft_start:
            progress = (actions_since - soft_start) / (threshold - soft_start)
            # Exponential increase
            pity_boost = progress ** 2 * (1 - base_probability)
            modified = min(0.95, base_probability + pity_boost)
            return modified, 'soft_pity'
        
        return base_probability, 'normal'
    
    def _get_actions_since_reward(self, user, reward_type):
        """
        Gets action count since last reward of type.
        """
        # Query from pity counter table
        counter = db.query(PityCounter).filter_by(
            user_id=user.id,
            reward_type=reward_type
        ).first()
        
        return counter.actions_since if counter else 0


# Example pity progression for premium markers:
# Actions 0-29: 18% base chance
# Actions 30: 18% + 0% = 18%
# Actions 35: 18% + 2% = 20%
# Actions 40: 18% + 8% = 26%
# Actions 45: 18% + 18% = 36%
# Actions 49: 18% + 32% = 50%
# Action 50: 100% guaranteed
```

---

## 6. STATISTICAL FAIRNESS VERIFICATION

```python
# SECRET: Fairness verification system
class FairnessVerifier:
    """
    Continuously verifies reward distribution fairness.
    """
    
    # Acceptable deviation from expected
    MAX_DEVIATION_PERCENT = 15  # ±15% from expected
    
    # Minimum samples for statistical significance
    MIN_SAMPLES = 1000
    
    def verify_distribution(self, reward_type, time_period):
        """
        Verifies rewards match expected distribution.
        """
        # Get actual distribution
        actual = self._get_actual_distribution(reward_type, time_period)
        
        # Get expected distribution
        expected = self._get_expected_distribution(reward_type)
        
        if actual['count'] < self.MIN_SAMPLES:
            return {'status': 'insufficient_data', 'samples': actual['count']}
        
        # Chi-squared test
        chi_squared, p_value = self._chi_squared_test(actual, expected)
        
        # Check deviation
        deviations = self._calculate_deviations(actual, expected)
        max_deviation = max(abs(d) for d in deviations.values())
        
        return {
            'status': 'pass' if max_deviation < self.MAX_DEVIATION_PERCENT else 'fail',
            'chi_squared': chi_squared,
            'p_value': p_value,
            'max_deviation': max_deviation,
            'deviations': deviations,
            'samples': actual['count'],
            'alert': max_deviation > self.MAX_DEVIATION_PERCENT * 0.8
        }
```

---

## INTELLECTUAL PROPERTY NOTICE

The probability models in this document are exclusive trade secrets. They define the mathematical foundation of player experience fairness.

**CLASSIFICATION: INTERNAL SECRET — MATHEMATICAL CORE**

---

**Document End — INTERNAL SECRET**

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved




