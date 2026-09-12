import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, disabled, checked, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex items-start space-x-2.5">
        <div className="relative flex items-center pt-0.5">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            disabled={disabled}
            checked={checked}
            onChange={onChange}
            className={cn(
              "peer h-4 w-4 shrink-0 rounded border border-slate-300 bg-white text-accent-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-700 disabled:cursor-not-allowed disabled:opacity-50 accent-accent-700",
              className
            )}
            {...props}
          />
        </div>
        <div className="grid gap-0.5 leading-none">
          <label
            htmlFor={checkboxId}
            className={cn(
              "text-xs font-medium text-slate-900 cursor-pointer select-none",
              disabled && "cursor-not-allowed opacity-70"
            )}
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-slate-500 leading-normal">{description}</p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
