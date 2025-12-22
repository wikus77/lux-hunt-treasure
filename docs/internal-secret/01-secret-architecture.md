# M1SSION™ INTERNAL SECRET DOCUMENTATION
## Volume 1: Secret System Architecture

**Document Version:** 1.0  
**Classification:** INTERNAL SECRET — DO NOT PUBLISH  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## ⚠️ CONFIDENTIALITY NOTICE

This document contains proprietary trade secrets and confidential information. Unauthorized access, copying, distribution, or disclosure is strictly prohibited and may result in legal action.

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

### 1.1 Layered Architecture

The M1SSION™ platform operates on a five-layer architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│    Mobile Apps (iOS/Android) | PWA | Admin Dashboard         │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                         │
│    API Gateway | Business Logic | Event Processing           │
├─────────────────────────────────────────────────────────────┤
│                    INTELLIGENCE LAYER                        │
│    GEO-PULSE ENGINE™ | Antiforcing Model | Analytics         │
├─────────────────────────────────────────────────────────────┤
│                    DATA LAYER                                │
│    PostgreSQL | Redis Cache | Time-Series DB | Blob Storage  │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                      │
│    Edge Functions | CDN | Load Balancing | Monitoring        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Core Service Architecture

```
                    ┌─────────────────┐
                    │   API Gateway   │
                    │  (Rate Limited) │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Location Svc   │ │   Game Logic    │ │   Economy Svc   │
│  (GEO-PULSE)    │ │   Service       │ │   Service       │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Antiforcing    │
                    │  Engine         │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   PostgreSQL    │ │     Redis       │ │   Analytics     │
│   (Primary DB)  │ │   (Cache/Pub)   │ │   Pipeline      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 2. DATABASE SCHEMA (CRITICAL TABLES)

### 2.1 User Core Tables

```sql
-- Core user identity
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    account_status VARCHAR(50) DEFAULT 'active',
    trust_score INTEGER DEFAULT 50,  -- ANTIFORCING: 0-100 scale
    flags JSONB DEFAULT '{}'
);

-- Player game profile
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    display_name VARCHAR(100),
    level INTEGER DEFAULT 1,
    xp BIGINT DEFAULT 0,
    rank_id INTEGER DEFAULT 1,
    m1u_balance BIGINT DEFAULT 0,
    pulse_energy INTEGER DEFAULT 100,
    pulse_capacity INTEGER DEFAULT 100,
    energy_updated_at TIMESTAMP DEFAULT NOW(),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    total_markers_claimed INTEGER DEFAULT 0,
    total_buzz_count INTEGER DEFAULT 0,
    total_buzz_map_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ANTIFORCING: Trust tracking
CREATE TABLE user_trust_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    trust_delta INTEGER,
    reason VARCHAR(255),
    confidence_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 Location Tables

```sql
-- Real-time user positions (encrypted)
CREATE TABLE user_locations (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    lat DECIMAL(10, 7),  -- Encrypted at rest
    lng DECIMAL(10, 7),  -- Encrypted at rest
    accuracy DECIMAL(6, 2),
    altitude DECIMAL(8, 2),
    heading DECIMAL(5, 2),
    speed DECIMAL(6, 2),
    source VARCHAR(50),  -- 'gps', 'network', 'fused'
    confidence INTEGER,  -- GEO-PULSE confidence 0-100
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Location history (sampling)
CREATE TABLE location_samples (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7),
    accuracy DECIMAL(6, 2),
    velocity DECIMAL(6, 2),
    session_id UUID,
    sampled_at TIMESTAMP DEFAULT NOW()
);

-- ANTIFORCING: Suspicious location events
CREATE TABLE location_anomalies (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    anomaly_type VARCHAR(100),
    severity INTEGER,  -- 1-5 scale
    details JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.3 Marker Tables

```sql
-- Marker definitions
CREATE TABLE markers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID,
    lat DECIMAL(10, 7) NOT NULL,
    lng DECIMAL(10, 7) NOT NULL,
    marker_type VARCHAR(50) NOT NULL,
    reward_type VARCHAR(50),
    reward_value INTEGER,
    reward_variance DECIMAL(3, 2) DEFAULT 0.1,  -- SECRET: ±10% variance
    signal_strength INTEGER DEFAULT 50,
    detection_radius INTEGER DEFAULT 200,
    interaction_radius INTEGER DEFAULT 30,
    level_requirement INTEGER DEFAULT 1,
    max_claims INTEGER,
    current_claims INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    activation_time TIMESTAMP,
    expiration_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Marker claims
