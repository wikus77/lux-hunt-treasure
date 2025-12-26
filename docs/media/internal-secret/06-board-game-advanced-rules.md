# M1SSION™ MEDIA EXPANSION PACK — INTERNAL SECRET
## Volume 06: Board Game Advanced Rules

**Document Version:** 1.0  
**Classification:** INTERNAL SECRET — NOT FOR DISTRIBUTION  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## ⚠️ CONFIDENTIALITY NOTICE

This document contains proprietary game mechanics and balancing formulas. Unauthorized disclosure would enable unauthorized reproductions and damage competitive positioning.

---

## 1. HIDDEN MECHANICS

### 1.1 Prize Distribution Algorithm

**The public rules state prizes are "randomly" distributed. The actual system:**

**Prize Placement Formula:**
```
PlacementScore = (DistanceFromStart × 0.3) + 
                 (EntityZoneProximity × 0.25) + 
                 (TrafficProbability × 0.25) + 
                 (RandomFactor × 0.2)
```

**Variables:**
- DistanceFromStart: 1-10 based on tile distance from center
- EntityZoneProximity: Higher values near entity zones
- TrafficProbability: Calculated from playtest movement patterns
- RandomFactor: True random 1-10

**Result:** Prizes appear somewhat random but cluster in high-tension areas.

### 1.2 Entity Movement AI

**Public: "Entities move based on card draws"**
**Reality: Card draws are weighted by game state**

**Entity Movement Weighting:**
```
MCP Movement: Toward player in last place
SHADOW Movement: Toward player in first place
ECHO Movement: Toward unclaimed prizes
```

**Card Deck Construction:**
- 8 cards per entity
- 3 cards specify movement direction
- 3 cards specify effects
- 2 cards are wild

**The cards themselves are designed so that:**
- Early game: Entities spread out (exploration phase)
- Mid game: Entities cluster (tension phase)
- Late game: Entities converge on leaders (climax phase)

### 1.3 Pulse Die Weighting

**Public: "Roll the Pulse Die for signal strength"**
**Reality: Custom die faces create desired distribution**

**Die Face Configuration:**
- Face 1: Signal Weak (appears twice)
- Face 2: Signal Medium (appears twice)
- Face 3: Signal Strong (appears once)
- Face 4: Interference (appears once)

**Probability Distribution:**
- 33%: Weak signal (progress but slow)
- 33%: Medium signal (standard progress)
- 17%: Strong signal (breakthrough moment)
- 17%: Interference (tension/setback)

This creates a experience where breakthroughs feel earned and setbacks feel fair.

---

## 2. BALANCING SECRETS

### 2.1 Agent Ability Tuning

**Each agent ability was playtested for win rate:**

| Agent | Initial Win Rate | Adjusted To |
|-------|------------------|-------------|
| Veteran | 28% | 18% |
| Hacker | 22% | 17% |
| Athlete | 19% | 17% |
| Analyst | 15% | 16% |
| Operative | 12% | 16% |
| Insider | 11% | 16% |

**Adjustments Made:**
- Veteran: Once per game ability (was every round)
- Hacker: Can only hack adjacent (was any player)
- Athlete: Reduced to 4 actions (was 5)
- Analyst: Clues count double (was triple)
- Operative: Added SHADOW immunity
- Insider: Added entity movement ability

**Target:** 16-18% win rate per agent, with slight variance for playstyle preferences.

### 2.2 Equipment Pricing

**Equipment costs follow this formula:**
```
Cost = (PowerLevel × 2) + (FrequencyOfUse × 1) - (RiskFactor × 1)
```

**Example: Shield**
- PowerLevel: 2 (blocks one effect)
- FrequencyOfUse: 1 (situational)
- RiskFactor: 0 (no downside)
- Cost = (2×2) + (1×1) - (0×1) = 5
- Adjusted to 3 for accessibility

### 2.3 Game Length Tuning

**Target: 60-90 minutes**

**Levers Used:**
- Prize count: 21 (reduced from 30)
- Pulse Energy regeneration: 2/turn (increased from 1)
- Movement cost: 1 action (reduced from 2)
- Entity frequency: Every turn (increased from every other)

**Result:** Average playtest time: 72 minutes

---

## 3. LEGACY CAMPAIGN SECRETS

### 3.1 Campaign Arc Structure

**"M1SSION™: CHRONICLES" — 12 Session Structure**

**Sessions 1-3: Foundation**
- Learn rules progressively
- Unlock basic stickers
- Meet entity personalities
- No permanent death possible

**Sessions 4-6: Escalation**
- Introduce hidden traitor mechanic
- Unlock advanced equipment
- First permanent consequence possible
- Entity relationships develop

**Sessions 7-9: Crisis**
- High stakes decisions
- Character death possible (but replaceable)
- Major reveal about entity origins
- Choose faction allegiance

**Sessions 10-12: Resolution**
- Faction paths diverge
- Multiple ending possibilities
- Final permanent changes
- Legacy conclusion

### 3.2 Hidden Envelopes

**Envelope Triggers (Not Disclosed to Players):**

| Envelope | Trigger | Contents |
|----------|---------|----------|
| A | Win with 25+ points | Entity alliance option |
| B | Player elimination | New character entry |
| C | All entities in one zone | Entity revelation |
| D | 3 consecutive shadow encounters | Shadow recruitment option |
| E | Complete without Buzz | Stealth achievement |
| F | Entity defeat | Entity weakened state rules |
| G | Perfect cooperation | Team bonus unlocked |
| H | Total betrayal | Chaos rules |
| I | Session 12 reached | Finale components |

### 3.3 Faction Systems

