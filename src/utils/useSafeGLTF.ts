// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * useSafeGLTF - GLB/GLTF loader that doesn't throw
 * 
 * Features:
 * - Returns null scene instead of throwing
 * - Optional fallback URL
 * - Loading and error states
 * - Timeout handling
 */

import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

interface SafeGLTFResult {
  scene: THREE.Group | null;
  isLoading: boolean;
  error: Error | null;
  progress: number;
}

interface UseSafeGLTFOptions {
  /** Timeout in milliseconds (default: 15000) */
  timeout?: number;
  /** Fallback URL if primary fails */
  fallbackUrl?: string;
  /** Enable DRACO compression */
  useDraco?: boolean;
}

// Shared loader instance
let gltfLoader: GLTFLoader | null = null;

function getLoader(useDraco: boolean): GLTFLoader {
  if (!gltfLoader) {
    gltfLoader = new GLTFLoader();
    
    if (useDraco) {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/');
      gltfLoader.setDRACOLoader(dracoLoader);
    }
  }
  return gltfLoader;
}

/**
 * Safe GLTF/GLB loader hook that never throws
 * Returns null scene on error instead of crashing
 */
export function useSafeGLTF(
  url: string | null | undefined,
  options: UseSafeGLTFOptions = {}
): SafeGLTFResult {
  const { timeout = 15000, fallbackUrl, useDraco = false } = options;
  
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  
  const abortRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      setScene(null);
      return;
    }

    abortRef.current = false;
    setIsLoading(true);
    setError(null);
    setProgress(0);

    const loader = getLoader(useDraco);

    // Set timeout
    timeoutRef.current = setTimeout(() => {
      if (!abortRef.current) {
        console.warn(`[useSafeGLTF] Timeout loading: ${url}`);
        abortRef.current = true;
        setError(new Error('Load timeout'));
        setIsLoading(false);
        
        // Try fallback if available
        if (fallbackUrl) {
          loadUrl(fallbackUrl);
        }
      }
    }, timeout);

    const loadUrl = (targetUrl: string) => {
      loader.load(
        targetUrl,
        // onLoad
        (gltf: GLTF) => {
          if (abortRef.current) return;
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          setScene(gltf.scene);
          setIsLoading(false);
          setProgress(100);
        },
        // onProgress
        (progressEvent) => {
          if (abortRef.current) return;
          
          if (progressEvent.lengthComputable) {
            const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setProgress(pct);
          }
        },
        // onError
        (err) => {
          if (abortRef.current) return;
          
          console.warn(`[useSafeGLTF] Failed to load: ${targetUrl}`, err);
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Try fallback if this was the primary URL and fallback exists
          if (targetUrl === url && fallbackUrl) {
            console.log(`[useSafeGLTF] Trying fallback: ${fallbackUrl}`);
            loadUrl(fallbackUrl);
          } else {
            // Final failure
            setError(err instanceof Error ? err : new Error(String(err)));
            setIsLoading(false);
            setScene(null);
          }
        }
      );
    };

    // Start loading
    loadUrl(url);

    // Cleanup
    return () => {
      abortRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [url, fallbackUrl, timeout, useDraco]);

  return { scene, isLoading, error, progress };
}

/**
 * Pre-check if a URL is accessible (HEAD request)
 * Returns true if accessible, false otherwise
 */
export async function checkAssetAvailable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

export default useSafeGLTF;
