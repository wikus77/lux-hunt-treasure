# M1SSION™ INTERNAL SECRET DOCUMENTATION
## Volume 6: Dynamic Radius Algorithm

**Document Version:** 1.0  
**Classification:** INTERNAL SECRET — DO NOT PUBLISH  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## ⚠️ CONFIDENTIALITY NOTICE

This document contains the proprietary radius calculation algorithm. Disclosure would enable cost optimization exploitation.

---

## 1. RADIUS CALCULATION OVERVIEW

The Buzz Map activation radius determines the circular area within which markers are revealed. This radius is calculated dynamically based on multiple factors, creating a fair but variable experience.

### 1.1 Formula Summary

```
FINAL_RADIUS = BASE_RADIUS × LEVEL_MOD × SUB_MOD × AREA_MOD × TIME_MOD × RANDOM_VAR

Where:
- BASE_RADIUS: Determined by tier selection
- LEVEL_MOD: Player level modifier (1.0 - 1.5)
- SUB_MOD: Subscription modifier (1.0 - 1.3)
- AREA_MOD: Geographic area modifier (0.8 - 1.2)
- TIME_MOD: Time of day modifier (0.9 - 1.15)
- RANDOM_VAR: Random variance (0.95 - 1.05)
```

---

## 2. BASE RADIUS TIERS

### 2.1 Tier Definitions

```python
# SECRET: Base radius values
RADIUS_TIERS = {
    'scout': {
        'base_radius_meters': 75,
        'cost_m1u': 5,
        'cost_energy': 15,
        'duration_seconds': 180,
        'description': 'Quick scan'
    },
    'standard': {
        'base_radius_meters': 150,
        'cost_m1u': 15,
        'cost_energy': 30,
        'duration_seconds': 300,
        'description': 'Standard search'
    },
    'extended': {
        'base_radius_meters': 300,
        'cost_m1u': 35,
        'cost_energy': 50,
        'duration_seconds': 600,
        'description': 'Wide search'
    },
    'maximum': {
        'base_radius_meters': 500,
        'cost_m1u': 75,
        'cost_energy': 75,
        'duration_seconds': 900,
        'description': 'Maximum range'
    }
}
```

### 2.2 Value Analysis

```python
# SECRET: Cost-per-meter analysis
def calculate_efficiency(tier):
    """
    Calculates efficiency metrics for tier.
    Lower cost_per_sqm = better value.
    """
    config = RADIUS_TIERS[tier]
    radius = config['base_radius_meters']
    cost = config['cost_m1u']
    
    area_sqm = math.pi * radius ** 2
    cost_per_sqm = cost / area_sqm
    
    return {
        'tier': tier,
        'radius': radius,
        'area_sqm': area_sqm,
        'cost': cost,
        'cost_per_sqm': cost_per_sqm,
        'cost_per_100sqm': cost_per_sqm * 100
    }

# Efficiency comparison:
# Scout:    Area=17,671 sqm,  Cost=5 M1U,  Per 100sqm=0.028 M1U
# Standard: Area=70,686 sqm,  Cost=15 M1U, Per 100sqm=0.021 M1U  ← Most efficient
# Extended: Area=282,743 sqm, Cost=35 M1U, Per 100sqm=0.012 M1U  ← Best value
# Maximum:  Area=785,398 sqm, Cost=75 M1U, Per 100sqm=0.010 M1U  ← Premium
```

---

## 3. MODIFIER CALCULATIONS

### 3.1 Level Modifier

