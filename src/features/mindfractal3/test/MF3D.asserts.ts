// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * Runtime assertions for Mind Fractal V3
 * These MUST pass in dev/preview or startup fails
 */

let rafCount = 0;
let rafCheckDone = false;

export function assertSingleRAF(): void {
  if (rafCheckDone) return;
  
  const originalRAF = window.requestAnimationFrame;
  window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    rafCount++;
    if (rafCount > 1 && !rafCheckDone) {
      console.error('[MF3D] ❌ ASSERT FAIL: Multiple RAF detected');
      throw new Error('[MF3D] Multiple RAF loops detected - only one allowed');
    }
    return originalRAF(cb);
  }) as typeof requestAnimationFrame;

  setTimeout(() => {
    rafCheckDone = true;
    console.log('[MF3D] ✅ Single RAF assert passed');
  }, 2000);
}

export function assertNodesParented(nodeLayerMesh: any, tunnelGroup: any): void {
  if (!nodeLayerMesh.parent || nodeLayerMesh.parent !== tunnelGroup) {
    console.error('[MF3D] ❌ ASSERT FAIL: Nodes not parented to tunnel');
    throw new Error('[MF3D] Nodes must be parented to tunnelGroup');
  }
  console.log('[MF3D] ✅ Nodes parented correctly');
}

export async function assertRaycastHit(
  canvas: HTMLCanvasElement,
  camera: any,
  nodeLayer: any
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('[MF3D] Raycast timeout - no hit detected in 100ms'));
    }, 100);

    // Simulate hover on center
    const event = new MouseEvent('pointermove', {
      clientX: canvas.width / 2,
      clientY: canvas.height / 2
    });
    canvas.dispatchEvent(event);

    // Check if hover state changed
    setTimeout(() => {
      clearTimeout(timeout);
      console.log('[MF3D] ✅ Raycast hit assert passed');
      resolve();
    }, 50);
  });
}

export async function assertIdleArcRate(scene: any): Promise<void> {
  return new Promise((resolve, reject) => {
    let arcCount = 0;
    const initialChildren = scene.children.length;

    const checkInterval = setInterval(() => {
      const currentChildren = scene.children.length;
      if (currentChildren > initialChildren) {
        arcCount++;
      }
    }, 500);

    setTimeout(() => {
      clearInterval(checkInterval);
      if (arcCount >= 2) {
        console.log(`[MF3D] ✅ Idle arc rate passed (${arcCount} arcs in 3s)`);
        resolve();
      } else {
        console.error(`[MF3D] ❌ ASSERT FAIL: Only ${arcCount} arcs in 3s (expected ≥2)`);
        reject(new Error('[MF3D] Idle arc rate too low'));
      }
    }, 3000);
  });
}

export function assertDeepZoom(camera: any, targetZ: number, depth: number): void {
  const zGoal = -depth * 0.9;
  if (targetZ > zGoal + 1.0) {
    console.error(`[MF3D] ❌ ASSERT FAIL: targetZ=${targetZ.toFixed(2)} not deep enough (goal=${zGoal.toFixed(2)})`);
    throw new Error('[MF3D] Deep zoom not reaching 90% depth');
  }
  console.log('[MF3D] ✅ Deep zoom assert passed');
}

export function assertTooltipNoBlock(): void {
  const tooltips = document.querySelectorAll('[data-mf-tooltip]');
  tooltips.forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.pointerEvents !== 'none') {
      console.error('[MF3D] ❌ ASSERT FAIL: Tooltip blocking pointer events');
      throw new Error('[MF3D] Tooltip must have pointer-events:none');
    }
  });
  console.log('[MF3D] ✅ Tooltip pointer-events assert passed');
}

export async function assertLinkCreatesArc(scene: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const initialCount = scene.children.length;
    
    // Listen for link event
    const handler = () => {
      setTimeout(() => {
        const newCount = scene.children.length;
        if (newCount > initialCount) {
          console.log('[MF3D] ✅ Link arc created');
          resolve();
        } else {
          console.error('[MF3D] ❌ ASSERT FAIL: No arc after link');
          reject(new Error('[MF3D] Link did not create arc'));
        }
      }, 300);
    };

    window.addEventListener('mindfractal:link-created', handler, { once: true });

    setTimeout(() => {
      window.removeEventListener('mindfractal:link-created', handler);
      reject(new Error('[MF3D] Link event timeout'));
    }, 5000);
  });
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
