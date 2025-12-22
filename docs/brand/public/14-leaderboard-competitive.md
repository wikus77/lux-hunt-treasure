# M1SSION™ BRAND & DESIGN BIBLE
## Volume 14: Leaderboard & Competitive UI

**Document Version:** 1.0  
**Classification:** PUBLIC — SafeCreative Registration  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## 1. COMPETITIVE DESIGN PHILOSOPHY

### 1.1 Core Principles

Competition in M1SSION™ creates engagement through:

1. **Visibility** — Players see their standing
2. **Motivation** — Progress toward goals
3. **Recognition** — Achievement celebration
4. **Fairness** — Transparent ranking

### 1.2 Competitive Elements

**Leaderboards:**
- Global rankings
- Regional rankings
- Mission-specific rankings

**Achievements:**
- Progress milestones
- Special accomplishments
- Collection badges

**Rewards:**
- Position-based prizes
- Tier rewards
- Recognition features

---

## 2. LEADERBOARD VISUAL DESIGN

### 2.1 Page Layout

```
┌─────────────────────────────────────────────────┐
│              LEADERBOARD                         │
│  ┌─────────────────────────────────────────┐    │
│  │ [GLOBAL] [REGION] [MISSION] [FRIENDS]   │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │  🥇 1. Agent_Alpha ........ 2,847 pts    │    │
│  │  🥈 2. Hunter_01 .......... 2,654 pts    │    │
│  │  🥉 3. Shadow_X ........... 2,501 pts    │    │
│  │─────────────────────────────────────────│    │
│  │  4. Player_Name ........... 2,234 pts    │    │
│  │  5. Agent_Beta ............ 2,189 pts    │    │
│  │  ...                                     │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │  YOUR RANK: #47  |  1,456 pts           │    │
│  │  [VIEW YOUR POSITION]                    │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 2.2 Color Scheme

**Podium Colors:**
- Gold (1st): #FFD700
- Silver (2nd): #C0C0C0
- Bronze (3rd): #CD7F32

**Tier Colors:**
- Elite tier: Gold glow
- High tier: Cyan glow
- Standard: No special effect

**Your Position:**
- Highlighted row
- Cyan border/background
- "YOU" indicator

### 2.3 Typography

**Player Names:**
- Font: Inter, 15px
- Truncate if too long
- Max 16 characters visible

**Scores/Points:**
- Font: Electrolize, 16px
- Monospace alignment
- Formatted with commas

**Rank Numbers:**
- Font: Electrolize, 14px
- Medal icons for top 3
- Numbers for others

---

## 3. LEADERBOARD ENTRY DESIGN

### 3.1 Standard Entry

```
┌─────────────────────────────────────────────────┐
│  #47   [Avatar]   AgentName    ▸   1,456 pts    │
└─────────────────────────────────────────────────┘
```

**Components:**
- Rank number
- Player avatar (32px circle)
- Player name
- Spacer/dots
- Score/points

**Styling:**
- Row height: 56px
- Padding: 12px horizontal
- Divider between rows
- Hover state (desktop)

### 3.2 Top 3 Entries

**Enhanced visual treatment:**
- Larger avatars (48px)
- Medal icons
- Glow effect matching metal
- Slightly larger row height (64px)

**Gold (1st):**
- Gold gradient background
- Subtle particle effect
- Crown icon option

**Silver (2nd):**
- Silver tint
- Metallic border

**Bronze (3rd):**
- Bronze tint
- Subtle highlight

### 3.3 Current User Entry

**Highlighted row:**
- Cyan border/outline
- Slightly elevated (shadow)
- "YOU" badge
- Always visible context

---

## 4. LEADERBOARD TABS

### 4.1 Tab Options

**Global:**
- All players worldwide
- Massive numbers
- Top of competition

**Regional:**
- By country/area
- Local competition
- More attainable goals

**Mission:**
- Current mission only
- Fresh start each mission
- Direct competition

**Friends:**
- Connected players
- Social competition
- Personal ranking

### 4.2 Tab Design

**Visual:**
- Horizontal tabs
- Underline active
- Cyan for active tab
- Gray for inactive

**Animation:**
- Underline slides
- Content fades
- 200ms transition

---

## 5. RANKING INDICATORS

### 5.1 Position Change

**Improved position:**
- Green arrow up (▲)
- "+X" positions
- Celebratory micro-animation

**Dropped position:**
- Red arrow down (▼)
- "-X" positions
- Subtle indication

**Unchanged:**
- Dash (—)
- No color change

### 5.2 Position Proximity

**Near top:**
- "3 positions from top 10"
- Motivation message

**Near tier:**
- "12 points to Elite"
- Progress indicator

---

## 6. ACHIEVEMENT SYSTEM UI

### 6.1 Achievement Card

```
┌─────────────────────────────────────────────────┐
│  [Badge Icon]                                    │
│                                                  │
│  FIRST BLOOD                                     │
│  Find your first clue                           │
│                                                  │
│  ████████████░░░░░░░░  1/1  ✓ COMPLETE          │
│                                                  │
│  +50 M1U  •  Earned 2 days ago                  │
└─────────────────────────────────────────────────┘
```

**Components:**
- Badge icon (64px)
- Achievement name
- Description
- Progress bar
- Reward info
- Completion date

### 6.2 Badge Design

**Locked Badge:**
- Grayscale
- Question mark or silhouette
- "???" for secret achievements

**In-Progress Badge:**
- Partial color
- Progress overlay
- Current/Target display

**Earned Badge:**
- Full color
- Glow effect
- Animated shine

### 6.3 Achievement Categories

**Discovery:**
- Clue-related
- Exploration-based
- Signal icons

**Progress:**
- Milestone achievements
- Level-ups
- Completion badges

**Competition:**
- Ranking achievements
- Leaderboard positions
- Win streaks

**Special:**
- Time-limited
- Event-based
- Rare accomplishments

---

## 7. REWARD TIER VISUALIZATION

### 7.1 Tier Progress

```
┌─────────────────────────────────────────────────┐
│         YOUR MISSION TIER: HUNTER               │
│                                                  │
│  TRACKER → HUNTER → ELITE → LEGEND              │
│     ✓        ⬤        ○        ○               │
│                                                  │
│  Progress to ELITE: 67%                         │
│  ████████████████████░░░░░░░░░░                │
│                                                  │
│  2,340 / 3,500 points                           │
└─────────────────────────────────────────────────┘
```

### 7.2 Tier Visual Treatment

**Tracker (Entry):**
- Gray icon
- Basic styling
- Foundation tier

**Hunter:**
- Cyan icon
- Standard glow
- Active player tier

**Elite:**
- Gold icon
- Premium glow
- Elevated status

**Legend:**
- Multi-color icon
- Animated effects
- Top tier recognition

### 7.3 Tier Rewards Display

**Per tier:**
- List of rewards
- Check marks for unlocked
- Lock icons for locked
- M1U/item values

---

## 8. REAL-TIME UPDATES

### 8.1 Live Rankings

**Visual indicators:**
- "LIVE" badge
- Position changes animate
- New entries slide in

**Update frequency:**
- Every 30-60 seconds
- On significant events
- Manual refresh option

### 8.2 Position Change Animation

**Moving up:**
- Row slides from below
- Flash of green
- Settle in new position

**Moving down:**
- Row shifts down
- Brief red indicator
- Smooth transition

---

## 9. COMPETITION END STATES

### 9.1 Mission Complete Rankings

**Final leaderboard:**
- "FINAL RESULTS" header
- Positions locked
- Rewards distribution shown

**Winner highlight:**
- Special animation
- Confetti effect
- Trophy icon

### 9.2 Reward Distribution

**Winner UI:**
- Prize reveal
- Celebration effects
- Share option

**Participant UI:**
- Position shown
- Rewards earned
- Next mission teaser

---

## 10. SOCIAL FEATURES

### 10.1 Player Profiles (Limited)

**Visible info:**
- Username
- Avatar
- Current rank
- Achievement showcase

**Privacy preserved:**
- No personal data
- Optional visibility
- Block option

### 10.2 Competition Invites

**Challenge friends:**
- Share link
- Invite notification
- Acceptance flow

### 10.3 Social Sharing

**Share achievements:**
- Formatted image
- Platform sharing
- M1SSION branding

---

## 11. ANIMATIONS

### 11.1 Rank Reveal

**Initial load:**
- Numbers count up
- Staggered entry
- Top 3 special entrance

### 11.2 Position Update

**Real-time change:**
- Smooth transition
- 300ms duration
- Easing: ease-out

### 11.3 Achievement Unlock

**Celebration:**
- Badge appears center
- Scale animation
- Glow intensifies
- Particle burst
- Auto-dismiss or tap

---

## 12. ACCESSIBILITY

### 12.1 Screen Reader

**Announcements:**
- "Ranked 47th with 1,456 points"
- "Achievement unlocked: First Blood"
- "You moved up 3 positions"

### 12.2 Color Independence

- Rank numbers always present
- Position arrows have text
- Badges have labels

### 12.3 Focus Management

- Keyboard navigable
- Clear focus indicators
- Skip to your position

---

## 13. RESPONSIVE DESIGN

### 13.1 Mobile

**Compact view:**
- Abbreviated scores
- Smaller avatars
- Swipe for tabs
- Pull to refresh

### 13.2 Tablet/Desktop

**Expanded view:**
- Full information
- Multiple columns possible
- Hover states
- Keyboard shortcuts

---

## 14. LOADING STATES

### 14.1 Initial Load

**Skeleton:**
- Gray placeholder rows
- Shimmer animation
- Maintains layout

### 14.2 Updating

**Partial load:**
- Spinner in header
- Existing data visible
- New data replaces

---

**Document End**

*This document is part of the M1SSION™ Brand & Design Protection Pack.*
*For overlay and modal design, refer to Volume 15.*

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved




