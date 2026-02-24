import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {

    const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants: Record<string, string> = {
      primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-[var(--shadow-glow-orange)] focus:ring-primary-500',
      secondary: 'bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-lg)] focus:ring-slate-500',
      success: 'bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white shadow-lg shadow-success-500/20 focus:ring-success-500',
      danger: 'bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 text-white shadow-lg shadow-danger-500/20 focus:ring-danger-500',
      ghost: 'hover:bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:ring-slate-500',
      outline: 'border border-primary-500/50 hover:border-primary-500 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 focus:ring-primary-500',
    };

    const sizes: Record<string, string> = {
      xs: 'px-2.5 py-1.5 text-xs gap-1',
      sm: 'px-3 py-2 text-sm gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
