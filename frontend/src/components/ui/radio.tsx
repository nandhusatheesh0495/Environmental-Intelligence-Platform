import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioOptionProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
  badge?: string;
}

export const RadioOption = React.forwardRef<HTMLInputElement, RadioOptionProps>(
  ({ className, label, description, badge, id, disabled, name, checked, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const radioId = id || generatedId;

    return (
      <label
        htmlFor={radioId}
        className={cn(
          "flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/70 transition-colors cursor-pointer select-none",
          checked && "border-accent-700 bg-accent-50/40 ring-1 ring-accent-700",
          disabled && "cursor-not-allowed opacity-60 hover:bg-white",
          className
        )}
      >
        <input
          type="radio"
          id={radioId}
          ref={ref}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="mt-0.5 h-4 w-4 text-accent-700 focus:ring-accent-700 accent-accent-700"
          {...props}
        />
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">{label}</span>
            {badge && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-accent-100 text-accent-800 border border-accent-200">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
          )}
        </div>
      </label>
    );
  }
);

RadioOption.displayName = "RadioOption";
