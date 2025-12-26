# M1SSION™ INTERNAL SECRET DOCUMENTATION
## Volume 7: Map Sequencing and Prize Placement

**Document Version:** 1.0  
**Classification:** INTERNAL SECRET — DO NOT PUBLISH  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## ⚠️ CONFIDENTIALITY NOTICE

This document contains the prize placement logic. Disclosure would compromise mission integrity.

---

## 1. MISSION STRUCTURE DESIGN

### 1.1 Mission Phase Architecture

```python
# SECRET: Mission phase configuration
MISSION_PHASES = {
    0: {
        'name': 'Launch',
        'duration_days': 7,
        'description': 'Mission activation and initial exploration',
        'clue_revelation_rate': 0.1,  # 10% of total clues
        'prize_marker_active': False,
        'objectives': [
            'Complete 10 Buzz actions',
            'Activate 3 Buzz Map areas',
            'Claim 5 markers'
        ]
    },
    1: {
        'name': 'Reconnaissance',
        'duration_days': 14,
        'description': 'Building intelligence and narrowing search',
        'clue_revelation_rate': 0.25,  # 25% cumulative
        'prize_marker_active': False,
        'objectives': [
            'Visit 5 different zones',
            'Claim 25 markers',
            'Unlock phase 1 narrative'
        ]
    },
    2: {
        'name': 'Investigation',
        'duration_days': 14,
        'description': 'Deep search and clue analysis',
        'clue_revelation_rate': 0.50,  # 50% cumulative
        'prize_marker_active': False,
        'objectives': [
            'Claim 50 markers',
            'Complete zone challenges',
            'Decode ECHO messages'
        ]
    },
    3: {
        'name': 'Pursuit',
        'duration_days': 14,
        'description': 'Final search area identified',
        'clue_revelation_rate': 0.85,  # 85% cumulative
        'prize_marker_active': True,  # Prize becomes findable
        'objectives': [
            'Enter pursuit zone',
            'Complete final challenges',
            'Approach prize location'
        ]
    },
    4: {
        'name': 'Capture',
        'duration_days': 7,
        'description': 'Final phase - prize claim window',
        'clue_revelation_rate': 1.0,  # All clues available
        'prize_marker_active': True,
        'objectives': [
            'Locate prize marker',
            'Complete verification',
            'Claim prize'
        ]
    }
}
```

### 1.2 Phase Transition Logic

```python
# SECRET: Phase transition calculation
class PhaseManager:
    """
    Manages mission phase transitions.
    """
    
    def get_current_phase(self, mission):
        """
        Determines current phase based on mission start date.
        """
        elapsed_days = (datetime.now() - mission.start_date).days
        
        cumulative_days = 0
        for phase_id, config in MISSION_PHASES.items():
            cumulative_days += config['duration_days']
            if elapsed_days < cumulative_days:
                return phase_id
        
        return max(MISSION_PHASES.keys())  # Final phase
    
    def get_phase_progress(self, mission):
        """
        Returns progress through current phase (0.0 - 1.0).
        """
        phase = self.get_current_phase(mission)
        config = MISSION_PHASES[phase]
        
        # Calculate days into current phase
        prior_days = sum(
            MISSION_PHASES[p]['duration_days'] 
            for p in range(phase)
        )
        elapsed = (datetime.now() - mission.start_date).days
        days_in_phase = elapsed - prior_days
        
        return min(1.0, days_in_phase / config['duration_days'])
```

---

## 2. CLUE SYSTEM

### 2.1 Clue Types and Values

```python
# SECRET: Clue classification system
CLUE_TYPES = {
    'geographic': {
        'description': 'Location hints',
        'specificity_levels': [
            {'level': 1, 'radius_km': 10, 'points': 10},
            {'level': 2, 'radius_km': 5, 'points': 25},
            {'level': 3, 'radius_km': 2, 'points': 50},
            {'level': 4, 'radius_km': 0.5, 'points': 100},
            {'level': 5, 'radius_km': 0.1, 'points': 250},
        ]
    },
    'landmark': {
        'description': 'Reference to nearby landmarks',
        'specificity_levels': [
            {'level': 1, 'hint': 'city/district', 'points': 15},
            {'level': 2, 'hint': 'neighborhood', 'points': 35},
            {'level': 3, 'hint': 'street/area', 'points': 75},
            {'level': 4, 'hint': 'specific landmark', 'points': 150},
        ]
    },
    'environmental': {
        'description': 'Physical environment clues',
        'examples': ['near water', 'elevated', 'historic area'],
        'points': 30
    },
    'temporal': {
        'description': 'Time-based hints',
        'examples': ['visible at sunset', 'near morning routes'],
        'points': 20
    },
    'narrative': {
        'description': 'Story-embedded hints',
        'decryption_required': True,
        'points': 50
    }
}
```

