import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-2.5 rounded-xl transition-all duration-200 text-sm
              text-white placeholder-[var(--text-muted)] input-dark
              ${icon ? 'pl-11' : ''}
              ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-1 focus:ring-danger-500' : ''}
              ${className}
            `}
            {...props}
          />
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-danger-400 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