```python
# SECRET: Level-based radius modifier
class LevelModifier:
    """
    Calculates radius bonus based on player level.
    """
    
    # Modifier curve parameters
    BASE_MODIFIER = 1.0
    MAX_MODIFIER = 1.5  # Maximum +50% radius
    LEVEL_CAP = 100
    
    # Curve type: logarithmic (diminishing returns)
    
    def calculate(self, level):
        """
        Returns modifier for given level.
        """
        if level <= 1:
            return self.BASE_MODIFIER
        
        # Logarithmic curve
        # Level 1: 1.0
        # Level 10: ~1.15
        # Level 25: ~1.25
        # Level 50: ~1.35
        # Level 75: ~1.43
        # Level 100: 1.5
        
        progress = math.log(level) / math.log(self.LEVEL_CAP)
        modifier = self.BASE_MODIFIER + (self.MAX_MODIFIER - self.BASE_MODIFIER) * progress
        
        return round(modifier, 3)
    
    def get_all_levels(self):
        """
        Returns modifier for all levels (for documentation).
        """
        return {
            level: self.calculate(level) 
            for level in [1, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100]
        }


# Level modifier table:
# Level 1:   1.000 (no bonus)
# Level 5:   1.080
# Level 10:  1.150
# Level 15:  1.194
# Level 20:  1.230
# Level 25:  1.259
# Level 30:  1.285
# Level 40:  1.326
# Level 50:  1.359
# Level 60:  1.388
# Level 70:  1.413
# Level 80:  1.435
# Level 90:  1.455
# Level 100: 1.500
```

### 3.2 Subscription Modifier

```python
# SECRET: Subscription radius bonus
SUBSCRIPTION_MODIFIERS = {
    'free': {
        'radius_modifier': 1.00,
        'cost_discount': 0.00,
        'duration_bonus': 0,
    },
    'basic': {
        'radius_modifier': 1.10,  # +10% radius
        'cost_discount': 0.05,   # 5% cost reduction
        'duration_bonus': 30,    # +30 seconds
    },
    'premium': {
        'radius_modifier': 1.20,  # +20% radius
        'cost_discount': 0.10,   # 10% cost reduction
        'duration_bonus': 60,    # +60 seconds
    },
    'elite': {
        'radius_modifier': 1.30,  # +30% radius
        'cost_discount': 0.15,   # 15% cost reduction
        'duration_bonus': 120,   # +120 seconds
    },
}
```

### 3.3 Area Modifier

```python
# SECRET: Geographic area density modifier
class AreaModifier:
    """
    Adjusts radius based on marker density.
    Dense areas get smaller radius, sparse areas get larger.
    """
    
    # Density thresholds (markers per km²)
    DENSITY_HIGH = 50
    DENSITY_MEDIUM = 20
    DENSITY_LOW = 5
    
    # Corresponding modifiers
    MODIFIER_HIGH_DENSITY = 0.85   # -15% in dense areas
    MODIFIER_MEDIUM_DENSITY = 1.00 # Normal in medium
    MODIFIER_LOW_DENSITY = 1.20    # +20% in sparse areas
    
    def calculate(self, player_position, cached_density=None):
        """
        Returns modifier based on local marker density.
        """
        if cached_density is not None:
            density = cached_density
        else:
            density = self._calculate_local_density(player_position)
        
        if density >= self.DENSITY_HIGH:
            return self.MODIFIER_HIGH_DENSITY
        elif density >= self.DENSITY_MEDIUM:
            # Linear interpolation
            progress = (self.DENSITY_HIGH - density) / (self.DENSITY_HIGH - self.DENSITY_MEDIUM)
            return self.MODIFIER_HIGH_DENSITY + progress * (self.MODIFIER_MEDIUM_DENSITY - self.MODIFIER_HIGH_DENSITY)
        elif density >= self.DENSITY_LOW:
            progress = (self.DENSITY_MEDIUM - density) / (self.DENSITY_MEDIUM - self.DENSITY_LOW)
            return self.MODIFIER_MEDIUM_DENSITY + progress * (self.MODIFIER_LOW_DENSITY - self.MODIFIER_MEDIUM_DENSITY)
        else:
            return self.MODIFIER_LOW_DENSITY
    
    def _calculate_local_density(self, position):
        """
        Calculates marker density around position.
        """
        # Count markers within 1km radius
        nearby_markers = MarkerIndex.query_radius(position, 1000)
        
        # Area in km²
        area = math.pi * 1 ** 2  # 1km radius = π km²
        
        return len(nearby_markers) / area
```

### 3.4 Time Modifier

```python
# SECRET: Time-of-day radius modifier
class TimeModifier:
    """
    Adjusts radius based on time of day.
    Encourages off-peak play.
    """
    
    # Hour-based modifiers
    HOURLY_MODIFIERS = {
        0: 1.15,   # Midnight - bonus for night owls
        1: 1.15,
        2: 1.15,
        3: 1.10,
        4: 1.10,
        5: 1.05,
        6: 1.00,   # Morning - standard
        7: 1.00,
        8: 0.95,   # Rush hour - slight reduction
        9: 0.95,
        10: 1.00,
        11: 1.00,
        12: 0.90,  # Lunch peak - reduced
        13: 0.90,
        14: 1.00,
        15: 1.00,
        16: 1.00,
        17: 0.95,  # After work
        18: 0.95,
        19: 1.00,
        20: 1.00,
        21: 1.05,  # Evening bonus
        22: 1.10,
        23: 1.15,
    }
    
    def calculate(self, timestamp):
        """
        Returns modifier for given time.
        """
        hour = timestamp.hour
        return self.HOURLY_MODIFIERS.get(hour, 1.00)
```

### 3.5 Random Variance

```python
# SECRET: Random variance application
class RandomVariance:
    """
    Adds small random variance to prevent predictability.
    """
    
    # Variance range
    MIN_VARIANCE = 0.95  # -5%
    MAX_VARIANCE = 1.05  # +5%
    
    # Distribution: uniform
    
    def calculate(self, user_id, activation_id):
        """
        Returns deterministic random variance.
        Uses activation ID as seed for reproducibility.
        """
        # Create deterministic seed
        seed = hash(f"{user_id}:{activation_id}")
        rng = random.Random(seed)
        
        variance = rng.uniform(self.MIN_VARIANCE, self.MAX_VARIANCE)
        return round(variance, 3)
```

---

## 4. COMPLETE CALCULATION PIPELINE

```python
# SECRET: Full radius calculation
class RadiusCalculator:
    """
    Complete radius calculation with all modifiers.
    """
    
    def __init__(self):
        self.level_mod = LevelModifier()
        self.area_mod = AreaModifier()
        self.time_mod = TimeModifier()
        self.variance = RandomVariance()
    
    def calculate(self, user, tier, position, timestamp, activation_id):
        """
        Calculates final radius with full breakdown.
        """
        # Get base radius
        base_config = RADIUS_TIERS[tier]
        base_radius = base_config['base_radius_meters']
        
        # Calculate modifiers
        level_modifier = self.level_mod.calculate(user.level)
        sub_modifier = SUBSCRIPTION_MODIFIERS[user.subscription_tier]['radius_modifier']
        area_modifier = self.area_mod.calculate(position)
        time_modifier = self.time_mod.calculate(timestamp)
        random_variance = self.variance.calculate(user.id, activation_id)
        
        # Calculate final
        final_radius = (
            base_radius *
            level_modifier *
            sub_modifier *
            area_modifier *
            time_modifier *
            random_variance
        )
        
        # Round to nearest meter
        final_radius = int(round(final_radius))
        
        # Apply absolute minimum and maximum
        final_radius = max(50, min(750, final_radius))
        
        return {
            'final_radius': final_radius,
            'base_radius': base_radius,
            'modifiers': {
                'level': level_modifier,
                'subscription': sub_modifier,
                'area': area_modifier,
                'time': time_modifier,
                'variance': random_variance
            },
            'total_modifier': final_radius / base_radius
        }


# Example calculation:
# User: Level 35, Premium subscription
# Tier: Standard (base 150m)
# Location: Medium density urban
# Time: 10 PM
# 
# level_modifier = 1.30 (Level 35)
# sub_modifier = 1.20 (Premium)
# area_modifier = 1.00 (Medium density)
# time_modifier = 1.10 (Evening)
# random_variance = 1.02 (Random)
#
# Final = 150 × 1.30 × 1.20 × 1.00 × 1.10 × 1.02
#       = 150 × 1.90
#       = 285 meters
```

---

## 5. COST CALCULATION

