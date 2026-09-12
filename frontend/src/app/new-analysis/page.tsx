"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Waves,
  MountainSnow,
  CheckCircle2,
  Calendar,
  MapPin,
  HelpCircle,
  Play,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RadioOption } from "@/components/ui/radio";
import { DropZone } from "@/components/ui/dropzone";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/common/page-header";
import { SectionHeader } from "@/components/common/section-header";
import { LoadingState } from "@/components/common/loading-state";
import { REGISTERED_ENVIRONMENTS } from "@/domain/environments";
import { EnvironmentType } from "@/domain/types";

export default function NewAnalysisPage() {
  const [selectedEnvId, setSelectedEnvId] = React.useState<EnvironmentType>("river");
  const [areaName, setAreaName] = React.useState("Periyar River - Lower Reach Sector 4");
  const [coordinates, setCoordinates] = React.useState("10.0159° N, 76.2711° E");
  const [beforeDate, setBeforeDate] = React.useState("2026-08-01");
  const [afterDate, setAfterDate] = React.useState("2026-09-10");
  const [beforeFile, setBeforeFile] = React.useState<File | null>(null);
  const [afterFile, setAfterFile] = React.useState<File | null>(null);
  const [isSimulatingValidation, setIsSimulatingValidation] = React.useState(false);
  const [validationSuccess, setValidationSuccess] = React.useState(false);
  const [questionAnswers, setQuestionAnswers] = React.useState<Record<string, string>>({});

  const currentEnv = REGISTERED_ENVIRONMENTS.find((e) => e.environment_id === selectedEnvId) || REGISTERED_ENVIRONMENTS[0];

  const handleEnvChange = (id: EnvironmentType) => {
    setSelectedEnvId(id);
    if (id === "landslide") {
      setAreaName("Wayanad Ridge - Sector B Slope");
      setCoordinates("11.6854° N, 76.1320° E");
    } else {
      setAreaName("Periyar River - Lower Reach Sector 4");
      setCoordinates("10.0159° N, 76.2711° E");
    }
    setQuestionAnswers({});
    setValidationSuccess(false);
  };

  const handleValidateInputs = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulatingValidation(true);
    setTimeout(() => {
      setIsSimulatingValidation(false);
      setValidationSuccess(true);
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Start New Environmental Analysis"
        description="Configure temporal imagery comparison parameters, select target environment, and validate source files."
        actions={
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleValidateInputs} className="space-y-8">
        {/* Step 1: Environment Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-700 text-white text-[11px] font-bold">
                1
              </span>
              <CardTitle>Select Environmental Domain</CardTitle>
            </div>
            <CardDescription>
              Each environment initializes specialized computer vision classifiers and scientific risk models.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <RadioOption
              name="environment"
              id="env-river"
              label="River Basin & Riparian Corridor"
              badge="Primary Environment"
              description="Monitors bank erosion, sediment redistribution, and channel width alterations."
              checked={selectedEnvId === "river"}
              onChange={() => handleEnvChange("river")}
            />
            <RadioOption
              name="environment"
              id="env-landslide"
              label="Slope & Landslide Risk Corridor"
              badge="Secondary Environment"
              description="Monitors slope movement, crown scarps, canopy stripping, and mass displacement."
              checked={selectedEnvId === "landslide"}
              onChange={() => handleEnvChange("landslide")}
            />
          </CardContent>
        </Card>

        {/* Step 2: Location and Coordinates */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-700 text-white text-[11px] font-bold">
                2
              </span>
              <CardTitle>Designated Geographic Area</CardTitle>
            </div>
            <CardDescription>
              Specify the target reach, slope polygon, or operational jurisdiction.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Target Area / Reach Name"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                required
                helperText="Identifier used on human review reports."
              />
              <Input
                label="Bounding Center Coordinates"
                value={coordinates}
                onChange={(e) => setCoordinates(e.target.value)}
                helperText="Latitude, Longitude (WGS 84)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Comparative Imagery Upload (Before & After) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-700 text-white text-[11px] font-bold">
                3
              </span>
              <CardTitle>Comparative Imagery Timestamps (Upload Your Own)</CardTitle>
            </div>
            <CardDescription>
              Provide both baseline (Before) and recent (After) imagery. Supported formats: GeoTIFF, PNG, JPEG.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before Timestamp */}
              <div className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Timestamp T0 (Before)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Baseline</span>
                </div>
                <Input
                  type="date"
                  label="Acquisition Date"
                  value={beforeDate}
                  onChange={(e) => setBeforeDate(e.target.value)}
                  required
                />
                <DropZone
                  label="Before Raster Imagery"
                  selectedFile={beforeFile}
                  onFileSelect={(f) => {
                    setBeforeFile(f);
                    setValidationSuccess(false);
                  }}
                />
              </div>

              {/* After Timestamp */}
              <div className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Timestamp T1 (After)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Recent State</span>
                </div>
                <Input
                  type="date"
                  label="Acquisition Date"
                  value={afterDate}
                  onChange={(e) => setAfterDate(e.target.value)}
                  required
                />
                <DropZone
                  label="After Raster Imagery"
                  selectedFile={afterFile}
                  onFileSelect={(f) => {
                    setAfterFile(f);
                    setValidationSuccess(false);
                  }}
                />
              </div>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-200">
              <strong className="font-semibold text-slate-700">Image Validation Standard:</strong> Files undergo spatial
              co-registration, dimension checking, and radiometric normalization before classification.
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Guided Context Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-700 text-white text-[11px] font-bold">
                4
              </span>
              <CardTitle>Investigation Context & Guided Questions</CardTitle>
            </div>
            <CardDescription>
              Specific to the <strong className="text-slate-800 font-medium">{currentEnv.display_name}</strong> domain.
              Informs AI risk weighting and human review priority.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentEnv.guided_questions.map((q) => (
              <div key={q.id}>
                {q.input_type === "select" && q.options ? (
                  <Select
                    label={q.prompt}
                    required={q.required}
                    helperText={q.helper_text}
                    value={questionAnswers[q.id] || q.options[0]}
                    onChange={(e) =>
                      setQuestionAnswers({ ...questionAnswers, [q.id]: e.target.value })
                    }
                    options={q.options.map((opt) => ({ value: opt, label: opt }))}
                  />
                ) : (
                  <Input
                    label={q.prompt}
                    required={q.required}
                    helperText={q.helper_text}
                    placeholder={q.helper_text}
                    value={questionAnswers[q.id] || ""}
                    onChange={(e) =>
                      setQuestionAnswers({ ...questionAnswers, [q.id]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Validation Feedback */}
        {isSimulatingValidation && (
          <LoadingState
            title="Validating Imagery and Input Constraints..."
            message="Evaluating chronological sequence, format compatibility, and coordinate boundaries."
            steps={[
              { label: "Checking temporal chronological order", isComplete: true },
              { label: "Validating raster resolution & metadata", isActive: true },
              { label: "Verifying domain-specific context questions", isComplete: false },
            ]}
          />
        )}

        {validationSuccess && !isSimulatingValidation && (
          <Alert variant="success" title="Inputs Validated Successfully">
            Imagery metadata and guided investigation parameters conform to scientific standards. Ready to initiate
            change detection pipeline.
          </Alert>
        )}

        {/* Submission Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link href="/">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            type="submit"
            size="lg"
            isLoading={isSimulatingValidation}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {validationSuccess ? "Execute Change Detection Pipeline" : "Validate & Prepare Analysis"}
          </Button>
        </div>
      </form>
    </div>
  );
}
