// © 2025 Joseph MULÉ – M1SSION™ - Siri-style Edge Glow Effect
import React, { useEffect } from 'react';

interface AIEdgeGlowProps {
  status: 'idle' | 'thinking' | 'speaking';
  isActive: boolean;
}

const AIEdgeGlow: React.FC<AIEdgeGlowProps> = ({ status, isActive }) => {
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
        return 'aiGlowSpeak 1.2s ease-in-out infinite';
      default:
        return 'aiGlowIdle 4s ease-in-out infinite';
    }
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
          willChange: 'opacity'
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
