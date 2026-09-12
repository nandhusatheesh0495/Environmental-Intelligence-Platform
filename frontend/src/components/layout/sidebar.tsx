import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Compass,
  Layers,
  Map as MapIcon,
  FileText,
  Users,
  Settings,
  ShieldCheck,
  X,
  ExternalLink,
} from "lucide-react";

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      title: "Overview",
      href: "/",
      icon: LayoutDashboard,
      status: "active",
    },
    {
      title: "New Analysis",
      href: "/new-analysis",
      icon: Compass,
      badge: "Primary",
      status: "active",
    },
    {
      title: "Environment Domains",
      href: "/environments",
      icon: Layers,
      status: "active",
    },
    {
      title: "Monitoring Map",
      href: "/monitoring-map",
      icon: MapIcon,
      badge: "Phase 6",
      status: "active",
    },
    {
      title: "Reports & Evidence",
      href: "#",
      icon: FileText,
      badge: "Phase 7",
      status: "coming_soon",
    },
    {
      title: "Citizen Reports",
      href: "/citizen-reports",
      icon: Users,
      badge: "Phase 8",
      status: "active",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded bg-accent-700 text-white font-bold text-sm tracking-wider shadow-sm">
              EI
            </div>
            <div className="leading-tight">
              <span className="block text-xs font-bold tracking-wider text-slate-900 uppercase">
                Environmental
              </span>
              <span className="block text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                Intelligence Platform
              </span>
            </div>
          </Link>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:text-slate-600 md:hidden"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Primary navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-2 mb-2">
              <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Officer Operations
              </p>
            </div>
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const isComingSoon = item.status === "coming_soon";
                const Icon = item.icon;

                if (isComingSoon) {
                  return (
                    <div
                      key={item.title}
                      className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 rounded-md cursor-not-allowed select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-slate-300 shrink-0" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-accent-50/80 text-accent-900 font-semibold border-l-2 border-accent-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-accent-700" : "text-slate-400"
                        )}
                      />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent-100 text-accent-800 border border-accent-200">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-2 mb-2">
              <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                System & Registry
              </p>
            </div>
            <nav className="space-y-1">
              <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 rounded-md cursor-not-allowed select-none">
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-slate-300 shrink-0" />
                  <span>Settings</span>
                </div>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                  v0.1
                </span>
              </div>
            </nav>
          </div>
        </div>

        {/* User profile & system status */}
        <div className="border-t border-slate-200 p-3 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-md bg-white border border-slate-200">
            <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
              OV
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">
                Officer J. Vance
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                Disaster Mgmt Division
              </p>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Operational" />
          </div>
        </div>
      </aside>
    </>
  );
}
