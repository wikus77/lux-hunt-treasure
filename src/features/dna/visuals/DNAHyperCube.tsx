// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useDNATargets } from '@/hooks/useDNATargets';
import { isMobile } from '@/lib/utils/device';
import { TesseractGrid } from './geometry/TesseractGrid';
import { DNAPanels } from './panels/DNAPanels';
import { StarfieldBackground } from './background/StarfieldBackground';
import { FloatingAnimation } from './effects/FloatingAnimation';
import { useStableComposer } from './components/useStableComposer';

// Lazy load vanilla postprocessing
let EffectComposer: any;
let RenderPass: any;
let BloomEffect: any;
let ChromaticAberrationEffect: any;
let EffectPass: any;
let SMAAEffect: any;

const loadPostProcessing = async () => {
  if (EffectComposer) return { EffectComposer, RenderPass, BloomEffect, ChromaticAberrationEffect, EffectPass, SMAAEffect };
  
  const pp = await import('postprocessing');
  EffectComposer = pp.EffectComposer;
  RenderPass = pp.RenderPass;
  BloomEffect = pp.BloomEffect;
  ChromaticAberrationEffect = pp.ChromaticAberrationEffect;
  EffectPass = pp.EffectPass;
  SMAAEffect = pp.SMAAEffect;
  
  return { EffectComposer, RenderPass, BloomEffect, ChromaticAberrationEffect, EffectPass, SMAAEffect };
};

// Fresnel shader for glass iridescence
const fresnelShader = {
  uniforms: {
    fresnelBias: { value: 0.1 },
    fresnelScale: { value: 1.0 },
    fresnelPower: { value: 2.0 },
    time: { value: 0 }
  },
  vertexShader: `
    varying vec3 vReflect;
    varying vec3 vRefract[3];
    varying float vReflectionFactor;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    uniform float fresnelBias;
    uniform float fresnelScale;
    uniform float fresnelPower;
    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      
      vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
      vec3 I = worldPosition.xyz - cameraPosition;
      
      vReflect = reflect(I, worldNormal);
      vRefract[0] = refract(normalize(I), worldNormal, 1.0 / 1.3);
      vRefract[1] = refract(normalize(I), worldNormal, 1.0 / 1.4);
      vRefract[2] = refract(normalize(I), worldNormal, 1.0 / 1.5);
      
      vReflectionFactor = fresnelBias + fresnelScale * pow(1.0 + dot(normalize(I), worldNormal), fresnelPower);
      vNormal = worldNormal;
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform samplerCube envMap;
    uniform float time;
    varying vec3 vReflect;
    varying vec3 vRefract[3];
    varying float vReflectionFactor;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vec4 reflectedColor = textureCube(envMap, vec3(-vReflect.x, vReflect.yz));
      vec4 refractedColor;
      refractedColor.r = textureCube(envMap, vec3(-vRefract[0].x, vRefract[0].yz)).r;
      refractedColor.g = textureCube(envMap, vec3(-vRefract[1].x, vRefract[1].yz)).g;
      refractedColor.b = textureCube(envMap, vec3(-vRefract[2].x, vRefract[2].yz)).b;
      refractedColor.a = 1.0;
      
      // Iridescent rim
      float fresnel = vReflectionFactor;
      vec3 rimColor = vec3(
        sin(fresnel * 3.14159 + time * 0.5) * 0.5 + 0.5,
        sin(fresnel * 3.14159 + time * 0.5 + 2.094) * 0.5 + 0.5,
        sin(fresnel * 3.14159 + time * 0.5 + 4.189) * 0.5 + 0.5
      );
      
      vec3 finalColor = mix(refractedColor.rgb, reflectedColor.rgb, clamp(vReflectionFactor, 0.0, 1.0));
      finalColor += rimColor * fresnel * 0.8;
      
      gl_FragColor = vec4(finalColor, 0.15 + fresnel * 0.3);
    }
  `
};

