// © 2025 Joseph MULÉ – M1SSION™ - Siri-style Edge Glow Effect
import React, { useEffect } from 'react';

interface AIEdgeGlowProps {
  status: 'idle' | 'thinking' | 'speaking';
  isActive: boolean;
  audioLevel?: number; // 0-1 for TTS volume visualization
}

const AIEdgeGlow: React.FC<AIEdgeGlowProps> = ({ status, isActive, audioLevel = 0 }) => {
  useEffect(() => {
    if (isActive) {
      document.body.classList.add('ai-active');
    } else {
      document.body.classList.remove('ai-active');
    }
    
    return () => {
      document.body.classList.remove('ai-active');
    };
  }, [isActive]);

  if (!isActive) return null;

  const getAnimation = () => {
    switch (status) {
      case 'thinking':
        return 'aiGlowThink 2s ease-in-out infinite';
      case 'speaking':
        return audioLevel > 0 
          ? `aiGlowSpeak ${0.8 + (1 - audioLevel) * 0.4}s ease-in-out infinite` 
          : 'aiGlowSpeak 1.2s ease-in-out infinite';
      default:
        return 'aiGlowIdle 4s ease-in-out infinite';
    }
  };

  const getOpacity = () => {
    if (status === 'speaking' && audioLevel > 0) {
      return 0.4 + audioLevel * 0.4; // 0.4-0.8 based on audio
    }
    return 1;
  };

  return (
    <>
      <style>{`
        @keyframes aiGlowIdle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        @keyframes aiGlowThink {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes aiGlowSpeak {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.85; }
        }
        @keyframes glowRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          animation: getAnimation(),
          opacity: getOpacity(),
          willChange: 'opacity',
          transition: 'opacity 100ms ease-out'
        }}
      >
        {/* Edge glow layer */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              conic-gradient(
                from 0deg at 50% 50%,
                rgba(242, 19, 164, 0) 0%,
                rgba(0, 229, 255, 0.36) 25%,
                rgba(242, 19, 164, 0.36) 50%,
                rgba(0, 229, 255, 0) 75%,
                rgba(242, 19, 164, 0) 100%
              )
            `,
            maskImage: `
              linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%),
              linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)
            `,
            maskComposite: 'intersect',
            WebkitMaskImage: `
              linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%),
              linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)
            `,
            WebkitMaskComposite: 'source-in',
            filter: 'blur(28px)',
            animation: status === 'speaking' ? 'glowRotate 8s linear infinite' : 'glowRotate 20s linear infinite',
            mixBlendMode: 'screen'
          }}
        />
      </div>
    </>
  );
};

export default AIEdgeGlow;