### 2.2 Clue Distribution Algorithm

```python
# SECRET: Clue revelation schedule
class ClueDistributor:
    """
    Manages progressive clue revelation.
    """
    
    def __init__(self, mission):
        self.mission = mission
        self.total_clues = len(mission.clues)
    
    def get_revealed_clues(self):
        """
        Returns clues revealed based on current phase.
        """
        phase = PhaseManager().get_current_phase(self.mission)
        revelation_rate = MISSION_PHASES[phase]['clue_revelation_rate']
        
        # Calculate target clue count
        target_count = int(self.total_clues * revelation_rate)
        
        # Get clues in priority order
        ordered_clues = self._get_clue_priority_order()
        
        return ordered_clues[:target_count]
    
    def _get_clue_priority_order(self):
        """
        Orders clues by revelation priority.
        Lower specificity clues first (vague before precise).
        """
        clues = list(self.mission.clues)
        
        # Sort by specificity (ascending) then value (descending)
        clues.sort(key=lambda c: (c.specificity_level, -c.point_value))
        
        return clues
    
    def get_next_clue_reveal(self, player):
        """
        Determines next clue for specific player.
        Considers player's already-collected clues.
        """
        revealed = self.get_revealed_clues()
        collected = player.collected_clues
        
        available = [c for c in revealed if c.id not in collected]
        
        if not available:
            return None
        
        # Return highest value uncollected
        return max(available, key=lambda c: c.point_value)
```

---

## 3. PRIZE MARKER PLACEMENT

### 3.1 Location Selection Algorithm

```python
# SECRET: Prize placement algorithm
class PrizePlacement:
    """
    Determines optimal prize marker location.
    CRITICAL: This algorithm must never be disclosed.
    """
    
    # Selection criteria weights
    CRITERIA_WEIGHTS = {
        'accessibility': 0.25,     # Must be reachable
        'challenge': 0.20,         # Should require effort
        'uniqueness': 0.15,        # Memorable location
        'safety': 0.20,            # Safe environment
        'photo_opportunity': 0.10, # Good for winner photos
        'narrative_fit': 0.10,     # Matches mission story
    }
    
    def select_prize_location(self, mission_area, candidate_locations):
        """
        Selects optimal prize location from candidates.
        """
        scored_locations = []
        
        for location in candidate_locations:
            score = self._score_location(location, mission_area)
            scored_locations.append((location, score))
        
        # Sort by score descending
        scored_locations.sort(key=lambda x: x[1], reverse=True)
        
        # Take top 5 candidates
        finalists = scored_locations[:5]
        
        # Random selection from finalists (prevents predictability)
        # Weighted by score
        weights = [score for _, score in finalists]
        total = sum(weights)
        normalized = [w / total for w in weights]
        
        selected_idx = self._weighted_random_select(normalized)
        
        return finalists[selected_idx][0]
    
    def _score_location(self, location, mission_area):
        """
        Calculates composite score for location.
        """
        scores = {}
        
        # Accessibility: public, reachable, near transit
        scores['accessibility'] = self._score_accessibility(location)
        
        # Challenge: not too obvious, requires exploration
        scores['challenge'] = self._score_challenge(location, mission_area)
        
        # Uniqueness: distinctive, memorable
        scores['uniqueness'] = self._score_uniqueness(location)
        
        # Safety: daytime access, populated area
        scores['safety'] = self._score_safety(location)
        
        # Photo opportunity: good backdrop, lighting
        scores['photo_opportunity'] = self._score_photo_op(location)
        
        # Narrative fit: matches mission theme
        scores['narrative_fit'] = self._score_narrative(location)
        
        # Weighted combination
        total = sum(
            scores[k] * self.CRITERIA_WEIGHTS[k] 
            for k in scores
        )
        
        return total
    
    def _score_challenge(self, location, mission_area):
        """
        Scores location difficulty.
        """
        # Distance from mission center
        center = mission_area.center
        distance = haversine_distance(location, center)
        max_distance = mission_area.radius * 0.8
        
        # Edge of area = more challenging
        distance_score = min(1.0, distance / max_distance)
        
        # Nearby marker density (fewer = harder to find)
        density = self._get_local_marker_density(location)
        density_score = 1.0 - min(1.0, density / 50)
        
        # Combine
        return (distance_score + density_score) / 2
```

