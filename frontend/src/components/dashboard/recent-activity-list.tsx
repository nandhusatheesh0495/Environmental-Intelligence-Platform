import * as React from "react";
import { cn } from "@/lib/utils";
import { ActivityItem } from "@/domain/dashboard";
import {
  Activity,
  FileCheck,
  Search,
  AlertTriangle,
  UserCheck,
  FileText,
  Clock,
  Waves,
  MountainSnow,
} from "lucide-react";

export interface RecentActivityListProps {
  activities: ActivityItem[];
  className?: string;
}

export function RecentActivityList({
  activities,
  className,
}: RecentActivityListProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className={cn("p-6 text-center rounded-lg border border-slate-200 bg-white shadow-xs", className)}>
        <Activity className="h-6 w-6 text-slate-300 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-700">No recent activity</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Operational log events will populate as analyses and officer reviews occur.
        </p>
      </div>
    );
  }

  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "change_detected":
        return <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />;
      case "analysis_completed":
        return <FileCheck className="h-3.5 w-3.5 text-accent-700" />;
      case "finding_reviewed":
        return <UserCheck className="h-3.5 w-3.5 text-emerald-600" />;
      case "analysis_created":
        return <Search className="h-3.5 w-3.5 text-sky-600" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white shadow-xs divide-y divide-slate-100", className)}>
      {activities.map((item) => (
        <div key={item.id} className="p-3.5 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
          <div className="h-7 w-7 rounded bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
            {getIcon(item.type)}
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {item.title}
              </p>
              <span className="text-[10px] text-slate-400 shrink-0 font-mono whitespace-nowrap">
                {item.timestamp}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight truncate">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
