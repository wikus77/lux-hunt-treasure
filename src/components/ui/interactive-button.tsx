
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
      default: 'bg-projectx-blue text-white hover:bg-projectx-blue/90',
      outline: 'border border-projectx-blue text-projectx-blue hover:bg-projectx-blue/10',
      ghost: 'text-projectx-blue hover:bg-projectx-blue/10'
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
    };

    return (
      <button
        ref={ref}
        className={cn(
          'relative rounded-md font-medium transition-all duration-200',
          'press-effect ripple-effect interaction-feedback',
          baseStyles[variant],
          sizeStyles[size],
          className
        )}
        onClick={handleRipple}
        {...props}
      >
        {children}
        {isRippling && <span className="ripple" style={rippleStyle} />}
      </button>
    )
  }
);

InteractiveButton.displayName = 'InteractiveButton';

export { InteractiveButton };
