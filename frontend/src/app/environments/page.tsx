"use client";

import Link from "next/link";
import { Waves, MountainSnow, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/common/page-header";
import { SectionHeader } from "@/components/common/section-header";
import { DataRow } from "@/components/common/data-row";
import { REGISTERED_ENVIRONMENTS } from "@/domain/environments";
import { formatSeverity } from "@/domain/status";

export default function EnvironmentsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Environment Domains Catalog"
        description="The platform architecture decouples environment domain specifications from image processing plumbing. River and Landslide are active in the MVP."
        actions={
          <Link href="/new-analysis">
            <Button size="sm">Start Analysis</Button>
          </Link>
        }
      />

      <div className="space-y-8">
        {REGISTERED_ENVIRONMENTS.map((env) => {
          const Icon = env.environment_id === "river" ? Waves : MountainSnow;

          return (
            <Card key={env.environment_id} className="overflow-hidden">
              <CardHeader className="bg-slate-50/70 border-b border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-white border border-slate-200 text-accent-800 flex items-center justify-center shadow-xs">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>{env.display_name}</CardTitle>
                        {env.is_primary ? (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-accent-100 text-accent-800 border border-accent-200">
                            Primary MVP Environment
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            Secondary MVP Environment
                          </span>
                        )}
                      </div>
                      <CardDescription className="mt-1">{env.description}</CardDescription>
                    </div>
                  </div>

                  <Link href={`/new-analysis?env=${env.environment_id}`}>
                    <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
                      Configure Analysis
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-5">
                {/* Supported Detections */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Supported Detection Findings ({env.supported_problem_types.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {env.supported_problem_types.map((pt) => {
                      const sev = formatSeverity(pt.default_severity);
                      return (
                        <div
                          key={pt.problem_type_id}
                          className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-xs font-bold text-slate-900 leading-tight">
                              {pt.display_name}
                            </h5>
                            <StatusBadge
                              label={sev.label.replace("Change Severity: ", "")}
                              variant={sev.variant}
                            />
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {pt.description}
                          </p>
                          <div className="pt-1 text-[11px] text-accent-800 bg-accent-50/40 p-2 rounded border border-accent-100">
                            <strong className="font-semibold">Recommended Protocol:</strong>{" "}
                            {pt.recommended_action}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Guided Questions */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Domain Investigation Questions ({env.guided_questions.length})
                  </h4>
                  <div className="divide-y divide-slate-100">
                    {env.guided_questions.map((q) => (
                      <DataRow
                        key={q.id}
                        label={q.prompt}
                        value={
                          <span className="text-slate-600 font-normal">
                            {q.required ? "Required input" : "Optional context"}
                          </span>
                        }
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
