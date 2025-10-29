// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface PanelData {
  label: string;
  value: number;
}

interface DNAPanelsProps {
  data: {
    front: PanelData;
    top: PanelData;
    right: PanelData;
    left: PanelData;
    back: PanelData;
  };
  activePanelIndex: number | null;
  onPanelClick: (index: number | null) => void;
  cubeSize: number;
}

export const DNAPanels: React.FC<DNAPanelsProps> = ({
  data,
  activePanelIndex,
  onPanelClick,
  cubeSize
}) => {
  const panels = [
    { name: 'front', data: data.front, position: [0, 0, cubeSize / 2], rotation: [0, 0, 0], axis: 'x' },
    { name: 'top', data: data.top, position: [0, cubeSize / 2, 0], rotation: [-Math.PI / 2, 0, 0], axis: 'x' },
    { name: 'right', data: data.right, position: [cubeSize / 2, 0, 0], rotation: [0, Math.PI / 2, 0], axis: 'y' },
    { name: 'left', data: data.left, position: [-cubeSize / 2, 0, 0], rotation: [0, -Math.PI / 2, 0], axis: 'y' },
    { name: 'back', data: data.back, position: [0, 0, -cubeSize / 2], rotation: [0, Math.PI, 0], axis: 'x' }
  ];

  return (
    <>
      {panels.map((panel, index) => (
        <DNAPanel
          key={panel.name}
          index={index}
          label={panel.data.label}
          value={panel.data.value}
          position={panel.position as [number, number, number]}
          rotation={panel.rotation as [number, number, number]}
          axis={panel.axis as 'x' | 'y'}
          isActive={activePanelIndex === index}
          onClick={() => onPanelClick(activePanelIndex === index ? null : index)}
          cubeSize={cubeSize}
        />
      ))}
    </>
  );
};

interface DNAPanelProps {
  index: number;
  label: string;
  value: number;
  position: [number, number, number];
  rotation: [number, number, number];
  axis: 'x' | 'y';
  isActive: boolean;
  onClick: () => void;
  cubeSize: number;
}

const DNAPanel: React.FC<DNAPanelProps> = ({
  label,
  value,
  position,
  rotation,
  axis,
  isActive,
  onClick,
  cubeSize
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);

  const panelMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      transmission: 0.9,
      thickness: 0.3,
      roughness: 0.1,
      clearcoat: 0.8,
      ior: 1.45,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      color: new THREE.Color('#88ffff')
    });
  }, []);

  // Animate panel opening
  useFrame(() => {
    if (!groupRef.current) return;

    targetRotation.current = isActive ? -Math.PI / 6 : 0; // 30 degrees open
    
    const currentRotation = axis === 'x' 
      ? groupRef.current.rotation.x 
      : groupRef.current.rotation.y;
    
    const newRotation = THREE.MathUtils.lerp(currentRotation, targetRotation.current, 0.12);
    
    if (axis === 'x') {
      groupRef.current.rotation.x = newRotation;
    } else {
      groupRef.current.rotation.y = newRotation;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <group position={position} rotation={rotation}>
      <group ref={groupRef}>
        {/* Panel face */}
        <mesh 
          material={panelMaterial}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <planeGeometry args={[cubeSize * 0.95, cubeSize * 0.95]} />
        </mesh>

        {/* Panel content - visible when open */}
        {isActive && (
          <group position={[0, 0, 0.3]}>
            {/* Label */}
            <Text
              position={[0, 0.3, 0]}
              fontSize={0.18}
              color="#00ffff"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {label}
            </Text>
            
            {/* Value */}
            <Text
              position={[0, 0, 0]}
              fontSize={0.35}
              color="#00ff88"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.03}
              outlineColor="#000000"
              fontWeight="bold"
            >
              {value}
            </Text>

            {/* Glow background */}
            <mesh position={[0, 0.15, -0.1]}>
              <planeGeometry args={[0.8, 0.6]} />
              <meshBasicMaterial
                color="#00ffff"
                transparent
                opacity={0.15}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