CREATE TABLE marker_claims (
    id SERIAL PRIMARY KEY,
    marker_id UUID REFERENCES markers(id),
    user_id UUID REFERENCES users(id),
    claimed_at TIMESTAMP DEFAULT NOW(),
    reward_actual INTEGER,  -- After variance applied
    position_lat DECIMAL(10, 7),
    position_lng DECIMAL(10, 7),
    position_accuracy DECIMAL(6, 2),
    confidence_score INTEGER,
    UNIQUE(marker_id, user_id)  -- One claim per user per marker
);
```

### 2.4 Buzz Map Tables

```sql
-- Buzz Map activations
CREATE TABLE buzz_map_activations (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    center_lat DECIMAL(10, 7),
    center_lng DECIMAL(10, 7),
    tier VARCHAR(50),
    cost_m1u INTEGER,
    cost_energy INTEGER,
    base_radius INTEGER,
    final_radius INTEGER,  -- After modifiers
    radius_modifiers JSONB,  -- SECRET: Modifier breakdown
    markers_revealed INTEGER,
    active_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- SECRET: Radius calculation log
CREATE TABLE radius_calculations (
    id SERIAL PRIMARY KEY,
    activation_id INTEGER REFERENCES buzz_map_activations(id),
    base_value INTEGER,
    level_modifier DECIMAL(4, 3),
    subscription_modifier DECIMAL(4, 3),
    area_modifier DECIMAL(4, 3),
    time_modifier DECIMAL(4, 3),
    random_variance DECIMAL(4, 3),
    final_value INTEGER,
    formula_version VARCHAR(20)
);
```

---

## 3. CRITICAL ALGORITHMS (PSEUDOCODE)

### 3.1 Trust Score Calculation

```python
# SECRET: Trust score algorithm
def calculate_trust_score(user_id):
    """
    Trust score determines access level and reward modifiers.
    Range: 0-100, default 50 for new users.
    """
    
    # Base components
    account_age_score = min(account_age_days / 180 * 20, 20)  # Max 20 pts
    verification_score = 10 if email_verified else 0
    verification_score += 10 if phone_verified else 0  # Max 20 pts
    
    # Activity components
    activity_score = min(total_actions / 1000 * 20, 20)  # Max 20 pts
    
    # Violation components (negative)
    violation_penalty = sum([
        v.severity * v.recency_weight 
        for v in recent_violations
    ])
    violation_penalty = min(violation_penalty, 40)  # Max -40 pts
    
    # Anomaly components (negative)
    anomaly_penalty = count_unresolved_anomalies * 5  # -5 per anomaly
    anomaly_penalty = min(anomaly_penalty, 30)  # Max -30 pts
    
    # Positive behavior bonus
    clean_days = days_since_last_violation
    behavior_bonus = min(clean_days / 30 * 10, 20)  # Max 20 pts
    
    # Calculate final score
    raw_score = (
        account_age_score +
        verification_score +
        activity_score +
        behavior_bonus -
        violation_penalty -
        anomaly_penalty
    )
    
    # Clamp to 0-100
    return max(0, min(100, raw_score))
```

### 3.2 Location Confidence Calculation

```python
# SECRET: GEO-PULSE location confidence algorithm
def calculate_location_confidence(location_data, user_history):
    """
    Determines confidence that reported location is authentic.
    Range: 0-100
    """
    
    confidence = 100  # Start with full confidence
    
    # GPS quality factors
    if location_data.accuracy > 50:  # Meters
        confidence -= min((location_data.accuracy - 50) / 10, 20)
    
    if location_data.source == 'network':
        confidence -= 10  # Network positioning less reliable
    
    # Movement plausibility
    if user_history.last_position:
        time_delta = location_data.timestamp - user_history.last_timestamp
        distance = haversine_distance(
            user_history.last_position, 
            location_data.position
        )
        implied_speed = distance / time_delta.total_seconds() * 3.6  # km/h
        
        # Speed limits by mode
        if implied_speed > 150:  # Impossible speed
            confidence -= 50
        elif implied_speed > 120:  # Likely vehicle on highway
            confidence -= 10
        elif implied_speed > 50 and time_delta.total_seconds() < 60:
            confidence -= 20  # Suspicious short-distance speed
    
    # Sensor correlation (if available)
    if location_data.accelerometer_data:
        movement_indicated = analyze_accelerometer(
            location_data.accelerometer_data
        )
        if location_data.implied_movement and not movement_indicated:
            confidence -= 30  # Position changed but no movement detected
    
    # Mock location detection
    if location_data.is_mock_location:
        confidence = 0  # Definite spoof
    
    # Historical pattern analysis
    pattern_score = analyze_movement_pattern(user_history)
    if pattern_score < 0.5:
        confidence -= 20 * (1 - pattern_score)
    
    # Network correlation
    if not verify_network_location(location_data):
        confidence -= 15
    
    return max(0, confidence)
```

### 3.3 Reward Value Calculation

```python
# SECRET: Reward calculation with variance
def calculate_reward_value(marker, user, claim_context):
    """
    Calculates actual reward value for a marker claim.
    Includes variance and modifiers.
    """
    
    base_value = marker.reward_value
    
    # Apply variance (±10% by default)
    variance_range = base_value * marker.reward_variance
    variance = random.uniform(-variance_range, variance_range)
    value = base_value + variance
    
    # Level modifier: +0.5% per level above 1
    level_modifier = 1 + ((user.level - 1) * 0.005)
    value *= level_modifier
    
    # Subscription modifier: +15% for premium
    if user.subscription_tier == 'premium':
        value *= 1.15
    elif user.subscription_tier == 'elite':
        value *= 1.25
    
    # Streak modifier: +2% per streak day, max +20%
    streak_modifier = 1 + min(user.current_streak * 0.02, 0.20)
    value *= streak_modifier
    
    # Trust score modifier (ANTIFORCING)
    # Low trust = reduced rewards
    if user.trust_score < 50:
        trust_penalty = (50 - user.trust_score) / 100
        value *= (1 - trust_penalty * 0.5)  # Up to -25% for trust 0
    
    # Time modifier (off-peak bonus)
    hour = claim_context.timestamp.hour
    if hour >= 2 and hour < 6:
        value *= 1.10  # +10% night owl bonus
    
    # First-of-day bonus
    if is_first_claim_today(user):
        value *= 1.05  # +5% first claim bonus
    
    # Round to integer
    return int(round(value))
```

---

## 4. SERVICE COMMUNICATION PROTOCOLS

### 4.1 Internal API Authentication

```python
# SECRET: Service-to-service authentication
SERVICE_SECRETS = {
    'location-service': 'sk_loc_xxx',
    'game-logic': 'sk_game_xxx',
    'economy-service': 'sk_eco_xxx',
    'antiforcing': 'sk_anti_xxx'
}

def sign_internal_request(service_name, payload):
    """
    Signs internal service requests with HMAC-SHA256.
    """
    secret = SERVICE_SECRETS[service_name]
    timestamp = int(time.time())
    
    message = f"{timestamp}:{json.dumps(payload, sort_keys=True)}"
    signature = hmac.new(
        secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return {
        'X-Service-Name': service_name,
        'X-Timestamp': str(timestamp),
        'X-Signature': signature
    }
```

### 4.2 Event Queue Structure

```python
# SECRET: Internal event types and routing
EVENT_ROUTING = {
    'location.update': ['antiforcing', 'analytics'],
    'buzz.completed': ['game-logic', 'analytics', 'antiforcing'],
    'marker.claimed': ['economy-service', 'analytics', 'antiforcing'],
    'anomaly.detected': ['antiforcing', 'alerts'],
    'trust.changed': ['game-logic', 'economy-service'],
}

EVENT_PRIORITIES = {
    'anomaly.detected': 1,  # Highest priority
    'trust.changed': 2,
    'marker.claimed': 3,
    'buzz.completed': 4,
    'location.update': 5,  # Lower priority (high volume)
}
```

---

## 5. RATE LIMITING CONFIGURATION

```python
# SECRET: Rate limiting rules
RATE_LIMITS = {
    # Per-user limits
    'buzz.action': {
        'window_seconds': 60,
        'max_requests': 10,
        'penalty_seconds': 300  # 5 min block if exceeded
    },
    'buzz_map.activation': {
        'window_seconds': 300,
        'max_requests': 5,
        'penalty_seconds': 600
    },
    'marker.claim': {
        'window_seconds': 60,
        'max_requests': 20,
        'penalty_seconds': 300
    },
    'location.update': {
        'window_seconds': 10,
        'max_requests': 5,
        'penalty_seconds': 60
    },
    
    # Global limits (all users)
    'global.claims_per_minute': 10000,
    'global.activations_per_minute': 5000,
}

# Trust-based rate limit modifiers
TRUST_RATE_MODIFIERS = {
    (90, 100): 1.5,   # High trust: 50% more requests allowed
    (70, 89): 1.0,    # Normal trust: standard limits
    (50, 69): 0.75,   # Low trust: 25% reduction
    (0, 49): 0.5,     # Very low trust: 50% reduction
}
```

---

## 6. ENCRYPTION AND SECURITY

### 6.1 Data Encryption

```python
# SECRET: Encryption configuration
ENCRYPTION_CONFIG = {
    'location_data': {
        'algorithm': 'AES-256-GCM',
        'key_rotation_days': 30,
        'at_rest': True,
        'in_transit': True
    },
    'user_pii': {
        'algorithm': 'AES-256-GCM',
        'key_rotation_days': 90,
        'at_rest': True,
        'in_transit': True
    },
    'payment_data': {
        'algorithm': 'handled_by_stripe',
        'stored': False  # Never stored
    }
}

# Key derivation for user-specific encryption
def derive_user_key(user_id, master_key):
    """
    Derives user-specific encryption key from master key.
    """
    return hashlib.pbkdf2_hmac(
        'sha256',
        master_key.encode(),
        user_id.encode(),
        iterations=100000,
        dklen=32
    )
```

### 6.2 API Security

```python
# SECRET: API security configuration
API_SECURITY = {
    'jwt_secret': 'REDACTED',  # Actual secret in env vars
    'jwt_expiry_seconds': 3600,
    'refresh_token_expiry_days': 30,
    'max_failed_logins': 5,
    'lockout_duration_minutes': 30,
    'require_2fa_for': ['prize_claim', 'large_withdrawal'],
    'ip_whitelist_admin': ['REDACTED'],
}
```

---

## 7. MONITORING AND ALERTING

### 7.1 Alert Thresholds

```python
# SECRET: Alert configuration
ALERT_THRESHOLDS = {
    'anomaly_rate': {
        'warning': 0.05,  # 5% of requests anomalous
        'critical': 0.10,  # 10% of requests anomalous
    },
    'claim_velocity': {
        'warning': 2.0,  # 2x normal rate
        'critical': 5.0,  # 5x normal rate
    },
    'spoof_attempts': {
        'warning': 100,  # Per hour
        'critical': 500,  # Per hour
    },
    'error_rate': {
        'warning': 0.01,  # 1% errors
        'critical': 0.05,  # 5% errors
    }
}
```

---

## 8. DISASTER RECOVERY

### 8.1 Backup Configuration

```python
# SECRET: Backup and recovery configuration
BACKUP_CONFIG = {
    'database': {
        'frequency': 'hourly',
        'retention_days': 30,
        'encryption': True,
        'offsite_copies': 2
    },
    'user_data': {
        'frequency': 'daily',
        'retention_days': 90,
        'encryption': True
    },
    'analytics': {
        'frequency': 'daily',
        'retention_days': 365
    }
}

RECOVERY_TARGETS = {
    'rpo_minutes': 60,  # Recovery Point Objective
    'rto_minutes': 30,  # Recovery Time Objective
}
```

---

## INTELLECTUAL PROPERTY NOTICE

All architecture, algorithms, configurations, and implementations described in this document are the exclusive trade secrets of Joseph MULÉ and NIYVORA KFT™.

This document is classified as INTERNAL SECRET and must never be distributed outside authorized personnel.

---

**Document End — INTERNAL SECRET**

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved




