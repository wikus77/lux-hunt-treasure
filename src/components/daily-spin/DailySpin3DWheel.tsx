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
  size = 380
}) => {
  const segmentAngle = 360 / 12; // 30 degrees per segment
  const radius = (size / 2) - 40; // Account for padding
  const center = size / 2;

  return (
    <div className="relative flex items-center justify-center">
      {/* Wheel Container with 3D Effects */}
      <div 
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          filter: 'drop-shadow(0 0 30px rgba(0, 255, 255, 0.3)) drop-shadow(0 0 60px rgba(138, 43, 226, 0.2))',
        }}
      >
        {/* Outer Ring Glow */}
        <div 
          className="absolute inset-0 rounded-full opacity-60"
          style={{
            background: 'conic-gradient(from 0deg, #00FFFF, #8A2BE2, #FFD700, #00FFFF)',
            filter: 'blur(8px)',
            transform: 'scale(1.1)',
          }}
        />
        
        {/* Main Wheel SVG */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={`relative z-10 transition-transform duration-[4000ms] ease-out ${
            isAnimating ? 'animate-pulse' : ''
          }`}
          style={{ 
            transform: `rotate(${rotation}deg)`,
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
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
            const config = PRIZE_CONFIG[segment as keyof typeof PRIZE_CONFIG];
            
            // Colors based on win status and segment type
            let fillColor, strokeColor;
            if (isWinning) {
              fillColor = `linear-gradient(135deg, ${config?.color || '#FFD700'}, ${config?.glow || '#FFD700'}66)`;
              strokeColor = '#FFFFFF';
            } else {
              fillColor = 'linear-gradient(135deg, #2A2A2A, #1A1A1A)';
              strokeColor = '#444444';
            }

            // Text positioning
            const textRadius = radius * 0.7;
            const textX = center + textRadius * Math.cos((midAngle * Math.PI) / 180);
            const textY = center + textRadius * Math.sin((midAngle * Math.PI) / 180);

            return (
              <g key={index}>
                {/* Segment Background */}
                <defs>
                  <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isWinning ? (config?.color || '#FFD700') : '#2A2A2A'} />
                    <stop offset="100%" stopColor={isWinning ? (config?.glow || '#FFD700') + '88' : '#1A1A1A'} />
                  </linearGradient>
                </defs>
                
                <path
                  d={pathData}
                  fill={`url(#gradient-${index})`}
                  stroke={strokeColor}
                  strokeWidth="2"
                  className={isWinning ? 'opacity-90' : 'opacity-70'}
                  style={{
                    filter: isWinning 
                      ? `drop-shadow(0 0 10px ${config?.glow || '#FFD700'}66)`
                      : 'none'
                  }}
                />
                
                {/* Segment Text */}
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`font-bold text-white ${
                    segment.length > 12 ? 'text-xs' : 'text-sm'
                  }`}
                  transform={`rotate(${midAngle} ${textX} ${textY})`}
                  style={{
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))'
                  }}
                >
                  {config?.short || segment}
                </text>
                
                {/* Emoji overlay for better visual */}
                {config?.emoji && (
                  <text
                    x={textX}
                    y={textY - 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-lg"
                    transform={`rotate(${midAngle} ${textX} ${textY - 12})`}
                  >
                    {config.emoji}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Center Hub */}
          <circle
            cx={center}
            cy={center}
            r="35"
            fill="url(#center-gradient)"
            stroke="#00FFFF"
            strokeWidth="3"
            style={{
              filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.6))'
            }}
          />
          
          {/* Center gradient definition */}
          <defs>
            <radialGradient id="center-gradient">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#F0F0F0" />
              <stop offset="100%" stopColor="#CCCCCC" />
            </radialGradient>
          </defs>
          
          {/* M1 Logo in center */}
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-mission text-xl font-bold"
            fill="#00FFFF"
            style={{
              textShadow: '0 0 10px #00FFFF'
            }}
          >
            M1
          </text>
        </svg>
        
        {/* Pointer/Arrow */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))'
          }}
        >
          <div 
            className={`w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-yellow-400 ${
              isAnimating ? 'animate-pulse' : ''
            }`}
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))'
            }}
          />
        </div>
      </div>
    </div>
  );
};