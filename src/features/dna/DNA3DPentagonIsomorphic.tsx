// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { DNAProfile } from './dnaTypes';

// Debug flag
const DEBUG_DNA_3D = true;

interface DNA3DPentagonIsomorphicProps {
  rotation: { x: number; y: number };
  color: string;
  size: number;
  profile: DNAProfile;
  strokeWidth?: number;
  glowIntensity?: number;
}

/**
 * Pentagon attributes (IDENTICAL to 2D version)
 * These angles define the 5 vertices clockwise from top
 */
const PENTAGON_ATTRIBUTES = [
  { key: 'intuito', label: 'INTUITO', angle: -Math.PI / 2 },
  { key: 'audacia', label: 'AUDACIA', angle: -Math.PI / 10 },
  { key: 'rischio', label: 'RISCHIO', angle: Math.PI / 2 + Math.PI / 5 },
  { key: 'etica', label: 'ETICA', angle: Math.PI + Math.PI / 5 },
  { key: 'vibrazione', label: 'VIBRAZIONE', angle: -Math.PI + Math.PI / 10 }
];

/**
 * Isomorphic Pentagon Mesh
 * Uses the EXACT SAME vertex calculations as the 2D canvas version
 */
const PentagonIsomorphicMesh: React.FC<{
  rotation: { x: number; y: number };
  color: string;
  profile: DNAProfile;
  radius: number;
  strokeWidth: number;
  glowIntensity: number;
}> = ({ rotation, color, profile, radius, strokeWidth, glowIntensity }) => {
  const groupRef = useRef<THREE.Group>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  
  // Calculate vertices IDENTICALLY to 2D version
  const vertices = useMemo(() => {
    return PENTAGON_ATTRIBUTES.map(attr => {
      const value = profile[attr.key as keyof DNAProfile] as number;
      const normalizedValue = (value / 100) * radius;
      
      return new THREE.Vector2(
        normalizedValue * Math.cos(attr.angle),
        normalizedValue * Math.sin(attr.angle)
      );
    });
  }, [profile, radius]);
  
  // Create THREE.Shape from exact 2D vertices
  const pentagonShape = useMemo(() => {
    const shape = new THREE.Shape();
    
    vertices.forEach((v, idx) => {
      if (idx === 0) {
        shape.moveTo(v.x, v.y);
      } else {
        shape.lineTo(v.x, v.y);
      }
    });
    shape.closePath();
    
    return shape;
  }, [vertices]);
  
  // Extrude geometry with MINIMAL depth (based on stroke width)
  const extrudeGeometry = useMemo(() => {
    const depth = strokeWidth * 0.8; // Minimal 3D depth
    
    return new THREE.ExtrudeGeometry(pentagonShape, {
      depth,
      bevelEnabled: true,
      bevelThickness: strokeWidth * 0.15,
      bevelSize: strokeWidth * 0.15,
      bevelSegments: 2,
    });
  }, [pentagonShape, strokeWidth]);
  
  // Edges geometry for stroke (EXACT same appearance as 2D)
  const edgesGeometry = useMemo(() => {
    return new THREE.EdgesGeometry(extrudeGeometry, 15);
  }, [extrudeGeometry]);
  
  // Material matching 2D appearance
  const material = useMemo(() => {
    const threeColor = new THREE.Color(color);
    
    return new THREE.MeshStandardMaterial({
      color: threeColor,
      emissive: threeColor,
      emissiveIntensity: glowIntensity * 0.4,
      metalness: 0.1,
      roughness: 0.4,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
  }, [color, glowIntensity]);
  
  // Line material for stroke
  const lineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: color,
      linewidth: strokeWidth, // Note: linewidth may not work on all platforms
      transparent: true,
      opacity: 1.0,
    });
  }, [color, strokeWidth]);
  
  // Apply rotation from parent (reads rotationLiveRef)
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = (rotation.x * Math.PI) / 180;
      groupRef.current.rotation.y = (rotation.y * Math.PI) / 180;
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Main extruded pentagon */}
      <mesh geometry={extrudeGeometry} material={material} />
      
      {/* Stroke edges (isomorphic to 2D stroke) */}
      <lineSegments ref={edgesRef} geometry={edgesGeometry} material={lineMaterial} />
    </group>
  );
};

/**
 * Isomorphic 3D Pentagon Canvas
 * Orthographic camera to maintain 2D appearance with 3D depth
 */
export const DNA3DPentagonIsomorphic: React.FC<DNA3DPentagonIsomorphicProps> = ({
  rotation,
  color,
  size,
  profile,
  strokeWidth = 3,
  glowIntensity = 0.6
}) => {
  // Debug trace on mount only
  React.useEffect(() => {
    if (DEBUG_DNA_3D) {
      console.log('[DNA TRACE] 3D Isomorphic active (OrthographicCamera + Exact 2D vertices)');
    }
  }, []);
  
  // Calculate radius same as 2D version
  const radius = size * 0.35;
  
  // Orthographic camera bounds for isometric view
  const orthoSize = size / 2;
  
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <Canvas
        orthographic
        camera={{
          position: [0, 0, 200],
          zoom: 1,
          near: 0.1,
          far: 1000,
          left: -orthoSize,
          right: orthoSize,
          top: orthoSize,
          bottom: -orthoSize,
        }}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
          pointerEvents: 'none', // Let parent handle all input
        }}
        dpr={[1, 2]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Minimal lighting to preserve 2D appearance */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 0, 50]} intensity={0.3} />
        <directionalLight position={[20, 20, 30]} intensity={0.2} />
        
        {/* Isomorphic pentagon mesh */}
        <PentagonIsomorphicMesh
          rotation={rotation}
          color={color}
          profile={profile}
          radius={radius}
          strokeWidth={strokeWidth}
          glowIntensity={glowIntensity}
        />
      </Canvas>
      
      {/* Soft shadow underneath (CSS, same as 2D glow) */}
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: '30px',
          background: `radial-gradient(ellipse, ${color}25 0%, transparent 70%)`,
          filter: 'blur(15px)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
