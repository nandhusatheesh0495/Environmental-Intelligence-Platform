import * as React from "react";
import { Menu, ShieldCheck, Activity, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-8 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="outline" className="text-slate-600 bg-slate-50 font-normal py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
            Detection Pipeline Ready
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <ShieldCheck className="h-3.5 w-3.5 text-accent-700" />
          <span className="font-medium">Human-in-the-Loop Protocol Enforced</span>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            UTC {new Date().toISOString().substring(0, 10)}
          </span>
        </div>
      </div>
    </header>
  );
}
