# M1SSION™ INTERNAL SECRET DOCUMENTATION
## Volume 4: Reward Distribution — Internal Algorithms

**Document Version:** 1.0  
**Classification:** INTERNAL SECRET — DO NOT PUBLISH  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## ⚠️ CONFIDENTIALITY NOTICE

This document contains proprietary reward algorithms. Disclosure would enable exploitation.

---

## 1. REWARD CALCULATION ENGINE

### 1.1 Master Reward Formula

```python
# SECRET: Complete reward calculation
class RewardCalculator:
    """
    Calculates final reward values for all claim types.
    """
    
    # Base reward ranges by marker type
    BASE_REWARDS = {
        'standard': {'min': 5, 'max': 25, 'mean': 15},
        'premium': {'min': 50, 'max': 200, 'mean': 100},
        'mission': {'min': 100, 'max': 500, 'mean': 250},
        'event': {'min': 25, 'max': 150, 'mean': 75},
        'prize': {'min': 0, 'max': 0, 'mean': 0},  # Prize entries, not M1U
    }
    
    # Modifier caps
    MAX_POSITIVE_MODIFIER = 2.0  # Maximum 2x reward
    MAX_NEGATIVE_MODIFIER = 0.25  # Minimum 25% reward
    
    def calculate_reward(self, marker, user, claim_context):
        """
        Master reward calculation function.
        Returns: (reward_value, modifier_breakdown)
        """
        
        # Step 1: Determine base value
        base = self._calculate_base_value(marker)
        
        # Step 2: Apply variance
        variance_value = self._apply_variance(base, marker)
        
        # Step 3: Calculate all modifiers
        modifiers = self._calculate_modifiers(user, claim_context, marker)
        
        # Step 4: Apply modifiers with caps
        final_multiplier = self._combine_modifiers(modifiers)
        final_value = variance_value * final_multiplier
        
        # Step 5: Apply trust penalty if applicable
        final_value = self._apply_trust_penalty(final_value, user)
        
        # Step 6: Apply daily caps
        final_value = self._apply_daily_cap(final_value, user)
        
        # Round and return
        return int(round(final_value)), modifiers
    
    def _calculate_base_value(self, marker):
        """
        Determines base reward value.
        Uses marker's defined value or type default.
        """
        if marker.reward_value:
            return marker.reward_value
        
        reward_config = self.BASE_REWARDS.get(
            marker.marker_type, 
            self.BASE_REWARDS['standard']
        )
        
        return reward_config['mean']
    
    def _apply_variance(self, base, marker):
        """
        Applies controlled randomness to reward.
        """
        # Get variance percentage (default 10%)
        variance_pct = marker.reward_variance or 0.10
        
        # Calculate variance range
        variance_range = base * variance_pct
        
        # Apply normal distribution variance
        # Using truncated normal for bounded variance
        variance = np.random.normal(0, variance_range / 2)
        variance = max(-variance_range, min(variance_range, variance))
        
        return base + variance
    
    def _calculate_modifiers(self, user, context, marker):
        """
        Calculates all applicable modifiers.
        """
        modifiers = {}
        
        # Level modifier: +0.5% per level above 1
        level_mod = 1 + ((user.level - 1) * 0.005)
        modifiers['level'] = {
            'value': level_mod,
            'reason': f'Level {user.level}'
        }
        
        # Streak modifier: +2% per day, max +30%
        streak_days = user.current_streak or 0
        streak_mod = 1 + min(streak_days * 0.02, 0.30)
        modifiers['streak'] = {
            'value': streak_mod,
            'reason': f'{streak_days} day streak'
        }
        
        # Subscription modifier
        sub_mod = self._get_subscription_modifier(user)
        modifiers['subscription'] = {
            'value': sub_mod,
            'reason': user.subscription_tier
        }
        
        # Time-of-day modifier
        time_mod = self._get_time_modifier(context.timestamp)
        modifiers['time'] = {
            'value': time_mod,
            'reason': 'Time bonus' if time_mod > 1 else 'Standard'
        }
        
        # First-of-day bonus
        if self._is_first_claim_today(user):
            modifiers['first_daily'] = {
                'value': 1.05,
                'reason': 'First claim today'
            }
        
        # Event modifier (if applicable)
        event_mod = self._get_event_modifier(context)
        if event_mod != 1.0:
            modifiers['event'] = {
                'value': event_mod,
                'reason': 'Active event'
            }
        
        # Marker-specific modifier
        if marker.reward_modifier:
            modifiers['marker_specific'] = {
                'value': marker.reward_modifier,
                'reason': 'Special marker'
            }
        
        return modifiers
    
    def _get_subscription_modifier(self, user):
        """
        Returns reward modifier based on subscription.
        """
        SUBSCRIPTION_MODIFIERS = {
            'free': 1.0,
            'basic': 1.10,  # +10%
            'premium': 1.20,  # +20%
            'elite': 1.30,  # +30%
        }
        return SUBSCRIPTION_MODIFIERS.get(user.subscription_tier, 1.0)
    
    def _get_time_modifier(self, timestamp):
        """
        Rewards off-peak play to distribute load.
        """
        hour = timestamp.hour
        
        # Night owl bonus (2 AM - 6 AM)
        if 2 <= hour < 6:
            return 1.15  # +15%
        
        # Early bird bonus (6 AM - 8 AM)
        if 6 <= hour < 8:
            return 1.10  # +10%
        
        # Standard hours
        return 1.0
    
    def _combine_modifiers(self, modifiers):
        """
        Combines all modifiers with caps.
        """
        total = 1.0
        for mod in modifiers.values():
            total *= mod['value']
        
        # Apply caps
        total = max(self.MAX_NEGATIVE_MODIFIER, 
                   min(self.MAX_POSITIVE_MODIFIER, total))
        
        return total
    
    def _apply_trust_penalty(self, value, user):
        """
        Reduces rewards for low-trust accounts.
        """
        if user.trust_score >= 70:
            return value  # No penalty
        
        if user.trust_score >= 50:
            # Light penalty: lose up to 15%
            penalty = (70 - user.trust_score) / 100
            return value * (1 - penalty * 0.75)
        
        if user.trust_score >= 25:
            # Moderate penalty: lose up to 40%
            return value * 0.6
        
        # Severe penalty: 50% reduction
        return value * 0.5
    
    def _apply_daily_cap(self, value, user):
        """
        Ensures daily earning limits aren't exceeded.
        """
        # Get today's earnings
        today_earnings = self._get_today_earnings(user)
        
        # Daily cap based on subscription
        DAILY_CAPS = {
            'free': 500,
            'basic': 1000,
            'premium': 2000,
            'elite': 5000,
        }
        cap = DAILY_CAPS.get(user.subscription_tier, 500)
        
        # Calculate remaining allowance
        remaining = max(0, cap - today_earnings)
        
        return min(value, remaining)
```

