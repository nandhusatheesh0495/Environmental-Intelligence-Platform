/**
 * Analysis preparation and processing service.
 *
 * Keeps the workflow input validation in the UI while offloading the actual
 * multitemporal change detection to the backend image-processing pipeline.
 */

import { EnvironmentType } from "@/domain/types";

export interface AnalysisPreparationInput {
  environmentType: EnvironmentType;
  area: {
    name: string;
    district: string;
    stateRegion: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  investigationTypes: string[];
  environmentContext: Record<string, string>;
  beforeImage: File | null;
  beforeDate: string;
  afterImage: File | null;
  afterDate: string;
}

export interface AnalysisProcessingArtifact {
  mask_path?: string;
  overlay_path?: string;
  mask_preview?: string;
}

export interface AnalysisProcessingResult {
  analysis_id: string;
  status: "completed" | "failed";
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  change_percentage: number;
  detected_pixels: number;
  evidence_summary: string;
  explanation: string;
  recommendation: string;
  artifacts?: AnalysisProcessingArtifact;
}

export interface EnvironmentalDetection {
  id: string;
  analysis_id: string;
  environment_type: string;
  problem_type: string;
  confidence: number;
  confidence_label: string;
  investigation_priority: string;
  evidence: string[];
  explanation: string;
  recommendation: string;
  uncertainty_reasons?: string[];
}

export interface EnvironmentalInterpretationResult {
  analysis_id: string;
  environment_type: string;
  status: "completed" | "failed";
  detections: EnvironmentalDetection[];
  warnings: string[];
  limitations: string[];
}

export interface AnalysisPreparationResult {
  success: boolean;
  message: string;
  details?: AnalysisProcessingResult;
  interpretation?: EnvironmentalInterpretationResult;
}

export async function prepareAnalysis(input: AnalysisPreparationInput): Promise<AnalysisPreparationResult> {
  if (!input.environmentType || !input.area.name || !input.beforeImage || !input.afterImage) {
    throw new Error("Missing required analysis inputs.");
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
  const formData = new FormData();
  formData.append("before_image", input.beforeImage);
  formData.append("after_image", input.afterImage);

  const response = await fetch(`${apiBaseUrl}/api/v1/analysis/process`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail ?? "Image processing request failed.");
  }

  const data = (await response.json()) as AnalysisProcessingResult;

  const interpretationResponse = await fetch(`${apiBaseUrl}/api/v1/analysis/interpret`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      analysis_id: data.analysis_id,
      environment_type: input.environmentType,
      change_result: data,
      context: input.environmentContext,
    }),
  });

  const interpretation = interpretationResponse.ok
    ? ((await interpretationResponse.json()) as EnvironmentalInterpretationResult)
    : undefined;

  return {
    success: true,
    message: data.evidence_summary || "Analysis preparation complete. Image processing completed successfully.",
    details: data,
    interpretation,
  };
}
