// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';
import { SEGMENTS, WINNING_SEGMENTS } from '@/utils/dailySpinUtils';
import { PRIZE_CONFIG } from '@/utils/dailySpinPrizeMap';

interface DailySpin3DWheelProps {
  rotation: number;
  isAnimating: boolean;
  size?: number;
}

export const DailySpin3DWheel: React.FC<DailySpin3DWheelProps> = ({
  rotation,
  isAnimating,
  size = 400
}) => {
  const segmentAngle = 360 / 12; // 30 degrees per segment
  const radius = (size / 2) - 50; // Account for padding
  const center = size / 2;

  // M1SSION™ colors - alternating Blu neon, Giallo fluo, Viola profondo
  const getSegmentColors = (index: number, isWinning: boolean) => {
    if (!isWinning) {
      return {
        primary: '#2A2A2A',
        secondary: '#1A1A1A',
        stroke: '#333333'
      };
    }

    const colorIndex = index % 3;
    switch (colorIndex) {
      case 0: // Blu neon
        return {
          primary: '#00FFFF',
          secondary: '#0099CC',
          stroke: '#00FFFF'
        };
      case 1: // Giallo fluo
        return {
          primary: '#FFD700',
          secondary: '#FFA500',
          stroke: '#FFD700'
        };
      case 2: // Viola profondo
        return {
          primary: '#8A2BE2',
          secondary: '#6A1B9A',
          stroke: '#8A2BE2'
        };
      default:
        return {
          primary: '#00FFFF',
          secondary: '#0099CC',
          stroke: '#00FFFF'
        };
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Glow Ring */}
      <div 
        className="absolute rounded-full animate-pulse"
        style={{
          width: size + 40,
          height: size + 40,
          background: 'conic-gradient(from 0deg, #00FFFF 0%, #8A2BE2 33%, #FFD700 66%, #00FFFF 100%)',
          filter: 'blur(12px)',
          opacity: 0.6
        }}
      />

      {/* Main Wheel Container */}
      <div 
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          background: 'radial-gradient(circle, #1a1a1a 0%, #000000 70%)',
          border: '3px solid #00FFFF',
          boxShadow: '0 0 30px #00FFFF55, inset 0 0 30px #00000099'
        }}
      >
        {/* Main Wheel SVG */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0 z-10"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transition: isAnimating ? 'transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
          }}
        >
          {/* Wheel Segments */}
          {SEGMENTS.map((segment, index) => {
            const startAngle = (index * segmentAngle) - 90; // Start from top
            const endAngle = ((index + 1) * segmentAngle) - 90;
            const midAngle = (startAngle + endAngle) / 2;
            
            // Calculate path coordinates
            const largeArcFlag = segmentAngle > 180 ? 1 : 0;
            const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);

            const pathData = [
              `M ${center} ${center}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            // Get segment configuration
            const isWinning = WINNING_SEGMENTS.includes(index);
            const colors = getSegmentColors(index, isWinning);
            const config = PRIZE_CONFIG[segment as keyof typeof PRIZE_CONFIG];
            
            // Text positioning
            const textRadius = radius * 0.7;
            const textX = center + textRadius * Math.cos((midAngle * Math.PI) / 180);
            const textY = center + textRadius * Math.sin((midAngle * Math.PI) / 180);

            return (
              <g key={index}>
                {/* Gradient definitions */}
                <defs>
                  <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={colors.primary} />
                    <stop offset="100%" stopColor={colors.secondary} />
                  </linearGradient>
                  <filter id={`glow-${index}`}>
                    <feMorphology operator="dilate" radius="1"/>
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Segment Background */}
                <path
                  d={pathData}
                  fill={`url(#gradient-${index})`}
                  stroke={colors.stroke}
                  strokeWidth="2"
                  opacity={isWinning ? 0.9 : 0.4}
                  filter={isWinning ? `url(#glow-${index})` : 'none'}
                />
                
                {/* Inner shadow for 3D effect */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                
                {/* Segment Text */}
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-audiowide font-bold text-white"
                  fontSize={segment.length > 15 ? '11' : segment.length > 10 ? '12' : '13'}
                  transform={`rotate(${midAngle} ${textX} ${textY})`}
                  style={{
                    textShadow: isWinning 
                      ? `0 0 8px ${colors.primary}, 1px 1px 2px rgba(0,0,0,0.8)`
                      : '1px 1px 2px rgba(0,0,0,0.8)',
                    filter: isWinning ? 'drop-shadow(0 0 4px rgba(255,255,255,0.3))' : 'none'
                  }}
                >
                  {config?.short || segment}
                </text>
              </g>
            );
          })}
          
          {/* Center Hub with 3D effect */}
          <defs>
            <radialGradient id="center-gradient">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#E0E0E0" />
              <stop offset="100%" stopColor="#AAAAAA" />
            </radialGradient>
            <filter id="center-glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <circle
            cx={center}
            cy={center}
            r="40"
            fill="url(#center-gradient)"
            stroke="#00FFFF"
            strokeWidth="4"
            filter="url(#center-glow)"
          />
          
          {/* Inner circle for depth */}
          <circle
            cx={center}
            cy={center}
            r="32"
            fill="none"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="2"
          />
          
          {/* M1 Logo in center */}
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-audiowide text-2xl font-bold"
            fill="#00FFFF"
            style={{
              textShadow: '0 0 15px #00FFFF, 0 0 30px #00FFFF'
            }}
          >
            M1
          </text>
        </svg>
        
        {/* Fixed Pointer/Arrow at top */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 z-20"
          style={{
            filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))'
          }}
        >
          <div 
            className={`w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-yellow-400 ${
              isAnimating ? 'animate-pulse' : ''
            }`}
            style={{
              filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))',
              borderBottomColor: '#FFD700'
            }}
          />
          {/* Arrow glow effect */}
          <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-yellow-300 opacity-60"
            style={{
              filter: 'blur(2px)'
            }}
          />
        </div>
      </div>
    </div>
  );
};