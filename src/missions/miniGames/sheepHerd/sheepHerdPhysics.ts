/**
 * Sheep Herd — lightweight 2D step (normalized 0–1 space). WKWebView-friendly.
 * © 2025 Joseph MULÉ – M1SSION™
 */

import type { SheepAgent, SheepHerdGameParams } from './sheepHerdTypes';
import { clamp, len } from './sheepHerdUtils';

export function sham(s: SheepAgent, salt: number): number {
  const t = Math.sin(s.wanderPhase * 12.9898 + s.x * 78.233 + s.y * 37.719 + salt * 19.13) * 43758.5453;
  return t - Math.floor(t);
}

const PEN_CX = 0.5;
const PEN_CY = 0.44;
const BASE_PEN_R = 0.1;
/** Influence radius (normalized); larger = readable “pressure” from driver on flock. */
const BASE_SCARE_R = 0.118;
const FLEE_STRENGTH = 6.55;
const FRICTION = 0.922;
/** Client-side motion scale only (server tiers unchanged). */
const CLIENT_MOTION_MUL = 1.18;
const BOUNDS = { minX: 0.06, maxX: 0.94, minY: 0.1, maxY: 0.9 };
const OUT_LOST = { minX: 0.02, maxX: 0.98, minY: 0.04, maxY: 0.96 };
/** After idle hop, allow this many frames of motion then snap toward rest (no smooth glide = no “float”). */
const IDLE_COAST_FRAMES = 6;
/** When dog is outside scare, kill residual idle glide between hops. */
const IDLE_PLANT_FEET_MUL = 0.48;

export function getPenCenter(): { cx: number; cy: number } {
  return { cx: PEN_CX, cy: PEN_CY };
}

export function getPenRadius(params: SheepHerdGameParams): number {
  return BASE_PEN_R * params.pen_radius_mul;
}

export function getScareRadius(params: SheepHerdGameParams): number {
  return BASE_SCARE_R * params.scare_radius_mul;
}

export function spawnSheepOutsidePen(
  count: number,
  rng: () => number,
  penR: number
): SheepAgent[] {
  const out: SheepAgent[] = [];
  const cx = PEN_CX;
  const cy = PEN_CY;
  for (let i = 0; i < count; i++) {
    let x = 0.5;
    let y = 0.5;
    for (let attempt = 0; attempt < 40; attempt++) {
      x = BOUNDS.minX + rng() * (BOUNDS.maxX - BOUNDS.minX);
      y = BOUNDS.minY + rng() * (BOUNDS.maxY - BOUNDS.minY);
      if (len(x - cx, y - cy) > penR + 0.045) break;
    }
    out.push({
      x,
      y,
      vx: 0,
      vy: 0,
      trapped: false,
      lost: false,
      wanderPhase: rng() * 2000 + rng(),
      idleHeading: rng() * Math.PI * 2,
      idleTimer: 0.08 + rng() * 0.35,
      idleCoastFrames: 0,
      hopAccent: 0,
      idleMicroTimer: rng() * 0.12,
      baaDisplayFrames: 0,
      baaCooldownFrames: Math.floor(rng() * 100),
    });
  }
  return out;
}