// Multi-layer neon tube edge component
const NeonTubeEdge: React.FC<{
  start: THREE.Vector3;
  end: THREE.Vector3;
  index: number;
  layer: number;
  reducedMotion?: boolean;
}> = ({ start, end, index, layer, reducedMotion }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const { geometry, material } = useMemo(() => {
    const curve = new THREE.LineCurve3(start, end);
    const widths = [0.032, 0.022, 0.014]; // Thick layers
    const geo = new THREE.TubeGeometry(curve, 2, widths[layer] || 0.01, 8, false);
    
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL((index / 12 + layer * 0.08) % 1, 1, 0.6),
      emissive: new THREE.Color().setHSL((index / 12 + layer * 0.08) % 1, 1, 0.6),
      emissiveIntensity: 4.0 - (layer * 0.8),
      toneMapped: false,
      transparent: true,
      opacity: 0.95 - (layer * 0.12),
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    return { geometry: geo, material: mat };
  }, [start, end, index, layer]);
  
  useFrame((state) => {
    if (meshRef.current && !reducedMotion) {
      const time = state.clock.elapsedTime;
      const hue = ((index / 12) + (layer * 0.08) + time * 0.04) % 1;
      material.color.setHSL(hue, 1, 0.6);
      material.emissive.setHSL(hue, 1, 0.6);
    }
  });
  
  return <mesh ref={meshRef} geometry={geometry} material={material} />;
};

// Create all 12 edges of cube with multiple layers
const createNeonEdges = (size: number, layers: number, reducedMotion?: boolean) => {
  const h = size / 2;
  const edges: [THREE.Vector3, THREE.Vector3][] = [
    [new THREE.Vector3(-h, -h, -h), new THREE.Vector3(h, -h, -h)],
    [new THREE.Vector3(h, -h, -h), new THREE.Vector3(h, -h, h)],
    [new THREE.Vector3(h, -h, h), new THREE.Vector3(-h, -h, h)],
    [new THREE.Vector3(-h, -h, h), new THREE.Vector3(-h, -h, -h)],
    [new THREE.Vector3(-h, h, -h), new THREE.Vector3(h, h, -h)],
    [new THREE.Vector3(h, h, -h), new THREE.Vector3(h, h, h)],
    [new THREE.Vector3(h, h, h), new THREE.Vector3(-h, h, h)],
    [new THREE.Vector3(-h, h, h), new THREE.Vector3(-h, h, -h)],
    [new THREE.Vector3(-h, -h, -h), new THREE.Vector3(-h, h, -h)],
    [new THREE.Vector3(h, -h, -h), new THREE.Vector3(h, h, -h)],
    [new THREE.Vector3(h, -h, h), new THREE.Vector3(h, h, h)],
    [new THREE.Vector3(-h, -h, h), new THREE.Vector3(-h, h, h)]
  ];
  
  const elements: React.ReactElement[] = [];
  edges.forEach((edge, idx) => {
    for (let l = 0; l < layers; l++) {
      elements.push(
        <NeonTubeEdge
          key={`edge-${idx}-layer-${l}`}
          start={edge[0]}
          end={edge[1]}
          index={idx}
          layer={l}
          reducedMotion={reducedMotion}
        />
      );
    }
  });
  
  return elements;
};

interface HyperCubeSceneProps {
  reducedMotion?: boolean;
}

