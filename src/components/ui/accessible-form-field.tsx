// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Enhanced Accessible Form Field Component

import React from 'react';
import { cn } from '@/lib/utils';

interface AccessibleFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  helperText?: string;
  ariaDescribedBy?: string;
}

export const AccessibleFormField = React.forwardRef<HTMLInputElement, AccessibleFormFieldProps>(
  ({ className, label, icon, error, helperText, ariaDescribedBy, id, ...props }, ref) => {
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;
    
    const describedByIds = [
      error && errorId,
      helperText && helperId,
      ariaDescribedBy
    ].filter(Boolean).join(' ');

    return (
      <div className="space-y-2">
        <label 
          htmlFor={fieldId}
          className="block text-sm font-medium text-white"
        >
          {label}
          {props.required && (
            <span className="text-red-400 ml-1" aria-label="required">*</span>
          )}
        </label>
        
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            id={fieldId}
            className={cn(
              "w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors duration-200",
              icon && "pl-10",
              error && "border-red-500 focus:ring-red-400",
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedByIds || undefined}
            {...props}
          />
        </div>

        {helperText && (
          <p id={helperId} className="text-sm text-gray-400">
            {helperText}
          </p>
        )}

        {error && (
          <p 
            id={errorId} 
            className="text-sm text-red-400"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleFormField.displayName = "AccessibleFormField";