```python
# SECRET: Dynamic cost calculation
class CostCalculator:
    """
    Calculates activation cost with discounts.
    """
    
    def calculate(self, user, tier):
        """
        Calculates final M1U and energy cost.
        """
        base_config = RADIUS_TIERS[tier]
        base_m1u = base_config['cost_m1u']
        base_energy = base_config['cost_energy']
        
        # Get subscription discount
        sub_config = SUBSCRIPTION_MODIFIERS[user.subscription_tier]
        discount = sub_config['cost_discount']
        
        # Apply discount
        final_m1u = int(math.ceil(base_m1u * (1 - discount)))
        final_energy = int(math.ceil(base_energy * (1 - discount)))
        
        # Apply level discount (small, +0.2% per level, max 10%)
        level_discount = min(0.10, (user.level - 1) * 0.002)
        final_m1u = int(math.ceil(final_m1u * (1 - level_discount)))
        
        return {
            'base_m1u': base_m1u,
            'base_energy': base_energy,
            'final_m1u': final_m1u,
            'final_energy': final_energy,
            'discounts': {
                'subscription': discount,
                'level': level_discount
            },
            'total_discount': 1 - (final_m1u / base_m1u) if base_m1u > 0 else 0
        }
```

---

## 6. EXPECTED MARKER DISCOVERY

```python
# SECRET: Marker discovery estimation
class DiscoveryEstimator:
    """
    Estimates expected markers for given radius.
    """
    
    def estimate(self, radius, position, area_type='urban'):
        """
        Estimates marker count for radius.
        """
        # Area in square meters
        area_sqm = math.pi * radius ** 2
        area_km2 = area_sqm / 1_000_000
        
        # Density by area type
        DENSITY_PER_KM2 = {
            'urban': 50,
            'suburban': 15,
            'rural': 3,
        }
        
        density = DENSITY_PER_KM2.get(area_type, 30)
        
        # Expected markers
        expected = area_km2 * density
        
        # Apply variance (Poisson distribution)
        variance = math.sqrt(expected)
        
        return {
            'expected': round(expected, 1),
            'minimum': max(0, round(expected - variance * 2, 1)),
            'maximum': round(expected + variance * 2, 1),
            'area_sqm': area_sqm,
            'area_km2': area_km2,
            'density': density
        }


# Example estimates for Standard tier (150m base):
#
# Urban (50/km²):
#   Area = 0.071 km², Expected = 3.5 markers (range 1-6)
#
# Suburban (15/km²):
#   Area = 0.071 km², Expected = 1.1 markers (range 0-3)
#
# Rural (3/km²):
#   Area = 0.071 km², Expected = 0.2 markers (range 0-1)
```

---

## 7. OPTIMIZATION RECOMMENDATIONS

```python
# SECRET: Player optimization guidance (for internal balancing)
"""
Optimal player strategies by scenario:

SCENARIO 1: Urban hunting, free player
- Use Scout tier for initial reconnaissance
- Use Standard for confirmed good areas
- Avoid Maximum (poor cost efficiency)

SCENARIO 2: Urban hunting, premium subscriber
- Extended tier offers best value with 20% radius bonus
- 285m effective radius at 31.5 M1U (10% discount)

SCENARIO 3: Suburban/rural hunting
- Area modifier provides +20% radius in sparse areas
- Extended or Maximum tiers become more efficient
- Night hunting adds another +15%

SCENARIO 4: High-level player (50+)
- Level 50 provides +36% radius bonus
- Combined with premium = +72% effective radius increase
- Makes even Scout tier viable (127m effective)

OPTIMAL TIMING:
- Best: 10 PM - 3 AM (+10-15% radius, low competition)
- Worst: 12 PM - 2 PM (-10% radius, high competition)
"""
```

---

## INTELLECTUAL PROPERTY NOTICE

The dynamic radius algorithm is a core trade secret. It directly impacts game economics and player value perception.

**CLASSIFICATION: INTERNAL SECRET — ECONOMIC CORE**

---

**Document End — INTERNAL SECRET**

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved





