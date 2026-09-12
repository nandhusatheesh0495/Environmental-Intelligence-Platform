import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  technicalDetails?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Environmental Analysis Error",
  message = "Unable to process the requested operation. Please verify image inputs or try again.",
  technicalDetails,
  onRetry,
  className,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 rounded-lg border border-red-200 bg-red-50/40 text-center max-w-lg mx-auto space-y-4",
        className
      )}
    >
      <div className="h-10 w-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
        <AlertCircle className="h-5 w-5" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-red-950">{title}</h4>
        <p className="text-xs text-red-800 leading-relaxed max-w-md">{message}</p>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-red-300 text-red-900 hover:bg-red-100/50"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Retry Operation
        </Button>
      )}

      {technicalDetails && (
        <div className="w-full pt-2 text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-[11px] font-medium text-red-700 hover:text-red-900 focus:outline-none"
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-3 w-3" /> Hide diagnostic details
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> View diagnostic details
              </>
            )}
          </button>
          {showDetails && (
            <pre className="mt-2 p-3 bg-red-100/60 rounded border border-red-200 text-[11px] font-mono text-red-900 whitespace-pre-wrap overflow-x-auto max-h-36">
              {technicalDetails}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