---

## 2. PRIZE DISTRIBUTION ALGORITHM

### 2.1 Prize Entry Allocation

```python
# SECRET: Prize entry distribution
class PrizeDistributor:
    """
    Manages prize entry allocation and winner selection.
    """
    
    # Entry weight factors
    ACTIVITY_WEIGHT = 0.4  # 40% based on activity
    RANDOM_WEIGHT = 0.3   # 30% pure random
    LOYALTY_WEIGHT = 0.2   # 20% based on tenure
    PURCHASE_WEIGHT = 0.1  # 10% based on spending
    
    def allocate_entries(self, mission, eligible_users):
        """
        Allocates prize entries to eligible users.
        """
        entries = {}
        
        for user in eligible_users:
            # Calculate entry weight
            weight = self._calculate_entry_weight(user, mission)
            
            # Convert weight to entries (1-100 range)
            entry_count = max(1, int(weight * 100))
            
            entries[user.id] = {
                'count': entry_count,
                'weight': weight,
                'factors': self._get_weight_breakdown(user, mission)
            }
        
        return entries
    
    def _calculate_entry_weight(self, user, mission):
        """
        Calculates weighted entry chance.
        """
        # Activity component
        activity = self._normalize_activity(user, mission)
        activity_score = activity * self.ACTIVITY_WEIGHT
        
        # Random component (everyone gets some chance)
        random_score = random.random() * self.RANDOM_WEIGHT
        
        # Loyalty component
        loyalty = self._calculate_loyalty(user)
        loyalty_score = loyalty * self.LOYALTY_WEIGHT
        
        # Purchase component
        purchase = self._normalize_spending(user)
        purchase_score = purchase * self.PURCHASE_WEIGHT
        
        total = activity_score + random_score + loyalty_score + purchase_score
        
        # Normalize to 0-1
        return min(1.0, total)
    
    def _normalize_activity(self, user, mission):
        """
        Normalizes user activity to 0-1 scale.
        """
        # Get mission activity
        buzz_count = user.mission_buzz_count or 0
        map_count = user.mission_map_count or 0
        claims = user.mission_claims or 0
        
        # Weighted activity score
        activity = buzz_count * 1 + map_count * 5 + claims * 2
        
        # Get mission average
        avg_activity = mission.average_user_activity or 100
        
        # Normalize (above average = > 0.5)
        normalized = activity / (avg_activity * 2)
        
        return min(1.0, normalized)
    
    def _calculate_loyalty(self, user):
        """
        Calculates loyalty score based on tenure.
        """
        account_age_days = (datetime.now() - user.created_at).days
        
        # Loyalty curve (diminishing returns after 1 year)
        if account_age_days < 30:
            return 0.2
        elif account_age_days < 90:
            return 0.4
        elif account_age_days < 180:
            return 0.6
        elif account_age_days < 365:
            return 0.8
        else:
            return 1.0
    
    def select_winner(self, entries, num_winners=1):
        """
        Selects winner(s) using weighted random selection.
        """
        # Create weighted pool
        pool = []
        for user_id, entry_info in entries.items():
            pool.extend([user_id] * entry_info['count'])
        
        # Shuffle for fairness
        random.shuffle(pool)
        
        # Select winner(s)
        winners = []
        while len(winners) < num_winners and pool:
            winner = random.choice(pool)
            if winner not in winners:  # No duplicates
                winners.append(winner)
            # Remove all entries for this winner
            pool = [u for u in pool if u != winner]
        
        return winners
```