**Faction Choice (Session 7):**
- Organization: Trust the system, order
- Resistance: Destroy the entities, freedom
- Synthesis: Merge with entities, evolution

**Faction Affects:**
- Card availability
- Entity relationships
- Ending requirements
- Sticker unlocks

**Faction Balance:**
Each faction has unique challenges. No faction is "right." Player choice should feel meaningful.

---

## 4. MULTIPLAYER BALANCING

### 4.1 Player Count Adjustments

**2 Players:**
- Each controls 2 agents
- Reduced prize pool (14)
- 4 tiles instead of 6
- Entities less aggressive

**3 Players:**
- Standard rules
- 5 tiles
- 18 prizes
- Balanced entity aggression

**4 Players:**
- Standard rules
- 6 tiles
- 21 prizes
- Standard entity aggression

**5-6 Players:**
- Team variant recommended
- 6 tiles + expansion recommended
- 24+ prizes
- Increased entity aggression

### 4.2 First Player Advantage Mitigation

**Problem:** First player has 5-8% higher win rate
**Solution:** Last player starts with 3 Pulse Energy (others start with 2)

### 4.3 Runaway Leader Prevention

**Catch-Up Mechanics:**
- MCP moves toward last place player (help)
- SHADOW moves toward first place (hindrance)
- Prize values hidden until claimed (uncertainty)
- Equipment discounts for trailing players (hidden)

---

## 5. EXPANSION DESIGN RULES

### 5.1 Power Creep Prevention

**Expansion Content Limits:**
- No agent with >18% theoretical win rate
- No equipment that obsoletes core equipment
- No prize values exceeding core maximum
- Entity abilities must remain balanced

### 5.2 Complexity Budget

**Core Game:** Complexity score 5/10
**With One Expansion:** Maximum 6.5/10
**With Two Expansions:** Maximum 7.5/10
**Never Exceed:** 8/10

**Complexity Measured By:**
- Rule count
- Decision points per turn
- Tracking requirements
- Setup time

### 5.3 Integration Requirements

**Every Expansion Must:**
- Work with core only
- Work with all previous expansions
- Not require any other expansion
- Add <15 minutes to play time
- Include integration cards for base components

---

## 6. APP INTEGRATION MECHANICS

### 6.1 AI Entity Control

**When app controls entities:**

**Behavior Algorithms:**
```
MCP: MoveTo(LowestScorePlayer.Position)
     Action: Provide resource if player <3 Pulse

SHADOW: MoveTo(HighestScorePlayer.Position)
        Action: Challenge if player in zone
        
ECHO: MoveTo(NearestUnclaimedPrize.Position)
      Action: Reveal hint if player approaches
```

**Difficulty Scaling:**
- Easy: Entities help more than hinder
- Normal: Balanced (default)
- Hard: Entities coordinate against leader
- Expert: Entities actively hostile

### 6.2 Timer Mode Mechanics

**Time Pressure System:**
- Round timer: 5 minutes
- Turn timer: 90 seconds
- Bonus time: Earned through play

**Overtime Penalties:**
- 1st offense: Lose 1 Pulse
- 2nd offense: Skip action phase
- 3rd offense: Entity attack

### 6.3 Campaign Sync

**Cross-Platform Features:**
- Campaign progress saved
- Digital achievements
- Leaderboard contribution
- Exclusive digital rewards

---

## 7. PROTOTYPE TESTING PROTOCOLS

### 7.1 Balance Testing Requirements

**Before Release:**
- 100+ playtest games
- All agent combinations tested
- All equipment interactions verified
- All expansion combinations tested

**Playtest Group Composition:**
- 30% hardcore gamers
- 40% casual gamers
- 20% non-gamers
- 10% children (14+)

### 7.2 Iteration Protocol

**When Win Rate Deviates >2%:**
1. Identify source
2. Design three potential fixes
3. Test each fix (10 games minimum)
4. Select best performing
5. Verify with 20 additional games
6. Document changes

### 7.3 Final Verification

**Release Criteria:**
- [ ] All agents: 15-19% win rate
- [ ] Average game time: 60-90 minutes
- [ ] Setup time: <10 minutes
- [ ] Rules clarity: <3 questions per game average
- [ ] Enjoyment survey: >8/10 average

---

## 8. MANUFACTURING SECRETS

### 8.1 Component Specifications

**Card Stock:**
- 300gsm minimum
- Linen finish (prevents slippage)
- Black core (prevents light bleed)
- UV coating (durability)

**Token Construction:**
- 2mm chipboard minimum
- Die-cut precision: ±0.5mm
- Rounded corners: 2mm radius

**Die Manufacturing:**
- Balanced faces (tested)
- Edge paint (consistent)
- Size: 16mm standard

### 8.2 Cost Optimization

**Keeping MSRP Under $60:**
- Meeples instead of miniatures (core)
- Standard dice instead of custom shapes
- Cards instead of tiles where possible
- Efficient box size

**Premium Edition Justification ($100):**
- Custom miniatures
- Metal tokens
- Larger box with art
- Exclusive expansion content

---

## 9. SUMMARY

Board game secrets include:

1. **Prize Algorithm** — Weighted randomness for tension
2. **Entity AI** — State-based movement
3. **Die Probability** — Designed for experience
4. **Agent Balance** — Tuned to 16-18% each
5. **Legacy Structure** — 12 sessions, hidden triggers
6. **Player Scaling** — Count-based adjustments
7. **Catch-Up Mechanics** — Hidden leader prevention
8. **App Integration** — Behavior algorithms

These mechanics create balanced, engaging gameplay while maintaining apparent randomness.

---

**Document End**

*This document contains M1SSION™ proprietary game design.*
*Unauthorized distribution is prohibited.*

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved





