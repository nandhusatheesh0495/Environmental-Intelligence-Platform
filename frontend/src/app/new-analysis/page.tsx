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
  ShieldCheck,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RadioOption } from "@/components/ui/radio";
import { Checkbox } from "@/components/ui/checkbox";
import { DropZone } from "@/components/ui/dropzone";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/common/page-header";
import { REGISTERED_ENVIRONMENTS } from "@/domain/environments";
import { EnvironmentType } from "@/domain/types";
import { prepareAnalysis, type AnalysisPreparationInput, type AnalysisProcessingResult } from "@/services/analysis-prep";

const STEP_KEYS = ["environment", "location", "investigation", "imagery", "review"] as const;
type StepKey = (typeof STEP_KEYS)[number];
type ValidationErrors = Partial<Record<string, string>>;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getPreviewUrl = (file: File) => {
  const urlFactory = typeof window !== "undefined" ? window.URL : typeof URL !== "undefined" ? URL : null;
  if (!urlFactory || typeof urlFactory.createObjectURL !== "function") {
    return "";
  }
  return urlFactory.createObjectURL(file);
};

const readImageDimensions = (file: File): Promise<{ width: number; height: number } | null> =>
  new Promise((resolve) => {
    const objectUrl = getPreviewUrl(file);
    if (!objectUrl) {
      resolve(null);
      return;
    }

    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };

    img.src = objectUrl;
  });

export default function NewAnalysisPage() {
  const searchParams = React.useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return new URLSearchParams(window.location.search);
  }, []);

  const [selectedEnvId, setSelectedEnvId] = React.useState<EnvironmentType>("river");
  const [currentStep, setCurrentStep] = React.useState<StepKey>("environment");
  const [areaName, setAreaName] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [stateRegion, setStateRegion] = React.useState("");
  const [country, setCountry] = React.useState("India");
  const [latitude, setLatitude] = React.useState("");
  const [longitude, setLongitude] = React.useState("");
  const [beforeDate, setBeforeDate] = React.useState("");
  const [afterDate, setAfterDate] = React.useState("");
  const [beforeFile, setBeforeFile] = React.useState<File | null>(null);
  const [afterFile, setAfterFile] = React.useState<File | null>(null);
  const [investigationTypes, setInvestigationTypes] = React.useState<string[]>([]);
  const [contextAnswers, setContextAnswers] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [imageMetadata, setImageMetadata] = React.useState<{ before: { width?: number; height?: number }; after: { width?: number; height?: number } }>({ before: {}, after: {} });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitState, setSubmitState] = React.useState<{ type: "idle" | "success" | "error"; message: string } | null>(null);
  const [processingResult, setProcessingResult] = React.useState<AnalysisProcessingResult | null>(null);

  const currentStepIndex = STEP_KEYS.indexOf(currentStep);
  const currentEnv = REGISTERED_ENVIRONMENTS.find((env) => env.environment_id === selectedEnvId) ?? REGISTERED_ENVIRONMENTS[0];

  React.useEffect(() => {
    const envFromQuery = searchParams?.get("env") as EnvironmentType | null;
    if (envFromQuery && REGISTERED_ENVIRONMENTS.some((env) => env.environment_id === envFromQuery)) {
      setSelectedEnvId(envFromQuery);
    }
  }, [searchParams]);

  const updateError = (field: string, message?: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (message) {
        next[field] = message;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const clearStepErrors = () => setErrors({});

  const handleEnvironmentChange = (id: EnvironmentType) => {
    setSelectedEnvId(id);
    setInvestigationTypes([]);
    setContextAnswers({});
    clearStepErrors();
    setSubmitState(null);
  };

  const toggleInvestigationType = (problemTypeId: string) => {
    setInvestigationTypes((prev) =>
      prev.includes(problemTypeId)
        ? prev.filter((id) => id !== problemTypeId)
        : [...prev, problemTypeId]
    );
    updateError("investigationTypes");
  };

  const handleFileSelect = async (imageType: "before" | "after", file: File | null) => {
    if (!file) {
      if (imageType === "before") {
        setBeforeFile(null);
        updateError("beforeFile");
      } else {
        setAfterFile(null);
        updateError("afterFile");
      }
      return;
    }

    const accepted = ["image/jpeg", "image/png", "image/webp"];
    const isAllowedType = accepted.includes(file.type.toLowerCase()) || [".jpg", ".jpeg", ".png", ".webp"].includes(file.name.split(".").pop()?.toLowerCase() ?? "");
    const fileSizeOk = file.size <= 25 * 1024 * 1024;
    if (!isAllowedType) {
      if (imageType === "before") {
        setBeforeFile(null);
      } else {
        setAfterFile(null);
      }
      updateError(imageType === "before" ? "beforeFile" : "afterFile", "Unsupported image format. Use JPEG, PNG, or WebP.");
      return;
    }
    if (!fileSizeOk) {
      if (imageType === "before") {
        setBeforeFile(null);
      } else {
        setAfterFile(null);
      }
      updateError(imageType === "before" ? "beforeFile" : "afterFile", "Image exceeds the 25MB limit.");
      return;
    }

    if (imageType === "before") {
      setBeforeFile(file);
      updateError("beforeFile");
    } else {
      setAfterFile(file);
      updateError("afterFile");
    }

    const dimensions = await readImageDimensions(file);
    setImageMetadata((prev) => ({ ...prev, [imageType]: dimensions ?? {} }));

    if (dimensions && (dimensions.width < 64 || dimensions.height < 64)) {
      updateError(imageType === "before" ? "beforeFile" : "afterFile", "Image resolution is too low for reliable comparison.");
    }
  };

  const validateEnvironmentStep = () => {
    if (!selectedEnvId) {
      updateError("environment", "Environment selection is required.");
      return false;
    }
    updateError("environment");
    return true;
  };

  const validateLocationStep = () => {
    const nextErrors: ValidationErrors = {};

    if (!areaName.trim()) nextErrors.areaName = "Area name is required.";
    if (!district.trim()) nextErrors.district = "District is required.";
    if (!stateRegion.trim()) nextErrors.stateRegion = "State or region is required.";
    if (!country.trim()) nextErrors.country = "Country is required.";

    if (latitude && (Number.isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90)) {
      nextErrors.latitude = "Latitude must be between -90 and 90.";
    }
    if (longitude && (Number.isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180)) {
      nextErrors.longitude = "Longitude must be between -180 and 180.";
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateInvestigationStep = () => {
    const nextErrors: ValidationErrors = {};

    if (investigationTypes.length === 0) {
      nextErrors.investigationTypes = "Select at least one investigation type.";
    }

    currentEnv.guided_questions.forEach((question) => {
      if (question.required && !String(contextAnswers[question.id] ?? "").trim()) {
        nextErrors[question.id] = `${question.prompt} is required.`;
      }
    });

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateImageryStep = () => {
    const nextErrors: ValidationErrors = {};

    if (!beforeFile) nextErrors.beforeFile = "Before image is required.";
    if (!afterFile) nextErrors.afterFile = "After image is required.";
    if (!beforeDate) nextErrors.beforeDate = "Please select a date for the before image.";
    if (!afterDate) nextErrors.afterDate = "Please select a date for the after image.";
    if (beforeDate && afterDate && new Date(afterDate) <= new Date(beforeDate)) {
      nextErrors.dateOrder = "After date must be later than Before date.";
    }

    if (beforeFile && afterFile && imageMetadata.before.width && imageMetadata.after.width) {
      const beforeAspect = imageMetadata.before.width / (imageMetadata.before.height || 1);
      const afterAspect = imageMetadata.after.width / (imageMetadata.after.height || 1);
      const ratioDelta = Math.abs(beforeAspect - afterAspect);
      if (ratioDelta > 0.35) {
        nextErrors.comparability = "Images have different aspect ratios. Additional alignment may be required.";
      }
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateAll = () => {
    const validEnvironment = validateEnvironmentStep();
    const validLocation = validateLocationStep();
    const validInvestigation = validateInvestigationStep();
    const validImagery = validateImageryStep();
    return validEnvironment && validLocation && validInvestigation && validImagery;
  };

  const handleNext = () => {
    if (currentStep === "environment" && validateEnvironmentStep()) {
      setCurrentStep("location");
      return;
    }
    if (currentStep === "location" && validateLocationStep()) {
      setCurrentStep("investigation");
      return;
    }
    if (currentStep === "investigation" && validateInvestigationStep()) {
      setCurrentStep("imagery");
      return;
    }
    if (currentStep === "imagery" && validateImageryStep()) {
      setCurrentStep("review");
      return;
    }
  };

  const handleBack = () => {
    if (currentStep === "review") {
      setCurrentStep("imagery");
      return;
    }
    if (currentStep === "imagery") {
      setCurrentStep("investigation");
      return;
    }
    if (currentStep === "investigation") {
      setCurrentStep("location");
      return;
    }
    if (currentStep === "location") {
      setCurrentStep("environment");
    }
  };

  const handlePrepareAnalysis = async () => {
    if (!validateAll()) {
      setSubmitState({ type: "error", message: "Please resolve the highlighted fields before continuing." });
      return;
    }

    setIsSubmitting(true);
    setSubmitState(null);

    try {
      const payload: AnalysisPreparationInput = {
        environmentType: selectedEnvId,
        area: {
          name: areaName,
          district,
          stateRegion,
          country,
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
        },
        investigationTypes,
        environmentContext: contextAnswers,
        beforeImage: beforeFile,
        beforeDate,
        afterImage: afterFile,
        afterDate,
      };

      const result = await prepareAnalysis(payload);
      setProcessingResult(result.details ?? null);
      setSubmitState({
        type: "success",
        message: result.message,
      });
    } catch (error) {
      setProcessingResult(null);
      setSubmitState({
        type: "error",
        message: error instanceof Error ? error.message : "We couldn't prepare this analysis. Your inputs are still available. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepMeta = [
    { key: "environment", label: "Environment", description: "Select domain" },
    { key: "location", label: "Location", description: "Area details" },
    { key: "investigation", label: "Investigation", description: "Context + types" },
    { key: "imagery", label: "Imagery", description: "Before / after" },
    { key: "review", label: "Review", description: "Confirm inputs" },
  ] as const;

  const beforePreviewUrl = beforeFile ? getPreviewUrl(beforeFile) : "";
  const afterPreviewUrl = afterFile ? getPreviewUrl(afterFile) : "";
  const selectedProblemTypes = currentEnv.supported_problem_types.filter((problem) => investigationTypes.includes(problem.problem_type_id));

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      <PageHeader
        title="New Environmental Analysis"
        description="Compare imagery from two dates to investigate environmental change."
        actions={
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Button>
          </Link>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Progress</p>
            <h2 className="text-sm font-semibold text-slate-900">Analysis preparation workflow</h2>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {currentStepIndex + 1} / {STEP_KEYS.length}
          </span>
        </div>
        <div className="grid gap-2 md:grid-cols-5">
          {stepMeta.map((step, index) => {
            const isActive = currentStep === step.key;
            const isComplete = STEP_KEYS.indexOf(currentStep) > index;
            return (
              <div
                key={step.key}
                className={[
                  "rounded-lg border px-3 py-2 text-left transition-colors",
                  isActive ? "border-accent-700 bg-accent-50/40" : "border-slate-200 bg-slate-50",
                  isComplete && !isActive ? "border-emerald-200 bg-emerald-50" : "",
                ].join(" ")}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className={[
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white",
                    isActive || isComplete ? "bg-accent-700" : "bg-slate-300",
                  ].join(" ")}>{index + 1}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700">{step.label}</span>
                </div>
                <p className="text-[11px] text-slate-500">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {submitState && (
        <Alert variant={submitState.type === "error" ? "error" : "success"} title={submitState.type === "error" ? "Preparation issue" : "Analysis prepared"}>
          {submitState.message}
        </Alert>
      )}

      {processingResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] font-bold">✓</span>
              <CardTitle>Visual change summary</CardTitle>
            </div>
            <CardDescription>Results from the generic image-processing pipeline. This stays at the visual-change level and does not assign a final environmental diagnosis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Change</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{processingResult.change_percentage.toFixed(2)}%</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Detected pixels</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{processingResult.detected_pixels.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Severity</p>
                <p className="mt-2 text-xl font-semibold capitalize text-slate-900">{processingResult.severity}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Confidence</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{(processingResult.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">Evidence summary</p>
                <p className="mt-2 text-sm text-slate-700">{processingResult.evidence_summary}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">Recommended review</p>
                <p className="mt-2 text-sm text-slate-700">{processingResult.recommendation}</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Explanation</p>
              <p className="mt-2">{processingResult.explanation}</p>
            </div>

            {processingResult.artifacts?.mask_preview && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-700">Change mask preview</p>
                <img src={processingResult.artifacts.mask_preview} alt="Detected change mask preview" className="h-48 w-full rounded border border-slate-200 bg-white object-contain" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === "environment" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-700 text-white text-[11px] font-bold">1</span>
              <CardTitle>Select environment</CardTitle>
            </div>
            <CardDescription>Choose the domain to guide the investigation context and problem types.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {REGISTERED_ENVIRONMENTS.map((env) => {
              const Icon = env.environment_id === "river" ? Waves : MountainSnow;
              return (
                <RadioOption
                  key={env.environment_id}
                  name="environment"
                  id={`env-${env.environment_id}`}
                  label={env.display_name}
                  badge={env.is_primary ? "Primary" : "Secondary"}
                  description={env.description}
                  checked={selectedEnvId === env.environment_id}
                  onChange={() => handleEnvironmentChange(env.environment_id)}
                />
              );
            })}
            {errors.environment && <p className="text-xs text-red-600 font-medium">{errors.environment}</p>}
          </CardContent>
        </Card>
      )}

      {currentStep === "location" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-700 text-white text-[11px] font-bold">2</span>
              <CardTitle>Location and site details</CardTitle>
            </div>
            <CardDescription>Provide the monitored area and geographic context for the investigation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Area / Site Name" value={areaName} onChange={(e) => { setAreaName(e.target.value); updateError("areaName"); }} required error={errors.areaName} helperText="Name of the river reach, slope sector, or monitored site." />
              <Input label="District" value={district} onChange={(e) => { setDistrict(e.target.value); updateError("district"); }} required error={errors.district} helperText="Operational district or administrative unit." />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="State / Region" value={stateRegion} onChange={(e) => { setStateRegion(e.target.value); updateError("stateRegion"); }} required error={errors.stateRegion} helperText="State, province, or region." />
              <Input label="Country" value={country} onChange={(e) => { setCountry(e.target.value); updateError("country"); }} required error={errors.country} helperText="Country of the monitored area." />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Latitude" type="number" value={latitude} onChange={(e) => { setLatitude(e.target.value); updateError("latitude"); }} step="any" error={errors.latitude} helperText="Latitude between -90 and 90." />
              <Input label="Longitude" type="number" value={longitude} onChange={(e) => { setLongitude(e.target.value); updateError("longitude"); }} step="any" error={errors.longitude} helperText="Longitude between -180 and 180." />
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
              <MapPin className="mr-1 inline h-3.5 w-3.5" />
              Map location selection will be available in the Monitoring Map phase. Coordinates can be recorded here for analysis preparation.
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "investigation" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-700 text-white text-[11px] font-bold">3</span>
              <CardTitle>Investigation context</CardTitle>
            </div>
            <CardDescription>Provide the environment-specific conditions and select the relevant investigation types.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                Investigation types
              </div>
              {currentEnv.supported_problem_types.map((problemType) => (
                <Checkbox
                  key={problemType.problem_type_id}
                  label={problemType.display_name}
                  description={problemType.description}
                  checked={investigationTypes.includes(problemType.problem_type_id)}
                  onChange={() => toggleInvestigationType(problemType.problem_type_id)}
                />
              ))}
              {errors.investigationTypes && <p className="text-xs text-red-600 font-medium">{errors.investigationTypes}</p>}
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                Environment-specific questions
              </div>
              {currentEnv.guided_questions.map((question) => (
                <div key={question.id}>
                  {question.input_type === "select" && question.options ? (
                    <Select
                      label={question.prompt}
                      value={contextAnswers[question.id] ?? question.options[0]}
                      onChange={(event) => {
                        setContextAnswers((prev) => ({ ...prev, [question.id]: event.target.value }));
                        updateError(question.id);
                      }}
                      options={question.options.map((option) => ({ value: option, label: option }))}
                      required={question.required}
                      helperText={question.helper_text}
                      error={errors[question.id]}
                    />
                  ) : (
                    <Input
                      label={question.prompt}
                      value={contextAnswers[question.id] ?? ""}
                      onChange={(event) => {
                        setContextAnswers((prev) => ({ ...prev, [question.id]: event.target.value }));
                        updateError(question.id);
                      }}
                      required={question.required}
                      helperText={question.helper_text}
                      error={errors[question.id]}
                      placeholder={question.helper_text}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "imagery" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-700 text-white text-[11px] font-bold">4</span>
              <CardTitle>Before and after imagery</CardTitle>
            </div>
            <CardDescription>Upload the two temporal observations that will be prepared for the next image-processing stage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Before</span>
                  <span className="text-[10px] text-slate-500 font-mono">T0</span>
                </div>
                <Input
                  label="Before Date"
                  type="date"
                  value={beforeDate}
                  onChange={(event) => {
                    setBeforeDate(event.target.value);
                    updateError("beforeDate");
                    updateError("dateOrder");
                  }}
                  error={errors.beforeDate || errors.dateOrder}
                />
                <DropZone
                  label="Before Image"
                  selectedFile={beforeFile}
                  onFileSelect={(file) => void handleFileSelect("before", file)}
                  error={errors.beforeFile}
                />
                {beforeFile && beforeFile.size > 0 && (
                  <div className="rounded border border-slate-200 bg-white p-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2"><FileCheck className="h-3.5 w-3.5 text-emerald-600" /> {beforeFile.name}</div>
                    <div className="mt-1">{formatFileSize(beforeFile.size)} · {imageMetadata.before.width ? `${imageMetadata.before.width} × ${imageMetadata.before.height}` : "metadata pending"}</div>
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">After</span>
                  <span className="text-[10px] text-slate-500 font-mono">T1</span>
                </div>
                <Input
                  label="After Date"
                  type="date"
                  value={afterDate}
                  onChange={(event) => {
                    setAfterDate(event.target.value);
                    updateError("afterDate");
                    updateError("dateOrder");
                  }}
                  error={errors.afterDate || errors.dateOrder}
                />
                <DropZone
                  label="After Image"
                  selectedFile={afterFile}
                  onFileSelect={(file) => void handleFileSelect("after", file)}
                  error={errors.afterFile}
                />
                {afterFile && afterFile.size > 0 && (
                  <div className="rounded border border-slate-200 bg-white p-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2"><FileCheck className="h-3.5 w-3.5 text-emerald-600" /> {afterFile.name}</div>
                    <div className="mt-1">{formatFileSize(afterFile.size)} · {imageMetadata.after.width ? `${imageMetadata.after.width} × ${imageMetadata.after.height}` : "metadata pending"}</div>
                  </div>
                )}
              </div>
            </div>

            {errors.comparability && (
              <Alert variant="warning" title="Comparison warning">
                {errors.comparability}
              </Alert>
            )}

            <div className="rounded border border-slate-200 bg-white p-3 text-[11px] text-slate-600">
              <Calendar className="mr-1 inline h-3.5 w-3.5" />
              Basic validation only. The platform checks file integrity, chronology, and image suitability before handing the pair to the next processing stage.
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "review" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-700 text-white text-[11px] font-bold">5</span>
              <CardTitle>Review analysis preparation</CardTitle>
            </div>
            <CardDescription>Confirm the inputs before handing the pair to the next processing stage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700"><ShieldCheck className="h-3.5 w-3.5" /> Environment</div>
                <p className="text-sm font-semibold text-slate-900">{currentEnv.display_name}</p>
                <div className="space-y-1 text-xs text-slate-600">
                  <p><span className="font-medium text-slate-700">Area:</span> {areaName || "Not provided"}</p>
                  <p><span className="font-medium text-slate-700">District:</span> {district || "Not provided"}</p>
                  <p><span className="font-medium text-slate-700">State:</span> {stateRegion || "Not provided"}</p>
                  <p><span className="font-medium text-slate-700">Country:</span> {country || "Not provided"}</p>
                  <p><span className="font-medium text-slate-700">Coordinates:</span> {latitude && longitude ? `${latitude}, ${longitude}` : "Not provided"}</p>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700"><AlertTriangle className="h-3.5 w-3.5" /> Investigation</div>
                <div className="space-y-2 text-xs text-slate-600">
                  {selectedProblemTypes.length > 0 ? selectedProblemTypes.map((problemType) => (
                    <p key={problemType.problem_type_id} className="rounded border border-slate-200 bg-white px-2 py-1.5">{problemType.display_name}</p>
                  )) : <p>No investigation types selected.</p>}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700"><HelpCircle className="h-3.5 w-3.5" /> Context</div>
              <div className="grid gap-3 md:grid-cols-2 text-xs text-slate-600">
                {currentEnv.guided_questions.map((question) => (
                  <div key={question.id} className="rounded border border-slate-200 bg-white px-2.5 py-2">
                    <p className="font-medium text-slate-800">{question.prompt}</p>
                    <p className="mt-1">{contextAnswers[question.id] || "Not provided"}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700"><ImageIcon className="h-3.5 w-3.5" /> Before image</div>
                {beforeFile ? (
                  <div className="space-y-2">
                    {beforePreviewUrl ? (
                      <img src={beforePreviewUrl} alt="Before image preview" className="h-48 w-full rounded object-cover border border-slate-200 bg-white" />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center rounded border border-slate-200 bg-white text-[11px] text-slate-500">
                        Preview unavailable in this environment
                      </div>
                    )}
                    <p className="text-xs text-slate-600">{beforeFile.name} · {formatFileSize(beforeFile.size)}</p>
                    <p className="text-xs text-slate-600">Captured: {beforeDate || "Not provided"}</p>
                  </div>
                ) : <p className="text-xs text-slate-500">No before image selected.</p>}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700"><ImageIcon className="h-3.5 w-3.5" /> After image</div>
                {afterFile ? (
                  <div className="space-y-2">
                    {afterPreviewUrl ? (
                      <img src={afterPreviewUrl} alt="After image preview" className="h-48 w-full rounded object-cover border border-slate-200 bg-white" />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center rounded border border-slate-200 bg-white text-[11px] text-slate-500">
                        Preview unavailable in this environment
                      </div>
                    )}
                    <p className="text-xs text-slate-600">{afterFile.name} · {formatFileSize(afterFile.size)}</p>
                    <p className="text-xs text-slate-600">Captured: {afterDate || "Not provided"}</p>
                  </div>
                ) : <p className="text-xs text-slate-500">No after image selected.</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-[11px] text-slate-500">
          {currentStep !== "environment" ? "Progress saved locally within this analysis" : "Complete each step to prepare the comparison"}
        </div>
        <div className="flex items-center gap-2">
          {currentStep !== "environment" && (
            <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
          )}
          {currentStep !== "review" ? (
            <Button type="button" onClick={handleNext}>
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={handlePrepareAnalysis} isLoading={isSubmitting}>
              <Play className="mr-2 h-4 w-4" />
              Analyze Area
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