---

## 3. ECONOMIC BALANCING

### 3.1 Currency Sink Calibration

```python
# SECRET: Economic balance parameters
class EconomyBalancer:
    """
    Maintains economic balance through sink calibration.
    """
    
    # Target ratios
    TARGET_SINK_RATIO = 1.15  # Sinks should exceed sources by 15%
    ALERT_THRESHOLD_LOW = 0.9
    ALERT_THRESHOLD_HIGH = 1.5
    
    # Currency sources
    SOURCES = {
        'marker_claims': 'variable',
        'daily_bonuses': 100,  # Per user per day
        'achievement_rewards': 'variable',
        'event_rewards': 'variable',
        'referral_bonuses': 500,  # Per referral
        'cashback': 'variable',
    }
    
    # Currency sinks
    SINKS = {
        'buzz_action': 5,  # Per action
        'buzz_map_scout': 15,
        'buzz_map_standard': 35,
        'buzz_map_extended': 75,
        'premium_features': 'variable',
        'cosmetics': 'variable',
    }
    
    def calculate_daily_balance(self, date):
        """
        Calculates currency flow for a day.
        """
        # Sum all sources
        total_sources = self._sum_sources(date)
        
        # Sum all sinks
        total_sinks = self._sum_sinks(date)
        
        # Calculate ratio
        ratio = total_sinks / total_sources if total_sources > 0 else 0
        
        return {
            'sources': total_sources,
            'sinks': total_sinks,
            'ratio': ratio,
            'healthy': self.ALERT_THRESHOLD_LOW <= ratio <= self.ALERT_THRESHOLD_HIGH,
            'adjustment_needed': ratio < self.TARGET_SINK_RATIO
        }
    
    def recommend_adjustments(self, balance_data):
        """
        Recommends parameter adjustments for balance.
        """
        ratio = balance_data['ratio']
        recommendations = []
        
        if ratio < 0.9:
            # Too much currency flowing in
            recommendations.append({
                'type': 'reduce_rewards',
                'factor': 0.9 / ratio,
                'priority': 'high'
            })
            recommendations.append({
                'type': 'increase_costs',
                'factor': ratio / 0.9,
                'priority': 'medium'
            })
        
        elif ratio > 1.5:
            # Too aggressive sinks
            recommendations.append({
                'type': 'reduce_costs',
                'factor': 1.5 / ratio,
                'priority': 'medium'
            })
            recommendations.append({
                'type': 'increase_bonuses',
                'factor': ratio / 1.5,
                'priority': 'low'
            })
        
        return recommendations
```

---

## 4. MARKER PLACEMENT ALGORITHM

### 4.1 Geographic Distribution

