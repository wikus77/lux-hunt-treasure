// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
declare global {
  function preserveFunctionName(fn: Function, name?: string): Function;
  function vibrate(pattern?: number | number[]): void;
  function isMobile(): boolean;
  function isMobileDevice(): boolean;
  function getDeviceOrientation(): string;
  function isProductionReady(): boolean;
  function safeLog(message: string, ...args: any[]): void;
  function playSound(soundName: string): void;
}

import { 
  preserveFunctionName as _preserveFunctionName,
  vibrate as _vibrate,
  isMobile as _isMobile,
  isMobileDevice as _isMobileDevice,
  getDeviceOrientation as _getDeviceOrientation,
  isProductionReady as _isProductionReady,
  safeLog as _safeLog,
  playSound as _playSound
} from './globals';

// Assign to global scope
(globalThis as any).preserveFunctionName = _preserveFunctionName;
(globalThis as any).vibrate = _vibrate;
(globalThis as any).isMobile = _isMobile;
(globalThis as any).isMobileDevice = _isMobileDevice;
(globalThis as any).getDeviceOrientation = _getDeviceOrientation;
(globalThis as any).isProductionReady = _isProductionReady;
(globalThis as any).safeLog = _safeLog;
(globalThis as any).playSound = _playSound;

export {};