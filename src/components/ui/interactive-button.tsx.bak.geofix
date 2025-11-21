
import React, { useState, useCallback } from 'react';
import { cn } from "@/lib/utils";

interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const InteractiveButton = React.forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ className, children, variant = 'default', size = 'md', ...props }, ref) => {
    const [rippleStyle, setRippleStyle] = useState<React.CSSProperties>({});
    const [isRippling, setIsRippling] = useState(false);

    const handleRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      const button = e.currentTarget;
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      
      setRippleStyle({
        width: `${diameter}px`,
        height: `${diameter}px`,
        left: `${e.clientX - button.offsetLeft - radius}px`,
        top: `${e.clientY - button.offsetTop - radius}px`
      });

      setIsRippling(true);
      setTimeout(() => setIsRippling(false), 600);
    }, []);

    const baseStyles = {
      default: 'bg-gradient-to-r from-[#7B2EFF] to-[#00D1FF] text-white hover:shadow-[0_0_15px_rgba(0,209,255,0.5)] hover:scale-[1.03]',
      outline: 'border border-[#00D1FF]/30 hover:border-[#00D1FF]/70 bg-black/30 hover:bg-black/50 text-white',
      ghost: 'hover:bg-white/10 hover:text-[#00D1FF] text-white'
    };

    const sizeStyles = {
      sm: 'px-4 py-1.5 text-sm rounded-full',
      md: 'px-6 py-2 rounded-full',
      lg: 'px-8 py-3 text-lg rounded-full'
    };

    return (
      <button
        ref={ref}
        className={cn(
          'relative font-medium transition-all duration-300',
          'press-effect ripple-effect interaction-feedback',
          baseStyles[variant],
          sizeStyles[size],
          className
        )}
        onClick={handleRipple}
        {...props}
      >
        {children}
        {isRippling && (
          <span 
            className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
            style={rippleStyle} 
          />
        )}
      </button>
    )
  }
);

InteractiveButton.displayName = 'InteractiveButton';

export { InteractiveButton };
