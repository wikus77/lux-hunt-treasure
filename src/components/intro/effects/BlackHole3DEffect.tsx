
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface BlackHole3DEffectProps {
  stage: number;
  visible: boolean;
}

const BlackHole3DEffect: React.FC<BlackHole3DEffectProps> = ({ stage, visible }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || isInitialized || !visible) return;
    
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Add renderer to container
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }
    
    // Set camera position
    camera.position.z = 50;
    
    // Create particle geometry
    const particleCount = 2000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Create particle system
    for (let i = 0; i < particleCount; i++) {
      // Create particles in a spherical distribution
      const radius = 30 + Math.random() * 20;
      const phi = Math.acos(-1 + Math.random() * 2);
      const theta = Math.random() * Math.PI * 2;
      
      // Convert spherical to cartesian coordinates
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Set colors (blue/cyan/white gradient)
      colors[i * 3] = 0.5 + Math.random() * 0.5; // Blue
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.3; // Green-blue
      colors[i * 3 + 2] = 0.9 + Math.random() * 0.1; // Brighten
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Create particle material
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    // Create particle system
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Create black hole core (black sphere)
    const blackHoleGeometry = new THREE.SphereGeometry(10, 32, 32);
    const blackHoleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
    scene.add(blackHole);
    
    // Animation variables
    let rotationSpeed = 0.001;
    let animationFrame: number;
    const particlePositions = particles.attributes.position.array as Float32Array;
    const initialPositions = particlePositions.slice();
    
    // Animation function
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      
      // Rotate particle system
      particleSystem.rotation.y += rotationSpeed;
      particleSystem.rotation.z += rotationSpeed * 0.5;
      
      // Black hole animation based on stage
      if (stage >= 2) {
        // Make particles spiral toward black hole in stage 2+
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          const x = particlePositions[i3];
          const y = particlePositions[i3 + 1];
          const z = particlePositions[i3 + 2];
          
          const distance = Math.sqrt(x * x + y * y + z * z);
          
          if (stage === 2) {
            // Orbit effect
            const spiralFactor = 0.998;
            particlePositions[i3] = x * spiralFactor + (y * 0.01);
            particlePositions[i3 + 1] = y * spiralFactor - (x * 0.01);
            particlePositions[i3 + 2] = z * spiralFactor;
          } else if (stage === 3) {
            // Implosion effect
            const attractFactor = 0.98;
            particlePositions[i3] = x * attractFactor;
            particlePositions[i3 + 1] = y * attractFactor;
            particlePositions[i3 + 2] = z * attractFactor;
            rotationSpeed = 0.005;
          } else if (stage >= 4) {
            // Explosion effect
            const explodeFactor = 1.015;
            particlePositions[i3] = x * explodeFactor;
            particlePositions[i3 + 1] = y * explodeFactor;
            particlePositions[i3 + 2] = z * explodeFactor;
            rotationSpeed = 0.002;
            particleMaterial.opacity = Math.max(0, particleMaterial.opacity - 0.005);
          }
        }
        particles.attributes.position.needsUpdate = true;
      }
      
      // Render the scene
      renderer.render(scene, camera);
    };
    
    // Start animation
    animate();
    setIsInitialized(true);
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.remove(particleSystem);
      scene.remove(blackHole);
      particles.dispose();
      blackHoleGeometry.dispose();
      blackHoleMaterial.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [visible, stage, isInitialized]);

  return (
    <div 
      ref={containerRef} 
      className="black-hole-3d-effect"
      style={{ 
        display: visible ? 'block' : 'none',
        opacity: stage >= 5 ? 0 : 1,
        transition: 'opacity 1.5s ease-out'
      }}
    />
  );
};

export default BlackHole3DEffect;
