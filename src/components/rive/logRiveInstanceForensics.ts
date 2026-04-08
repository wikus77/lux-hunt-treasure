import type { Rive } from '@rive-app/canvas';

/**
 * Dopo load riuscito: artboard/SM/anim/input da `rive.contents` + istanza attiva.
 */
export function logRiveInstanceForensics(rive: Rive): void {
  try {
    const artboards = rive.contents?.artboards ?? [];
    console.warn('[RIVE][forensic][artboards]', artboards.map((a) => a.name));
    console.warn(
      '[RIVE][forensic][state-machines]',
      artboards.map((a) => ({
        artboard: a.name,
        machines: a.stateMachines.map((s) => ({
          name: s.name,
          inputs: s.inputs.map((i) => ({ name: i.name, type: i.type, initialValue: i.initialValue })),
        })),
      }))
    );
    console.warn(
      '[RIVE][forensic][animations]',
      artboards.map((a) => ({ artboard: a.name, animations: a.animations }))
    );

    const active = rive.activeArtboard;
    const sms = [...rive.stateMachineNames];
    const anims = [...rive.animationNames];
    const perSmInputs = sms.map((name) => {
      try {
        return {
          name,
          inputs: rive.stateMachineInputs(name).map((i) => ({ name: i.name, type: i.type })),
        };
      } catch {
        return { name, inputs: [] as { name: string; type: string }[], error: true };
      }
    });
    console.warn('[RIVE][forensic][inputs]', {
      activeArtboard: active,
      runtimeStateMachines: sms,
      runtimeAnimations: anims,
      perSmInputs,
    });
  } catch (e) {
    console.warn('[RIVE][forensic][parse-error]', { phase: 'contents_introspection', e });
  }
}
