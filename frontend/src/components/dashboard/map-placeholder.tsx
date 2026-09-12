import * as React from "react";
import { cn } from "@/lib/utils";
import { Map, Layers, Compass, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MapPlaceholderProps {
  hasMonitoredAreas?: boolean;
  monitoredAreasCount?: number;
  className?: string;
}

export function MapPlaceholder({
  hasMonitoredAreas = false,
  monitoredAreasCount = 0,
  className,
}: MapPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-8 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 text-center overflow-hidden min-h-[220px]",
        className
      )}
    >
      {/* Background subtle spatial grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(to right, #0f172a 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-md space-y-3">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/80 text-slate-700">
          <Map className="h-5 w-5" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">
              Environmental Monitoring Map
            </h4>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 border border-slate-300/60">
              Phase 4 Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {hasMonitoredAreas
              ? `${monitoredAreasCount} monitored areas registered. Interactive geospatial map viewer will activate in Phase 4.`
              : "Interactive monitoring and spatial bounding polygons will appear here once monitored areas are established."}
          </p>
        </div>

        <div className="pt-1">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-xs text-slate-400 border-slate-200 cursor-not-allowed select-none"
          >
            <Layers className="h-3.5 w-3.5 mr-1.5 opacity-60" />
            Geospatial Viewer (Coming in Phase 4)
          </Button>
        </div>
      </div>
    </div>
  );
}