### 3.2 Prize Marker Properties

```python
# SECRET: Prize marker configuration
PRIZE_MARKER_CONFIG = {
    'signal_strength': 80,  # Higher than standard (50)
    'detection_radius': 400,  # Meters - wider than premium
    'interaction_radius': 25,  # Meters - must be close
    
    # Activation timing
    'activation_phase': 3,  # Becomes active in phase 3
    'visibility_delay_hours': 24,  # After phase 3 start
    
    # Signal behavior
    'signal_pattern': 'pulsing',  # Distinctive pattern
    'signal_periodicity': 8,  # Seconds per pulse cycle
    
    # Verification requirements
    'verification_level': 'high',
    'requires_photo': True,
    'requires_location_proof': True,
    'cooldown_after_fail_minutes': 30,
    
    # Antiforcing
    'max_claim_attempts': 3,  # Per user
    'suspicious_approach_detection': True,
}
```

---

## 4. ZONE SEQUENCING

### 4.1 Zone Activation Schedule

```python
# SECRET: Zone activation logic
class ZoneSequencer:
    """
    Controls progressive zone activation throughout mission.
    """
    
    def __init__(self, mission):
        self.mission = mission
        self.zones = mission.zones
    
    def get_active_zones(self):
        """
        Returns currently active zones based on phase and progress.
        """
        phase = PhaseManager().get_current_phase(self.mission)
        progress = PhaseManager().get_phase_progress(self.mission)
        
        # Zone activation schedule
        ZONE_SCHEDULE = {
            0: 0.20,  # 20% of zones in phase 0
            1: 0.40,  # 40% of zones in phase 1
            2: 0.70,  # 70% of zones in phase 2
            3: 0.90,  # 90% of zones in phase 3
            4: 1.00,  # All zones in phase 4
        }
        
        target_percentage = ZONE_SCHEDULE[phase]
        
        # Gradually activate within phase
        phase_start_pct = ZONE_SCHEDULE.get(phase - 1, 0)
        phase_range = target_percentage - phase_start_pct
        current_pct = phase_start_pct + (phase_range * progress)
        
        target_count = int(len(self.zones) * current_pct)
        
        # Return zones in activation order
        return self._get_zones_in_order()[:target_count]
    
    def _get_zones_in_order(self):
        """
        Orders zones by activation priority.
        Central zones first, prize zone last.
        """
        center = self.mission.area.center
        prize_zone = self.mission.prize_zone_id
        
        zones = list(self.zones)
        
        # Sort by distance from center (closest first)
        # But prize zone always last
        def sort_key(zone):
            if zone.id == prize_zone:
                return (1, 0)  # Last
            distance = haversine_distance(zone.center, center)
            return (0, distance)
        
        zones.sort(key=sort_key)
        return zones
```

### 4.2 Heat Map Generation