```python
# SECRET: Marker placement algorithm
class MarkerPlacer:
    """
    Determines optimal marker placement for missions.
    """
    
    # Density targets (markers per km²)
    DENSITY_URBAN = 50
    DENSITY_SUBURBAN = 15
    DENSITY_RURAL = 3
    
    # Value distribution
    VALUE_DISTRIBUTION = {
        'standard': 0.70,  # 70% of markers
        'premium': 0.20,   # 20% of markers
        'mission': 0.08,   # 8% of markers
        'prize': 0.02,     # 2% of markers
    }
    
    def generate_placement_plan(self, mission_area, total_markers):
        """
        Generates optimal marker placement for mission area.
        """
        placements = []
        
        # Divide area into zones
        zones = self._segment_area(mission_area)
        
        # Allocate markers per zone
        for zone in zones:
            zone_markers = self._calculate_zone_allocation(
                zone, total_markers
            )
            
            # Generate specific placements
            for marker_type, count in zone_markers.items():
                positions = self._generate_positions(zone, count)
                for pos in positions:
                    placements.append({
                        'position': pos,
                        'type': marker_type,
                        'zone': zone.id
                    })
        
        return placements
    
    def _generate_positions(self, zone, count):
        """
        Generates marker positions within zone.
        Uses Poisson disk sampling for even distribution.
        """
        positions = []
        min_distance = self._calculate_min_distance(zone, count)
        
        # Poisson disk sampling
        active_list = []
        
        # Start with random point
        initial = self._random_point_in_zone(zone)
        positions.append(initial)
        active_list.append(initial)
        
        while len(positions) < count and active_list:
            # Pick random active point
            idx = random.randint(0, len(active_list) - 1)
            point = active_list[idx]
            
            found = False
            for _ in range(30):  # Try 30 candidates
                # Generate candidate in annulus
                candidate = self._random_in_annulus(
                    point, min_distance, min_distance * 2
                )
                
                if self._is_valid_position(candidate, positions, 
                                           min_distance, zone):
                    positions.append(candidate)
                    active_list.append(candidate)
                    found = True
                    break
            
            if not found:
                active_list.pop(idx)
        
        # Fill remaining with random if needed
        while len(positions) < count:
            pos = self._random_point_in_zone(zone)
            if self._is_valid_position(pos, positions, 
                                       min_distance * 0.5, zone):
                positions.append(pos)
        
        return positions[:count]
    
    def _is_valid_position(self, candidate, existing, min_dist, zone):
        """
        Validates marker position.
        """
        # Check zone containment
        if not zone.contains(candidate):
            return False
        
        # Check minimum distance from existing
        for pos in existing:
            if haversine_distance(candidate, pos) < min_dist:
                return False
        
        # Check against restricted areas
        if self._is_restricted(candidate):
            return False
        
        return True
    
    def _is_restricted(self, position):
        """
        Checks if position is in restricted area.
        """
        # Load restricted areas (cached)
        restricted = self._get_restricted_areas()
        
        for area in restricted:
            if area.contains(position):
                return True
        
        return False
```

---

## 5. REWARD TIMING OPTIMIZATION

```python
# SECRET: Reward timing for engagement optimization
class RewardScheduler:
    """
    Optimizes reward timing for maximum engagement.
    """
    
    # Variable ratio schedule parameters
    VR_BASE_INTERVAL = 3  # Base actions between rewards
    VR_MAX_INTERVAL = 10  # Maximum actions without reward
    
    def schedule_reward(self, user, action_type):
        """
        Determines if current action should receive bonus reward.
        Uses variable ratio scheduling (most engaging pattern).
        """
        # Get user's recent action count
        recent_actions = self._get_recent_action_count(user, action_type)
        last_bonus = self._get_last_bonus_action(user, action_type)
        
        actions_since_bonus = recent_actions - last_bonus
        
        # Variable ratio calculation
        target_interval = self._calculate_target_interval(user)
        
        # Probability increases with actions since last bonus
        probability = min(0.8, actions_since_bonus / target_interval)
        
        # Guaranteed reward at max interval
        if actions_since_bonus >= self.VR_MAX_INTERVAL:
            return True, 'guaranteed'
        
        # Random based on probability
        if random.random() < probability:
            return True, 'variable'
        
        return False, None
    
    def _calculate_target_interval(self, user):
        """
        Calculates target interval based on user engagement level.
        """
        # More engaged users can have longer intervals
        engagement = self._get_engagement_score(user)
        
        if engagement > 0.8:
            return self.VR_BASE_INTERVAL + 4  # 7 actions average
        elif engagement > 0.5:
            return self.VR_BASE_INTERVAL + 2  # 5 actions average
        else:
            return self.VR_BASE_INTERVAL  # 3 actions average (encourage new users)
```

---

## INTELLECTUAL PROPERTY NOTICE

The reward algorithms in this document are exclusive trade secrets. They define the economic foundation of M1SSION™.

**CLASSIFICATION: INTERNAL SECRET — CRITICAL**

---

**Document End — INTERNAL SECRET**

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved




