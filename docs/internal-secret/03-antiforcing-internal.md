# M1SSION™ INTERNAL SECRET DOCUMENTATION
## Volume 3: Antiforcing Model — Internal Algorithms

**Document Version:** 1.0  
**Classification:** INTERNAL SECRET — DO NOT PUBLISH  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## ⚠️ CONFIDENTIALITY NOTICE

This document contains the core antiforcing algorithms. Disclosure would enable cheating.

---

## 1. DETECTION ENGINE ARCHITECTURE

### 1.1 Multi-Signal Detection Pipeline

```python
# SECRET: Detection pipeline orchestration
class AntiforceEngine:
    """
    Central antiforcing detection and response engine.
    """
    
    # Detection thresholds
    THRESHOLD_SUSPICIOUS = 0.5
    THRESHOLD_LIKELY_VIOLATION = 0.7
    THRESHOLD_CONFIRMED_VIOLATION = 0.9
    
    # Response severity levels
    SEVERITY_NONE = 0
    SEVERITY_MONITOR = 1
    SEVERITY_SOFT_LIMIT = 2
    SEVERITY_HARD_LIMIT = 3
    SEVERITY_BLOCK = 4
    SEVERITY_SUSPEND = 5
    
    def __init__(self):
        self.detectors = [
            LocationSpoofDetector(),
            AutomationDetector(),
            MultiAccountDetector(),
            CollusionDetector(),
            EconomicExploitDetector(),
            TimingExploitDetector(),
        ]
        
        self.response_engine = ResponseEngine()
    
    def evaluate_action(self, action, user, context):
        """
        Evaluates a player action for violations.
        Returns: (allowed: bool, modifications: dict, flags: list)
        """
        signals = []
        
        # Run all detectors
        for detector in self.detectors:
            if detector.applicable(action):
                signal = detector.detect(action, user, context)
                if signal.score > 0:
                    signals.append(signal)
        
        # Aggregate signals
        aggregate_score = self._aggregate_signals(signals)
        
        # Determine response
        if aggregate_score >= self.THRESHOLD_CONFIRMED_VIOLATION:
            return self._handle_confirmed_violation(
                action, user, signals, aggregate_score
            )
        elif aggregate_score >= self.THRESHOLD_LIKELY_VIOLATION:
            return self._handle_likely_violation(
                action, user, signals, aggregate_score
            )
        elif aggregate_score >= self.THRESHOLD_SUSPICIOUS:
            return self._handle_suspicious(
                action, user, signals, aggregate_score
            )
        else:
            return True, {}, []
    
    def _aggregate_signals(self, signals):
        """
        Combines multiple detection signals into single score.
        Uses maximum with boosting for corroborating signals.
        """
        if not signals:
            return 0.0
        
        # Sort by score descending
        signals.sort(key=lambda s: s.score, reverse=True)
        
        # Start with max signal
        aggregate = signals[0].score
        
        # Boost for corroborating signals
        for i, signal in enumerate(signals[1:], 1):
            # Each additional signal adds diminishing boost
            boost = signal.score * (0.5 ** i)
            aggregate = min(1.0, aggregate + boost * 0.2)
        
        return aggregate
    
    def _handle_confirmed_violation(self, action, user, signals, score):
        """
        Handles definite violation.
        """
        # Log detailed violation
        self._log_violation(user, action, signals, score, 'confirmed')
        
        # Update trust score
        user.trust_score = max(0, user.trust_score - 20)
        
        # Determine if account should be suspended
        recent_violations = self._get_recent_violations(user, days=7)
        if len(recent_violations) >= 3:
            self.response_engine.suspend_account(
                user, 
                reason='Multiple confirmed violations',
                duration_hours=24 * 7
            )
        
        # Block action
        return False, {'blocked': True, 'reason': 'violation_detected'}, signals
    
    def _handle_likely_violation(self, action, user, signals, score):
        """
        Handles probable violation.
        """
        # Log
        self._log_violation(user, action, signals, score, 'likely')
        
        # Update trust score
        user.trust_score = max(0, user.trust_score - 10)
        
        # Apply soft limits
        modifications = {
            'reward_multiplier': 0.5,  # 50% reward reduction
            'cooldown_multiplier': 2.0,  # Double cooldowns
        }
        
        return True, modifications, signals
    
    def _handle_suspicious(self, action, user, signals, score):
        """
        Handles suspicious but not confirmed activity.
        """
        # Log for monitoring
        self._log_suspicious(user, action, signals, score)
        
        # Slight trust reduction
        user.trust_score = max(0, user.trust_score - 2)
        
        # Minor modifications
        modifications = {
            'reward_multiplier': 0.9,  # 10% reduction
            'increased_monitoring': True,
        }
        
        return True, modifications, signals
```

