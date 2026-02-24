import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, hint, options, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-4 py-2.5 pr-10 rounded-xl transition-all duration-200
              focus:outline-none appearance-none cursor-pointer
              text-white input-dark
              ${error ? 'border-red-500/60' : ''}
              ${className}
            `}
            style={{
              background: 'var(--bg-panel)',
              border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--border-lg)'}`,
              fontSize: '0.9rem',
            }}
            {...props}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                style={{ background: '#1a2740', color: '#f0f4f8' }}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-400">⚠ {error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
