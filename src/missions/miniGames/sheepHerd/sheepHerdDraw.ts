/**
 * Sheep Herd — vector silhouettes (canvas). Readable sheep + driver, M1SSION minimal premium.
 * © 2025 Joseph MULÉ – M1SSION™
 */

export type SheepDrawMode = 'free' | 'trapped' | 'lost';

const PI2 = Math.PI * 2;

/**
 * Simple sheep: woolly body (ellipse) + dark head + two ear nubs — not generic white dot.
 */
export function drawSheep(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  r: number,
  mode: SheepDrawMode,
  hopAccent01 = 0
): void {
  ctx.save();
  ctx.translate(sx, sy);

  if (mode === 'free' && hopAccent01 > 0.03) {
    const e = hopAccent01 * hopAccent01;
    ctx.translate(0, -r * 0.26 * e);
    ctx.scale(1, 1 + e * 0.055);
  }

  const bodyRx = r * 1.45;
  const bodyRy = r * 0.95;
  const fluff = mode === 'lost' ? 'rgba(140, 90, 98, 0.55)' : mode === 'trapped' ? '#e8f4ff' : '#f4f7fc';
  const headFill = mode === 'lost' ? 'rgba(60, 40, 45, 0.75)' : '#2a3244';
  const stroke = mode === 'trapped' ? 'rgba(0, 255, 200, 0.65)' : mode === 'lost' ? 'rgba(255, 120, 130, 0.5)' : 'rgba(255,255,255,0.22)';

  // Wool body
  ctx.beginPath();
  ctx.ellipse(0, r * 0.08, bodyRx, bodyRy, 0, 0, PI2);
  ctx.fillStyle = fluff;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = Math.max(1, r * 0.12);
  ctx.stroke();

  // Head (slightly forward)
  ctx.beginPath();
  ctx.arc(-bodyRx * 0.72, -r * 0.12, r * 0.52, 0, PI2);
  ctx.fillStyle = headFill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = Math.max(1, r * 0.1);
  ctx.stroke();

  // Ears (two small triangles)
  ctx.fillStyle = headFill;
  ctx.beginPath();
  ctx.moveTo(-bodyRx * 0.95, -r * 0.35);
  ctx.lineTo(-bodyRx * 0.75, -r * 0.55);
  ctx.lineTo(-bodyRx * 0.62, -r * 0.28);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-bodyRx * 0.55, -r * 0.42);
  ctx.lineTo(-bodyRx * 0.38, -r * 0.58);
  ctx.lineTo(-bodyRx * 0.32, -r * 0.32);
  ctx.closePath();
  ctx.fill();

  // Tiny eye glint (readability)
  if (mode !== 'lost') {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(-bodyRx * 0.82, -r * 0.18, r * 0.1, 0, PI2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Occasional “baa” balloon above a sheep — light, readable, not toy-like.
 * @param framesLeft countdown; @param framesMax total shown duration
 */
export function drawSheepSpeechBubble(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  r: number,
  text: string,
  framesLeft: number,
  framesMax: number
): void {
  const rem = Math.max(0, framesLeft / Math.max(1, framesMax));
  const elapsed = 1 - rem;
  const fadeIn = Math.min(1, 0.5 + elapsed * 4);
  const fadeOut = Math.min(1, rem / 0.22);
  const a = Math.min(fadeIn, fadeOut) * 0.88;
  if (a < 0.05) return;

  const padX = r * 0.55;
  const padY = r * 0.32;
  ctx.save();
  ctx.font = `600 ${Math.max(11, Math.round(r * 0.52))}px system-ui, -apple-system, sans-serif`;
  const metrics = ctx.measureText(text);
  const tw = metrics.width;
  const th = Math.max(14, r * 0.62);
  const bw = tw + padX * 2;
  const bh = th + padY * 2;
  const bx = sx - bw * 0.5;
  const by = sy - r * 2.35 - bh;
  const rr = Math.min(12, r * 0.45);

  ctx.fillStyle = `rgba(18, 24, 36, ${0.88 * a})`;
  ctx.strokeStyle = `rgba(0, 209, 255, ${0.35 * a})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bx + rr, by);
  ctx.arcTo(bx + bw, by, bx + bw, by + bh, rr);
  ctx.arcTo(bx + bw, by + bh, bx, by + bh, rr);
  ctx.arcTo(bx, by + bh, bx, by, rr);
  ctx.arcTo(bx, by, bx + bw, by, rr);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tiny tail
  ctx.fillStyle = `rgba(18, 24, 36, ${0.88 * a})`;
  ctx.beginPath();
  ctx.moveTo(sx - r * 0.22, by + bh);
  ctx.lineTo(sx, by + bh + r * 0.36);
  ctx.lineTo(sx + r * 0.22, by + bh);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = `rgba(240, 248, 255, ${a})`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + bw * 0.5, by + bh * 0.5);

  ctx.restore();
}

/**
 * Driver unit: outer “control” ring + directional wedge + core — reads as what you steer.
 */
export function drawDog(
  ctx: CanvasRenderingContext2D,
  dx: number,
  dy: number,
  r: number,
  aimRad: number
): void {
  ctx.save();
  ctx.translate(dx, dy);
  ctx.rotate(aimRad);

  // Outer pulse ring
  ctx.strokeStyle = 'rgba(0, 209, 255, 0.55)';
  ctx.lineWidth = Math.max(2, r * 0.2);
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.55, 0, PI2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0, 209, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.78, 0, PI2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Body (rounded capsule toward +X)
  ctx.fillStyle = 'rgba(0, 180, 220, 0.95)';
  ctx.shadowColor = 'rgba(0, 209, 255, 0.85)';
  ctx.shadowBlur = r * 0.8;
  ctx.beginPath();
  ctx.moveTo(-r * 0.35, -r * 0.55);
  ctx.quadraticCurveTo(r * 1.1, -r * 0.5, r * 1.15, 0);
  ctx.quadraticCurveTo(r * 1.1, r * 0.5, -r * 0.35, r * 0.55);
  ctx.quadraticCurveTo(-r * 0.85, r * 0.35, -r * 0.85, 0);
  ctx.quadraticCurveTo(-r * 0.85, -r * 0.35, -r * 0.35, -r * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Snout
  ctx.fillStyle = 'rgba(0, 140, 175, 0.95)';
  ctx.beginPath();
  ctx.ellipse(r * 1.25, 0, r * 0.38, r * 0.32, 0, 0, PI2);
  ctx.fill();

  // Nose dot
  ctx.fillStyle = 'rgba(0, 40, 55, 0.9)';
  ctx.beginPath();
  ctx.arc(r * 1.42, 0, r * 0.12, 0, PI2);
  ctx.fill();

  ctx.restore();
}

export function drawPenTarget(
  ctx: CanvasRenderingContext2D,
  pcx: number,
  pcy: number,
  penRpx: number,
  pulse01: number,
  safeGreen01 = 0
): void {
  const g = Math.max(0, Math.min(1, safeGreen01));
  const pulse = 1 + pulse01 * 0.08;
  const R = penRpx * pulse;

  // Soft inner fill when sheep just entered — premium “secured” read, not traffic-light flat.
  if (g > 0.02) {
    const innerG = ctx.createRadialGradient(pcx, pcy, R * 0.15, pcx, pcy, R * 0.92);
    innerG.addColorStop(0, `rgba(0, 255, 175, ${0.07 * g})`);
    innerG.addColorStop(0.55, `rgba(0, 220, 140, ${0.04 * g})`);
    innerG.addColorStop(1, 'rgba(0, 255, 160, 0)');
    ctx.fillStyle = innerG;
    ctx.beginPath();
    ctx.arc(pcx, pcy, R - 2, 0, PI2);
    ctx.fill();
  }

  const strokeR = Math.round(48 * g);
  const strokeG = Math.round(209 + 46 * g);
  const strokeB = Math.round(255 - 55 * g);
  const strokeA = 0.5 * (1 - g * 0.45) + g * 0.28;
  ctx.strokeStyle = `rgba(${strokeR},${strokeG},${strokeB},${strokeA})`;
  ctx.lineWidth = 3 + pulse01 * 2 + g * 2.5;
  ctx.shadowColor =
    g > 0.08
      ? `rgba(0, 255, 190, ${0.35 + g * 0.45})`
      : 'rgba(0, 209, 255, 0.65)';
  ctx.shadowBlur = 16 + pulse01 * 24 + g * 28;
  ctx.beginPath();
  ctx.arc(pcx, pcy, R, 0, PI2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = `rgba(0, 209, 255, ${0.18 * (1 - g * 0.7)})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(pcx, pcy, R - 5, 0, PI2);
  ctx.stroke();

  // Inner “gate” tick marks — shift toward mint when safe pulse active
  const tickMint = 0.25 + g * 0.45;
  ctx.strokeStyle = `rgba(0, 255, 200, ${tickMint})`;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * PI2;
    ctx.beginPath();
    ctx.moveTo(pcx + Math.cos(a) * (R - 12), pcy + Math.sin(a) * (R - 12));
    ctx.lineTo(pcx + Math.cos(a) * (R - 4), pcy + Math.sin(a) * (R - 4));
    ctx.stroke();
  }
}