### 1.2 Behavioral Pattern Analysis

```python
# SECRET: Behavioral fingerprinting
class BehaviorAnalyzer:
    """
    Analyzes player behavior for automation detection.
    """
    
    # Normal human variance thresholds
    TIMING_CV_MIN = 0.15  # Minimum coefficient of variation
    TIMING_CV_MAX = 0.80  # Maximum before suspicious
    
    # Action frequency limits
    MAX_ACTIONS_PER_MINUTE = 10
    MAX_PERFECT_TIMINGS = 5  # Consecutive
    
    def analyze_session(self, user_id, session_actions):
        """
        Analyzes a session for automation indicators.
        Returns automation probability 0.0-1.0
        """
        indicators = []
        
        # Timing analysis
        timing_score = self._analyze_timing(session_actions)
        indicators.append(('timing', timing_score))
        
        # Precision analysis
        precision_score = self._analyze_precision(session_actions)
        indicators.append(('precision', precision_score))
        
        # Pattern analysis
        pattern_score = self._analyze_patterns(session_actions)
        indicators.append(('patterns', pattern_score))
        
        # Superhuman detection
        superhuman_score = self._detect_superhuman(session_actions)
        indicators.append(('superhuman', superhuman_score))
        
        # Weighted combination
        weights = {
            'timing': 0.35,
            'precision': 0.25,
            'patterns': 0.25,
            'superhuman': 0.15
        }
        
        total_score = sum(
            score * weights[name] for name, score in indicators
        )
        
        return total_score, indicators
    
    def _analyze_timing(self, actions):
        """
        Analyzes inter-action timing for automation.
        """
        if len(actions) < 5:
            return 0.0
        
        # Calculate inter-action intervals
        intervals = []
        for i in range(1, len(actions)):
            delta = (actions[i].timestamp - actions[i-1].timestamp)
            intervals.append(delta.total_seconds())
        
        if not intervals:
            return 0.0
        
        mean_interval = np.mean(intervals)
        std_interval = np.std(intervals)
        
        if mean_interval == 0:
            return 1.0  # Instant actions = definitely automated
        
        # Coefficient of variation
        cv = std_interval / mean_interval
        
        # Too consistent = suspicious (bots have low variance)
        if cv < self.TIMING_CV_MIN:
            return min(1.0, (self.TIMING_CV_MIN - cv) / self.TIMING_CV_MIN + 0.5)
        
        # Check for exact repeating intervals (bot signature)
        rounded_intervals = [round(i, 1) for i in intervals]
        most_common = max(set(rounded_intervals), key=rounded_intervals.count)
        repeat_ratio = rounded_intervals.count(most_common) / len(intervals)
        
        if repeat_ratio > 0.7:
            return 0.8 + repeat_ratio * 0.2
        
        return 0.0
    
    def _analyze_precision(self, actions):
        """
        Detects inhuman precision in actions.
        """
        precision_signals = []
        
        for action in actions:
            if action.type == 'marker_claim':
                # Check how close to edge of interaction radius
                distance_to_center = action.metadata.get('distance_to_marker')
                interaction_radius = action.metadata.get('interaction_radius')
                
                if distance_to_center and interaction_radius:
                    # Bots often claim exactly at edge (optimal efficiency)
                    edge_ratio = distance_to_center / interaction_radius
                    if edge_ratio > 0.95:
                        precision_signals.append(1.0)
                    elif edge_ratio > 0.9:
                        precision_signals.append(0.5)
        
        if precision_signals:
            return sum(precision_signals) / len(precision_signals)
        
        return 0.0
    
    def _detect_superhuman(self, actions):
        """
        Detects physically impossible action rates.
        """
        # Group by minute
        minute_buckets = {}
        for action in actions:
            minute_key = action.timestamp.replace(second=0, microsecond=0)
            minute_buckets.setdefault(minute_key, []).append(action)
        
        # Check each minute
        violations = 0
        for minute, minute_actions in minute_buckets.items():
            if len(minute_actions) > self.MAX_ACTIONS_PER_MINUTE:
                violations += 1
        
        if minute_buckets:
            return min(1.0, violations / len(minute_buckets) * 2)
        
        return 0.0
```

