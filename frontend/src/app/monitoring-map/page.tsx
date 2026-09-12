"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import * as React from "react";
import Link from "next/link";
import { MapPin, Map as MapIcon, RefreshCcw, AlertCircle, Filter, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export type MapFeatureProperties = {
  environment: string;
  environment_name: string;
  problem_type: string;
  investigation_priority: string;
  confidence: number;
  change_percentage?: number;
  analysis_id?: string;
  analysis_title?: string;
  evidence?: string[];
  recommendation?: string;
};

export type MapFeature = {
  id: string;
  type: "Feature";
  geometry: { type: string; coordinates: number[] | number[][] | number[][][] };
  properties: MapFeatureProperties;
};

export type MapPayload = {
  state: "empty" | "ready" | "error";
  message: string;
  demo_mode: boolean;
  features: MapFeature[];
};

const priorityOrder = { high: 3, moderate: 2, low: 1 } as const;

const EMPTY_PAYLOAD: MapPayload = {
  state: "empty",
  message: "No monitored areas yet. Complete an analysis to begin monitoring environmental changes.",
  demo_mode: false,
  features: [],
};

function getPriorityLabel(value: string | undefined) {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export default function MonitoringMapPage() {
  const [environmentFilter, setEnvironmentFilter] = React.useState("all");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [mapState, setMapState] = React.useState<MapPayload>(EMPTY_PAYLOAD);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstance = React.useRef<any>(null);
  const [layerVisibility, setLayerVisibility] = React.useState({
    changes: true,
    priority: true,
    areas: true,
  });

  React.useEffect(() => {
    let active = true;
    const loadMapData = async () => {
      setError(null);

      try {
        const response = await fetch("http://localhost:8000/api/v1/map/features?mode=empty", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to load monitoring data.");
        }
        const data = (await response.json()) as MapPayload;
        if (active) {
          setMapState(data);
        }
      } catch {
        if (active) {
          setMapState(EMPTY_PAYLOAD);
        }
      }
    };

    loadMapData();
    return () => {
      active = false;
    };
  }, []);

  const filteredFeatures = React.useMemo(() => {
    const features = [...mapState.features];
    return features.filter((feature) => {
      if (environmentFilter !== "all" && feature.properties.environment !== environmentFilter) return false;
      if (priorityFilter !== "all" && feature.properties.investigation_priority.toLowerCase() !== priorityFilter) return false;
      return true;
    });
  }, [environmentFilter, mapState.features, priorityFilter]);

  const selectedFinding = React.useMemo(
    () => filteredFeatures.find((feature) => feature.id === selectedId) ?? filteredFeatures[0] ?? null,
    [filteredFeatures, selectedId]
  );

  React.useEffect(() => {
    if (!selectedFinding && filteredFeatures.length > 0) {
      setSelectedId(filteredFeatures[0].id);
    }
  }, [filteredFeatures, selectedFinding]);

  const handleDemoToggle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/v1/map/features?mode=demo", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load demo monitoring data.");
      }
      const data = (await response.json()) as MapPayload;
      setMapState(data);
    } catch {
      setMapState(EMPTY_PAYLOAD);
      setError("Unable to load monitoring data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await handleDemoToggle();
  };

  React.useEffect(() => {
    if (!mapRef.current || filteredFeatures.length === 0 || typeof window === "undefined") {
      return;
    }

    let disposed = false;

    async function initializeMap() {
      try {
        const maplibregl = await import("maplibre-gl");
        if (disposed || !mapRef.current || mapInstance.current) {
          return;
        }

        mapInstance.current = new maplibregl.Map({
          container: mapRef.current,
          style: process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://demotiles.maplibre.org/style.json",
          center: [76.3, 10.9],
          zoom: 6,
          attributionControl: { compact: true },
        });

        mapInstance.current.addControl(new maplibregl.NavigationControl({ showCompass: true }));

        const geoJson = {
          type: "FeatureCollection",
          features: filteredFeatures.map((feature) => ({
            type: "Feature",
            geometry: feature.geometry,
            properties: {
              ...feature.properties,
              priority: feature.properties.investigation_priority,
            },
          })),
        };

        mapInstance.current.on("load", () => {
          if (!mapInstance.current) return;
          mapInstance.current.addSource("monitoring-features", {
            type: "geojson",
            data: geoJson,
          });

          mapInstance.current.addLayer({
            id: "feature-points",
            type: "circle",
            source: "monitoring-features",
            paint: {
              "circle-radius": 10,
              "circle-color": [
                "match",
                ["get", "priority"],
                "high", "#dc2626",
                "moderate", "#f59e0b",
                "low", "#10b981",
                "#64748b",
              ],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            },
          });
        });
      } catch {
        // Fall back to the static map-viewer layout when a browser WebGL context is unavailable.
      }
    }

    initializeMap();
    return () => {
      disposed = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [filteredFeatures]);

  const mapSummary = selectedFinding
    ? `${selectedFinding.properties.problem_type} · ${getPriorityLabel(selectedFinding.properties.investigation_priority)} Priority`
    : "No selected finding";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-700">Operational Monitoring</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Monitoring Map</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 text-xs">
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDemoToggle} className="gap-2 text-xs">
            <MapPin className="h-3.5 w-3.5" />
            Demo data
          </Button>
        </div>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <span className="sr-only">Environment</span>
              <Select
                aria-label="Environment"
                value={environmentFilter}
                onChange={(event) => setEnvironmentFilter(event.target.value)}
                className="min-w-[150px]"
                options={[
                  { value: "all", label: "All environments" },
                  { value: "river", label: "River" },
                  { value: "landslide", label: "Landslide" },
                ]}
              />
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <span className="sr-only">Priority</span>
              <Select
                aria-label="Priority"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                className="min-w-[150px]"
                options={[
                  { value: "all", label: "All priorities" },
                  { value: "high", label: "High" },
                  { value: "moderate", label: "Moderate" },
                  { value: "low", label: "Low" },
                ]}
              />
            </label>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-medium">Layer controls</span>
            <button type="button" onClick={() => setLayerVisibility((prev) => ({ ...prev, changes: !prev.changes }))} className="rounded border border-slate-200 px-2 py-1 text-[11px]">
              {layerVisibility.changes ? "Hide changes" : "Show changes"}
            </button>
            <button type="button" onClick={() => setLayerVisibility((prev) => ({ ...prev, priority: !prev.priority }))} className="rounded border border-slate-200 px-2 py-1 text-[11px]">
              {layerVisibility.priority ? "Hide priority" : "Show priority"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <MapIcon className="h-4 w-4 text-accent-700" />
              Map viewport
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">Zoom +</button>
              <button type="button" className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">Zoom -</button>
              <button type="button" className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">Reset</button>
            </div>
          </div>

          <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,_#f8fafc_0%,_#e2e8f0_100%)]">
            <div className="absolute inset-0 opacity-20" aria-hidden="true" style={{ backgroundImage: "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(to right, #0f172a 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

            {filteredFeatures.length > 0 && (
              <div
                ref={mapRef}
                className="absolute inset-0 z-0 h-full w-full"
                aria-label="Monitoring map"
              />
            )}

            {isLoading ? (
              <div className="relative z-10 text-center">
                <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-2 border-accent-200 border-t-accent-700" />
                <p className="text-sm font-medium text-slate-700">Loading monitoring data…</p>
              </div>
            ) : error ? (
              <div className="relative z-10 max-w-sm rounded-lg border border-red-200 bg-red-50 p-5 text-center text-red-900">
                <AlertCircle className="mx-auto mb-2 h-6 w-6" />
                <h2 className="text-sm font-semibold">Unable to load monitoring data.</h2>
                <p className="mt-2 text-xs text-red-700">Retry to refresh the monitoring layer and check the integration status.</p>
                <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-4">Retry</Button>
              </div>
            ) : filteredFeatures.length === 0 ? (
              <div className="relative z-10 max-w-md rounded-lg border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-sm">
                <MapPin className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                <h2 className="text-base font-semibold text-slate-900">{mapState.message.includes("No monitored areas yet") ? "No monitored areas yet" : "No monitoring data available"}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {mapState.message.includes("No monitored areas yet")
                    ? "No monitored areas are active right now. Complete an analysis to begin monitoring environmental changes."
                    : mapState.message}
                </p>
                {mapState.demo_mode && <p className="mt-3 text-xs text-amber-700">Demo data loaded but no features matched the current filters.</p>}
              </div>
            ) : (
              <div className="absolute inset-0 z-10">
                {filteredFeatures.map((feature, index) => {
                  const priority = feature.properties.investigation_priority.toLowerCase();
                  const isSelected = feature.id === selectedFinding?.id;
                  const x = 20 + ((index + 1) * 18) % 68;
                  const y = 28 + ((index + 2) * 17) % 52;
                  const priorityColor =
                    priority === "high" ? "bg-red-600 border-red-700" : priority === "moderate" ? "bg-amber-500 border-amber-600" : "bg-emerald-500 border-emerald-600";

                  return (
                    <button
                      key={feature.id}
                      type="button"
                      aria-label={`View ${feature.properties.problem_type}`}
                      onClick={() => setSelectedId(feature.id)}
                      className={`absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[8px] text-white shadow-md transition ${priorityColor} ${isSelected ? "scale-125 ring-4 ring-slate-200" : ""}`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      title={`${feature.properties.problem_type} (${priority})`}
                    >
                      {feature.properties.environment === "river" ? "R" : "L"}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Selected finding</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{selectedFinding ? selectedFinding.properties.problem_type : "No finding selected"}</h2>
            </div>
            {selectedFinding && (
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-700">
                {selectedFinding.properties.environment_name}
              </span>
            )}
          </div>

          {selectedFinding ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Investigation priority</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${selectedFinding.properties.investigation_priority.toLowerCase() === "high" ? "border-red-200 bg-red-50 text-red-700" : selectedFinding.properties.investigation_priority.toLowerCase() === "moderate" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                    {getPriorityLabel(selectedFinding.properties.investigation_priority)}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{Math.round((selectedFinding.properties.confidence ?? 0) * 100)}%</p>
                <p className="mt-1 text-xs text-slate-600">AI confidence reflects classification evidence, not disaster probability.</p>
              </div>

              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3 rounded border border-slate-200 bg-white px-3 py-2">
                  <span className="text-slate-500">Observed change</span>
                  <span className="font-semibold text-slate-900">{selectedFinding.properties.change_percentage ?? "—"}%</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded border border-slate-200 bg-white px-3 py-2">
                  <span className="text-slate-500">Environment</span>
                  <span className="font-semibold text-slate-900">{selectedFinding.properties.environment}</span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Evidence</p>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  {(selectedFinding.properties.evidence ?? ["No evidence available for this finding."]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Recommendation</p>
                <p className="mt-2 text-sm text-slate-700">{selectedFinding.properties.recommendation ?? "Field verification recommended."}</p>
              </div>

              <Link href={selectedFinding.properties.analysis_id ? `/analysis/${selectedFinding.properties.analysis_id}` : "/new-analysis"} className="block">
                <Button variant="primary" size="sm" className="w-full justify-center gap-2">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  View Analysis
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-600" />
              No finding selected.
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-semibold uppercase tracking-wider text-slate-700">Map status</p>
            <p className="mt-2">{mapSummary}</p>
            {mapState.demo_mode && <p className="mt-2 text-amber-700">Demo data</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