export function stepFlock(
  sheep: SheepAgent[],
  dogX: number,
  dogY: number,
  dt: number,
  params: SheepHerdGameParams
): void {
  const penR = getPenRadius(params);
  const scareR = getScareRadius(params);
  const cx = PEN_CX;
  const cy = PEN_CY;
  const speed = 0.62 * params.sheep_speed_mul * CLIENT_MOTION_MUL;

  for (const s of sheep) {
    if (s.trapped || s.lost) continue;

    let ax = 0;
    let ay = 0;
    const ddx = s.x - dogX;
    const ddy = s.y - dogY;
    const d = len(ddx, ddy);
    const toPenX = cx - s.x;
    const toPenY = cy - s.y;
    const tp = len(toPenX, toPenY);
    const upx = tp > 1e-4 ? toPenX / tp : 0;
    const upy = tp > 1e-4 ? toPenY / tp : 0;

    if (d > 1e-4 && d < scareR) {
      const falloff = 1 - d / scareR;
      const falloffN = falloff ** 1.28;
      const inner = Math.min(1, (scareR - d) / (scareR * 0.42));
      const proximityBoost = 1 + inner * 0.38;
      let push = FLEE_STRENGTH * falloffN * proximityBoost;
      const fx = ddx / d;
      const fy = ddy / d;
      ax += fx * push;
      ay += fy * push;

      // Stronger “drive toward pen” when flee already helps — reads as pastore che spinge avanti.
      if (tp > 1e-4) {
        const align = Math.max(0, fx * upx + fy * upy);
        const herd = (0.34 + align * 0.62) * falloffN * FLEE_STRENGTH * 0.38 * proximityBoost;
        ax += upx * herd;
        ay += upy * herd;
      }

      // Tangential steering: curl around the dog toward the pen (not pure radial = più intuitivo).
      const perpX = -ddy / d;
      const perpY = ddx / d;
      const side = Math.sign(perpX * upx + perpY * upy) || 1;
      const curl = falloffN * FLEE_STRENGTH * 0.36 * side * proximityBoost;
      ax += perpX * curl;
      ay += perpY * curl;
    }

    // Idle: short hops + pauses (no smooth sinusoid = no “floating”).
    let idleWeight = 1;
    if (d < scareR) {
      idleWeight = d > 1e-4 ? Math.max(0, Math.min(1, (d / scareR) ** 1.35)) : 0;
    }
    s.wanderPhase += dt * 2.4 + Math.abs(s.vx) + Math.abs(s.vy);
    if (idleWeight > 0.02) {
      s.idleTimer -= dt;
      if (s.idleTimer <= 0) {
        const r1 = sham(s, 1);
        const r2 = sham(s, 2);
        const r3 = sham(s, 3);
        s.wanderPhase += 3.7 + r1 * 4;
        if (r2 > 0.68) {
          s.idleHeading = r3 * Math.PI * 2;
        } else {
          s.idleHeading += (r1 - 0.5) * 2.4;
        }
        const hopMag = (0.12 + r2 * 0.26) * idleWeight;
        s.vx += Math.cos(s.idleHeading) * hopMag;
        s.vy += Math.sin(s.idleHeading) * hopMag;
        s.idleCoastFrames = IDLE_COAST_FRAMES;
        s.hopAccent = 1;
        const nervous = r3 > 0.78;
        s.idleTimer = (nervous ? 0.08 : 0.18) + r1 * (nervous ? 0.38 : 0.55);
      }
    }

    // Micro-shuffles: extra small hops while grazing (reference-style “always alive”).
    if (idleWeight > 0.22) {
      s.idleMicroTimer -= dt;
      if (s.idleMicroTimer <= 0) {
        const r4 = sham(s, 7);
        const r5 = sham(s, 8);
        const microMag = (0.038 + r4 * 0.072) * Math.min(1, idleWeight);
        const ang = s.idleHeading + (r5 - 0.5) * 1.1;
        s.vx += Math.cos(ang) * microMag;
        s.vy += Math.sin(ang) * microMag;
        s.idleMicroTimer = 0.04 + r5 * 0.11;
        if (r4 > 0.86) {
          s.hopAccent = Math.max(s.hopAccent, 0.55);
        }
      }
    }

    s.idleHeading += (sham(s, 9) - 0.5) * dt * 1.65 * idleWeight;

    s.vx += ax * dt * speed;
    s.vy += ay * dt * speed;
    s.vx *= FRICTION;
    s.vy *= FRICTION;

    if (s.idleCoastFrames > 0) {
      s.idleCoastFrames -= 1;
    } else if (d >= scareR) {
      s.vx *= IDLE_PLANT_FEET_MUL;
      s.vy *= IDLE_PLANT_FEET_MUL;
    }

    s.x += s.vx * dt * speed * 1.2;
    s.y += s.vy * dt * speed * 1.2;

    if (s.hopAccent > 0.001) {
      s.hopAccent *= 0.82;
    } else {
      s.hopAccent = 0;
    }

    if (s.x < BOUNDS.minX) {
      s.x = BOUNDS.minX;
      s.vx *= -0.48;
    }
    if (s.x > BOUNDS.maxX) {
      s.x = BOUNDS.maxX;
      s.vx *= -0.48;
    }
    if (s.y < BOUNDS.minY) {
      s.y = BOUNDS.minY;
      s.vy *= -0.48;
    }
    if (s.y > BOUNDS.maxY) {
      s.y = BOUNDS.maxY;
      s.vy *= -0.48;
    }

    if (len(s.x - cx, s.y - cy) < penR - 0.012) {
      s.trapped = true;
      s.vx = 0;
      s.vy = 0;
      s.hopAccent = 0;
      s.idleCoastFrames = 0;
      s.baaDisplayFrames = 0;
      const ang = Math.atan2(s.y - cy, s.x - cx);
      const rr = penR * 0.42;
      s.x = cx + Math.cos(ang) * rr;
      s.y = cy + Math.sin(ang) * rr;
    }

    if (
      s.x < OUT_LOST.minX ||
      s.x > OUT_LOST.maxX ||
      s.y < OUT_LOST.minY ||
      s.y > OUT_LOST.maxY
    ) {
      s.lost = true;
      s.vx = 0;
      s.vy = 0;
      s.hopAccent = 0;
      s.idleCoastFrames = 0;
      s.baaDisplayFrames = 0;
    }
  }
}

export function clampDog(x: number, y: number): { x: number; y: number } {
  return {
    x: clamp(x, BOUNDS.minX + 0.02, BOUNDS.maxX - 0.02),
    y: clamp(y, BOUNDS.minY + 0.02, BOUNDS.maxY - 0.02),
  };
}