---

## 2. MULTI-ACCOUNT DETECTION

### 2.1 Device Fingerprinting

```python
# SECRET: Device fingerprinting for multi-account detection
class DeviceFingerprinter:
    """
    Creates and matches device fingerprints.
    """
    
    def generate_fingerprint(self, device_info):
        """
        Generates a fuzzy fingerprint from device info.
        Returns hash and confidence.
        """
        # Strong identifiers (stable)
        strong_signals = [
            device_info.get('device_id'),
            device_info.get('advertiser_id'),
            device_info.get('hardware_serial'),
        ]
        
        # Medium identifiers (semi-stable)
        medium_signals = [
            device_info.get('device_model'),
            device_info.get('os_version'),
            device_info.get('screen_resolution'),
            device_info.get('timezone'),
            device_info.get('language'),
        ]
        
        # Weak identifiers (variable)
        weak_signals = [
            device_info.get('carrier'),
            device_info.get('installed_fonts_hash'),
            device_info.get('battery_level_pattern'),
        ]
        
        # Generate component hashes
        strong_hash = self._hash_components(strong_signals)
        medium_hash = self._hash_components(medium_signals)
        weak_hash = self._hash_components(weak_signals)
        
        # Combine into fingerprint
        fingerprint = {
            'strong': strong_hash,
            'medium': medium_hash,
            'weak': weak_hash,
            'full': self._combine_hashes(strong_hash, medium_hash, weak_hash)
        }
        
        return fingerprint
    
    def match_fingerprints(self, fp1, fp2):
        """
        Calculates similarity between two fingerprints.
        Returns: (match_probability, confidence)
        """
        # Exact strong match = definite same device
        if fp1['strong'] and fp2['strong'] and fp1['strong'] == fp2['strong']:
            return 1.0, 0.95
        
        # Calculate component similarities
        strong_match = 1.0 if fp1['strong'] == fp2['strong'] else 0.0
        medium_match = self._fuzzy_match(fp1['medium'], fp2['medium'])
        weak_match = self._fuzzy_match(fp1['weak'], fp2['weak'])
        
        # Weighted combination
        probability = (
            strong_match * 0.6 +
            medium_match * 0.3 +
            weak_match * 0.1
        )
        
        # Confidence based on available data
        confidence = 0.5
        if fp1['strong'] and fp2['strong']:
            confidence += 0.3
        if medium_match > 0.8:
            confidence += 0.15
        
        return probability, min(confidence, 1.0)
    
    def find_related_accounts(self, user_fingerprint, all_fingerprints):
        """
        Finds accounts likely controlled by same person.
        """
        related = []
        
        for other_user_id, other_fp in all_fingerprints.items():
            prob, conf = self.match_fingerprints(user_fingerprint, other_fp)
            
            if prob > 0.7 and conf > 0.5:
                related.append({
                    'user_id': other_user_id,
                    'probability': prob,
                    'confidence': conf
                })
        
        return sorted(related, key=lambda x: x['probability'], reverse=True)
```

### 2.2 Network Correlation