const HyperCubeScene: React.FC<HyperCubeSceneProps> = ({ reducedMotion = false }) => {
  const { getCurrentUser } = useUnifiedAuth();
  const user = getCurrentUser();
  const { data: dnaData } = useDNATargets(user?.id || null);
  
  const groupRef = useRef<THREE.Group>(null);
  const { gl, scene, camera } = useThree();
  const [activePanelIndex, setActivePanelIndex] = useState<number | null>(null);
  const [highlightedTarget, setHighlightedTarget] = useState<{ x: number; y: number; z: number } | null>(null);
  const cubeCamera = useRef<THREE.CubeCamera>();
  const frameCount = useRef(0);
  const [envMap, setEnvMap] = useState<THREE.Texture | null>(null);
  
  const mobile = isMobile();
  const gridDensity = mobile ? 4 : 6;
  const cubeSize = 2.0;

  // Use fetched DNA data or defaults
  const dnaProfile = dnaData?.dna || {
    etica: 50,
    intuito: 50,
    audacia: 50,
    vibrazione: 50,
    rischio: 50
  };

  // Configure renderer
  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.15;
    gl.shadowMap.enabled = false;
    gl.setPixelRatio(mobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2));
  }, [gl, mobile]);

  // Setup CubeCamera for refraction
  useEffect(() => {
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      encoding: THREE.sRGBEncoding
    });
    
    cubeCamera.current = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
    scene.add(cubeCamera.current);
    
    return () => {
      if (cubeCamera.current) {
        scene.remove(cubeCamera.current);
        cubeCamera.current.renderTarget.dispose();
      }
    };
  }, [scene]);

  // Create post-processing effects
  const effects = useMemo(() => {
    const createEffects = async () => {
      const { BloomEffect, ChromaticAberrationEffect, SMAAEffect } = await loadPostProcessing();
      
      const bloom = new BloomEffect({
        intensity: reducedMotion ? 0.35 : (mobile ? 0.8 : 1.2),
        luminanceThreshold: reducedMotion ? 0.4 : 0.2,
        luminanceSmoothing: reducedMotion ? 0.8 : 0.9,
        mipmapBlur: !reducedMotion
      });
      
      const chroma = reducedMotion ? null : new ChromaticAberrationEffect({
        offset: new THREE.Vector2(0.0015, 0.0015)
      });
      
      const smaa = new SMAAEffect();
      
      return { bloom, chroma, smaa };
    };
    
    return createEffects();
  }, [mobile, reducedMotion]);

  const [effectsConfig, setEffectsConfig] = useState<any>({});

  useEffect(() => {
    effects.then(setEffectsConfig);
  }, [effects]);

  // Setup stable composer
  const composerRef = useStableComposer(gl, scene, camera, effectsConfig);

  // Glass material with Fresnel shader
  const glassMaterial = useMemo(() => {
    if (!envMap) {
      return new THREE.MeshPhysicalMaterial({
        transmission: 1.0,
        thickness: 0.75,
        roughness: 0.07,
        metalness: 0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        ior: 1.5,
        reflectivity: 0.95,
        iridescence: 1.0,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [120, 800],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
        color: new THREE.Color('#88ffff'),
        attenuationColor: new THREE.Color('#6ffcff'),
        attenuationDistance: 1.4
      });
    }
    
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        ...fresnelShader.uniforms,
        envMap: { value: envMap }
      },
      vertexShader: fresnelShader.vertexShader,
      fragmentShader: fresnelShader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    
    return mat;
  }, [envMap]);

  // Neon edges
  const outerEdges = useMemo(() => createNeonEdges(cubeSize, 3, reducedMotion), [reducedMotion]);

  // Panel data
  const panelData = useMemo(() => ({
    front: { label: 'Vibrazione', value: dnaProfile.vibrazione },
    top: { label: 'Intuito', value: dnaProfile.intuito },
    right: { label: 'Audacia', value: dnaProfile.audacia },
    left: { label: 'Etica', value: dnaProfile.etica },
    back: { label: 'Rischio', value: dnaProfile.rischio }
  }), [dnaProfile]);

  // Central core glow
  const coreRef = useRef<THREE.Mesh>(null);
  
  // Animation loop
  useFrame((state, delta) => {
    // Update CubeCamera for refraction (every 6 frames)
    if (cubeCamera.current && frameCount.current % 6 === 0) {
      if (groupRef.current) {
        groupRef.current.visible = false;
      }
      cubeCamera.current.update(gl, scene);
      if (groupRef.current) {
        groupRef.current.visible = true;
      }
      
      if (glassMaterial instanceof THREE.ShaderMaterial && cubeCamera.current.renderTarget.texture) {
        setEnvMap(cubeCamera.current.renderTarget.texture);
      }
    }
    
    // Core animation
    if (coreRef.current && !reducedMotion) {
      const time = state.clock.elapsedTime;
      const intensity = 4.5 + Math.sin(time * 2) * 0.8;
      (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
      
      const hue = (time * 0.08) % 1;
      (coreRef.current.material as THREE.MeshStandardMaterial).color.setHSL(hue, 1, 0.5);
      (coreRef.current.material as THREE.MeshStandardMaterial).emissive.setHSL(hue, 1, 0.5);
    }
    
    // Update Fresnel time uniform
    if (glassMaterial instanceof THREE.ShaderMaterial) {
      glassMaterial.uniforms.time.value = state.clock.elapsedTime;
    }
    
    // Render with composer
    if (composerRef.current) {
      try {
        composerRef.current.render(delta);
      } catch (error) {
        console.warn('⚠️ [DNA Composer] Render failed, using fallback:', error);
        gl.render(scene, camera);
      }
    } else {
      gl.render(scene, camera);
    }
    
    frameCount.current++;
  }, 1);

  return (
    <>
      {/* Starfield Background */}
      <StarfieldBackground count={1000} radius={100} reducedMotion={reducedMotion} />

      {/* Lights */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#00d1ff" />
      <directionalLight position={[-5, -5, -5]} intensity={0.6} color="#ff2768" />
      <pointLight position={[0, 0, 0]} intensity={2} color="#00ffff" distance={5} />

      {/* Floating Tesseract Group */}
      <FloatingAnimation amplitude={0.015} period={7} enabled={!reducedMotion}>
        <group ref={groupRef}>
          {/* Central core */}
          <mesh ref={coreRef} position={[0, 0, 0]}>
            <sphereGeometry args={[0.25, 32, 32]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={4.5}
              toneMapped={false}
            />
          </mesh>

          {/* Outer glass cube */}
          <mesh material={glassMaterial}>
            <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
          </mesh>

          {/* Neon edges */}
          {outerEdges}

          {/* Recursive inner grid with LOD */}
          <TesseractGrid 
            density={gridDensity} 
            cubeSize={cubeSize} 
            reducedMotion={reducedMotion}
            highlightedTarget={highlightedTarget}
          />

          {/* DNA Panels */}
          <DNAPanels
            data={panelData}
            activePanelIndex={activePanelIndex}
            onPanelClick={setActivePanelIndex}
            onPanelOpen={setHighlightedTarget}
            cubeSize={cubeSize}
          />
        </group>
      </FloatingAnimation>
    </>
  );
};

interface DNAHyperCubeProps {
  className?: string;
  reducedMotion?: boolean;
}

// Error Boundary
class DNAErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 [DNA] HyperCube crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center text-white/50">
          DNA visualization unavailable
        </div>
      );
    }
    return this.props.children;
  }
}

export const DNAHyperCube: React.FC<DNAHyperCubeProps> = ({ 
  className = '', 
  reducedMotion = false 
}) => {
  const mobile = isMobile();

  return (
    <DNAErrorBoundary>
      <div className={`w-full h-full relative ${className}`}>
        {/* Vignette overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-transparent via-transparent to-black/60 z-10" />
        
        <Canvas
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false
          }}
          dpr={mobile ? [1, 1.5] : [1, 2]}
          frameloop="always"
          style={{ background: 'transparent' }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 5.5]} fov={38} near={0.1} far={100} />
          
          <Suspense fallback={null}>
            <HyperCubeScene reducedMotion={reducedMotion} />
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.6}
            enableZoom={true}
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={(5 * Math.PI) / 6}
            maxDistance={8}
            minDistance={4}
          />
        </Canvas>
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 text-xs text-white/40 bg-black/20 rounded-full backdrop-blur-sm pointer-events-none">
          🟢 DNA Composer ready
        </div>
      </div>
    </DNAErrorBoundary>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