```python
# SECRET: Player activity heat map for zone guidance
class HeatMapGenerator:
    """
    Generates activity heat maps to guide players.
    """
    
    def generate_hint_heat_map(self, mission):
        """
        Creates a heat map that subtly guides toward prize area.
        """
        prize_location = mission.prize_marker.position
        
        # Create grid
        grid_size = 0.001  # ~100m cells
        bounds = mission.area.bounds
        
        heat_map = {}
        
        for lat in np.arange(bounds.min_lat, bounds.max_lat, grid_size):
            for lng in np.arange(bounds.min_lng, bounds.max_lng, grid_size):
                cell_center = (lat + grid_size/2, lng + grid_size/2)
                
                # Base heat from marker density
                marker_heat = self._calculate_marker_heat(cell_center)
                
                # Subtle prize proximity boost (not obvious)
                distance_to_prize = haversine_distance(
                    cell_center, prize_location
                )
                # Inverse distance, capped
                prize_heat = max(0, 1 - (distance_to_prize / 5000))
                # Multiply by small factor to keep subtle
                prize_boost = prize_heat * 0.15
                
                heat_map[(lat, lng)] = marker_heat + prize_boost
        
        return heat_map
    
    def _calculate_marker_heat(self, position):
        """
        Calculates heat from nearby marker activity.
        """
        nearby_claims = db.query(MarkerClaim).filter(
            MarkerClaim.distance_from(position) < 500
        ).count()
        
        return min(1.0, nearby_claims / 100)
```

---

## 5. NARRATIVE SEQUENCING

### 5.1 Entity Message Schedule

```python
# SECRET: Narrative event triggers
class NarrativeSequencer:
    """
    Controls story element delivery based on progress.
    """
    
    # Narrative milestones
    NARRATIVE_TRIGGERS = {
        'mission_start': {
            'entity': 'MCP',
            'message_type': 'briefing',
            'blocking': True,
            'priority': 1
        },
        'first_claim': {
            'entity': 'MCP',
            'message_type': 'encouragement',
            'blocking': False,
            'priority': 2
        },
        'phase_1_enter': {
            'entity': 'ECHO',
            'message_type': 'mysterious_hint',
            'blocking': False,
            'priority': 2
        },
        'zone_50_percent': {
            'entity': 'SHADOW',
            'message_type': 'warning',
            'blocking': False,
            'priority': 3
        },
        'phase_3_enter': {
            'entity': 'MCP',
            'message_type': 'pursuit_alert',
            'blocking': True,
            'priority': 1
        },
        'prize_zone_enter': {
            'entity': 'SHADOW',
            'message_type': 'final_warning',
            'blocking': True,
            'intensity': 3,
            'priority': 1
        },
        'prize_proximity': {
            'entity': 'ECHO',
            'message_type': 'final_clue',
            'blocking': False,
            'priority': 2
        },
        'prize_claim': {
            'entity': 'MCP',
            'message_type': 'victory',
            'blocking': True,
            'priority': 1
        }
    }
    
    def check_triggers(self, user, action):
        """
        Checks if action triggers narrative event.
        """
        triggered = []
        
        for trigger_name, config in self.NARRATIVE_TRIGGERS.items():
            if self._should_trigger(trigger_name, user, action):
                if not self._already_triggered(user, trigger_name):
                    triggered.append((trigger_name, config))
        
        return sorted(triggered, key=lambda x: x[1]['priority'])
```

---

## 6. ANTI-GAMING PROTECTIONS

```python
# SECRET: Prize placement anti-gaming measures
class AntiGamingProtection:
    """
    Prevents exploitation of prize placement patterns.
    """
    
    def validate_prize_approach(self, user, position):
        """
        Validates user's approach to prize area.
        """
        checks = []
        
        # Check 1: Natural movement pattern
        movement = self._analyze_movement_to_position(user, position)
        checks.append(('movement_natural', movement > 0.6))
        
        # Check 2: Not teleported
        teleport = self._check_teleport(user, position)
        checks.append(('no_teleport', not teleport))
        
        # Check 3: Gradual approach (not beeline)
        approach = self._analyze_approach_pattern(user, position)
        checks.append(('organic_approach', approach > 0.5))
        
        # Check 4: Activity history in mission
        history = user.mission_activity_score
        checks.append(('sufficient_activity', history > 0.3))
        
        # All must pass
        all_passed = all(passed for _, passed in checks)
        
        return {
            'valid': all_passed,
            'checks': checks,
            'confidence': sum(1 for _, p in checks if p) / len(checks)
        }
```

---

## INTELLECTUAL PROPERTY NOTICE

The map sequencing and prize placement algorithms are the most sensitive trade secrets in M1SSION™. Disclosure would fundamentally compromise game integrity.

**CLASSIFICATION: INTERNAL SECRET — MAXIMUM SENSITIVITY**

---

**Document End — INTERNAL SECRET**

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved





