/**
 * AppHome-only visual toggles (Capacitor iOS scroll + floating agent).
 * - Scroll sections: children stay mounted (`hidden` = display:none) so hooks / DCL / CommitNodeTrigger / launchers stay active.
 * - Floating Agent: omitted from mount when true (no Agent pill UI; openAgent() still works if wired elsewhere).
 * Rollback: set both to `false`.
 */
export const APP_HOME_HIDE_SCROLL_SECTIONS_UI = true;

export const APP_HOME_HIDE_FLOATING_AGENT_PILL = true;

/**
 * With V3 floating pills: hide Prossima azione / Tempo / Battle / Commit (float + scroll anchors) until user taps GIOCA.
 * Rollback: set `false`.
 */
export const APP_HOME_GIOCA_PLAY_GATE_ENABLED = true;

/**
 * GIOCA play surface: premium full-screen modal shell over the cross pill grid (pills stay mounted, visually hidden).
 * Rollback: set `false` to restore visible pills-only layout without reverting `FloatingPillLayerV3` wiring.
 */
export const APP_HOME_PLAY_MODAL_SHELL_ENABLED = true;

/**
 * CommandCenter scroll: hide in-page “M1SSION AGENT” glass card (`AgentDiary` only).
 * Floating M1SSION Agent pill on the GIOCA play surface is unchanged (`FloatingAgentPillV3`).
 * Rollback: set `false`.
 */
export const APP_HOME_HIDE_SCROLL_AGENT_CONTAINER = true;

/**
 * Hide transient green “+N PE” / ⚡ gain chips (AgentEnergyPill + PulseBarPersonal). PE logic unchanged.
 * AppHome-only via prop wiring from `AppHome.tsx`. Rollback: `false`.
 */
export const APP_HOME_HIDE_PE_GAIN_BADGE_UI = true;