```python
# SECRET: Network-based account correlation
class NetworkCorrelator:
    """
    Detects related accounts through network patterns.
    """
    
    def __init__(self):
        self.ip_history = {}  # user_id -> [ip_records]
        self.session_overlaps = {}
    
    def record_session(self, user_id, ip_address, session_info):
        """
        Records session for correlation analysis.
        """
        record = {
            'ip': self._hash_ip(ip_address),  # Privacy: hash IPs
            'ip_prefix': self._get_ip_prefix(ip_address),
            'timestamp': session_info['start_time'],
            'duration': session_info['duration'],
            'geo_location': session_info.get('geo'),
        }
        
        self.ip_history.setdefault(user_id, []).append(record)
    
    def find_correlated_accounts(self, user_id):
        """
        Finds accounts with suspicious network correlation.
        """
        user_ips = set(r['ip'] for r in self.ip_history.get(user_id, []))
        user_prefixes = set(r['ip_prefix'] for r in self.ip_history.get(user_id, []))
        
        correlations = []
        
        for other_id, other_records in self.ip_history.items():
            if other_id == user_id:
                continue
            
            other_ips = set(r['ip'] for r in other_records)
            other_prefixes = set(r['ip_prefix'] for r in other_records)
            
            # Exact IP matches (very suspicious)
            exact_matches = user_ips & other_ips
            
            # Prefix matches (same network)
            prefix_matches = user_prefixes & other_prefixes
            
            if exact_matches:
                # Check temporal overlap (not just same cafe at different times)
                temporal_score = self._check_temporal_correlation(
                    user_id, other_id, exact_matches
                )
                
                if temporal_score > 0.5:
                    correlations.append({
                        'user_id': other_id,
                        'type': 'exact_ip',
                        'matches': len(exact_matches),
                        'temporal_score': temporal_score,
                        'probability': 0.9 * temporal_score
                    })
            
            elif len(prefix_matches) > 3:
                correlations.append({
                    'user_id': other_id,
                    'type': 'same_network',
                    'matches': len(prefix_matches),
                    'probability': min(0.6, len(prefix_matches) * 0.1)
                })
        
        return correlations
    
    def _check_temporal_correlation(self, user1, user2, shared_ips):
        """
        Checks if accounts are used at similar times from same IP.
        High correlation = likely same person.
        """
        user1_sessions = [
            r for r in self.ip_history[user1] 
            if r['ip'] in shared_ips
        ]
        user2_sessions = [
            r for r in self.ip_history[user2]
            if r['ip'] in shared_ips
        ]
        
        overlaps = 0
        close_sequences = 0
        
        for s1 in user1_sessions:
            for s2 in user2_sessions:
                time_diff = abs(
                    (s1['timestamp'] - s2['timestamp']).total_seconds()
                )
                
                if time_diff < 60:  # Same minute
                    overlaps += 1
                elif time_diff < 300:  # Within 5 minutes
                    close_sequences += 1
        
        total_sessions = len(user1_sessions) + len(user2_sessions)
        if total_sessions == 0:
            return 0.0
        
        # Overlaps are very suspicious
        # Close sequences less so (could be legitimate switching)
        score = (overlaps * 0.3 + close_sequences * 0.1) / total_sessions
        
        return min(1.0, score)
```

---

## 3. COLLUSION DETECTION

```python
# SECRET: Collusion detection algorithms
class CollusionDetector:
    """
    Detects coordinated behavior between accounts.
    """
    
    def detect_collusion(self, user_ids, time_window_hours=24):
        """
        Analyzes group of users for collusion patterns.
        """
        # Get recent activities
        activities = {}
        for user_id in user_ids:
            activities[user_id] = self._get_user_activities(
                user_id, time_window_hours
            )
        
        signals = []
        
        # Check 1: Synchronized activity
        sync_score = self._check_synchronized_activity(activities)
        if sync_score > 0.5:
            signals.append(('synchronized', sync_score))
        
        # Check 2: Complementary patterns
        comp_score = self._check_complementary_patterns(activities)
        if comp_score > 0.5:
            signals.append(('complementary', comp_score))
        
        # Check 3: Benefit asymmetry
        asymmetry_score = self._check_benefit_asymmetry(user_ids)
        if asymmetry_score > 0.5:
            signals.append(('asymmetry', asymmetry_score))
        
        # Check 4: Communication patterns (if available)
        comm_score = self._check_communication(user_ids)
        if comm_score > 0.5:
            signals.append(('communication', comm_score))
        
        return signals
    
    def _check_synchronized_activity(self, activities):
        """
        Detects if users act in suspicious synchronization.
        """
        # Extract action timestamps per user
        timestamps = {}
        for user_id, acts in activities.items():
            timestamps[user_id] = [a.timestamp for a in acts]
        
        # Check for simultaneous actions
        window_seconds = 10  # Actions within 10 seconds
        simultaneous_count = 0
        total_comparisons = 0
        
        user_list = list(timestamps.keys())
        for i in range(len(user_list)):
            for j in range(i + 1, len(user_list)):
                for t1 in timestamps[user_list[i]]:
                    for t2 in timestamps[user_list[j]]:
                        total_comparisons += 1
                        if abs((t1 - t2).total_seconds()) < window_seconds:
                            simultaneous_count += 1
        
        if total_comparisons == 0:
            return 0.0
        
        sync_ratio = simultaneous_count / total_comparisons
        
        # Expected random coincidence is low
        # High ratio = suspicious coordination
        if sync_ratio > 0.3:
            return min(1.0, sync_ratio * 2)
        
        return 0.0
    
    def _check_benefit_asymmetry(self, user_ids):
        """
        Detects if one account benefits at others' expense.
        Common in farming/boosting schemes.
        """
        # Get reward histories
        rewards = {}
        for user_id in user_ids:
            rewards[user_id] = self._get_user_rewards(user_id)
        
        # Calculate benefit distribution
        total_rewards = sum(sum(r) for r in rewards.values())
        if total_rewards == 0:
            return 0.0
        
        distributions = [
            sum(r) / total_rewards for r in rewards.values()
        ]
        
        # Check for extreme asymmetry
        max_share = max(distributions)
        min_share = min(distributions)
        
        if max_share > 0.8:  # One account gets 80%+ of rewards
            return 0.9
        elif max_share > 0.6:
            return 0.6
        elif min_share < 0.05 and len(user_ids) > 2:
            # Some accounts barely rewarded = likely support accounts
            return 0.5
        
        return 0.0
```

---

## 4. RESPONSE ENGINE

```python
# SECRET: Graduated response system
class ResponseEngine:
    """
    Applies appropriate responses to detected violations.
    """
    
    RESPONSE_TYPES = {
        'monitor': {
            'duration_hours': 24,
            'effects': ['increased_logging']
        },
        'soft_limit': {
            'duration_hours': 6,
            'effects': ['reduced_rewards', 'extended_cooldowns']
        },
        'hard_limit': {
            'duration_hours': 24,
            'effects': ['blocked_premium_features', 'max_cooldowns']
        },
        'temporary_suspension': {
            'duration_hours': 168,  # 1 week
            'effects': ['no_gameplay', 'prize_disqualification']
        },
        'permanent_ban': {
            'duration_hours': -1,  # Forever
            'effects': ['account_disabled', 'all_prizes_voided']
        }
    }
    
    def apply_response(self, user, violation_type, severity, signals):
        """
        Applies graduated response based on violation severity and history.
        """
        # Get user's violation history
        history = self._get_violation_history(user.id)
        
        # Calculate appropriate response level
        response_level = self._calculate_response_level(
            severity, history, violation_type
        )
        
        # Apply response
        response = self.RESPONSE_TYPES[response_level]
        
        # Record response
        self._record_response(user.id, response_level, signals)
        
        # Apply effects
        for effect in response['effects']:
            self._apply_effect(user, effect, response['duration_hours'])
        
        return response_level
    
    def _calculate_response_level(self, severity, history, violation_type):
        """
        Determines response level from severity and history.
        """
        # Base level from severity
        if severity >= 0.9:
            base_level = 'hard_limit'
        elif severity >= 0.7:
            base_level = 'soft_limit'
        else:
            base_level = 'monitor'
        
        # Escalate based on history
        recent_violations = [
            v for v in history 
            if v.created_at > datetime.now() - timedelta(days=30)
        ]
        
        if len(recent_violations) >= 5:
            return 'permanent_ban'
        elif len(recent_violations) >= 3:
            return 'temporary_suspension'
        elif len(recent_violations) >= 1:
            # Escalate one level
            levels = list(self.RESPONSE_TYPES.keys())
            current_idx = levels.index(base_level)
            return levels[min(current_idx + 1, len(levels) - 1)]
        
        return base_level
    
    def _apply_effect(self, user, effect, duration_hours):
        """
        Applies specific effect to user account.
        """
        expiry = datetime.now() + timedelta(hours=duration_hours) \
                 if duration_hours > 0 else None
        
        if effect == 'reduced_rewards':
            user.reward_multiplier = 0.5
            user.reward_multiplier_expires = expiry
        
        elif effect == 'extended_cooldowns':
            user.cooldown_multiplier = 2.0
            user.cooldown_multiplier_expires = expiry
        
        elif effect == 'blocked_premium_features':
            user.premium_blocked = True
            user.premium_blocked_expires = expiry
        
        elif effect == 'no_gameplay':
            user.gameplay_suspended = True
            user.gameplay_suspended_expires = expiry
        
        elif effect == 'account_disabled':
            user.account_status = 'banned'
            user.banned_at = datetime.now()
            user.ban_reason = 'antiforcing_violation'
```

---

## INTELLECTUAL PROPERTY NOTICE

The Antiforcing algorithms in this document are exclusive trade secrets. Disclosure would compromise game integrity.

**CLASSIFICATION: INTERNAL SECRET — MAXIMUM PROTECTION**

---

**Document End — INTERNAL SECRET**

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved




