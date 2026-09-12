/**
 * Analysis preparation service.
 *
 * This keeps the UI layer focused on input validation and workflow flow while
 * maintaining a typed boundary for the future Phase 4 image-processing pipeline.
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

export interface AnalysisPreparationResult {
  success: boolean;
  message: string;
}

export async function prepareAnalysis(input: AnalysisPreparationInput): Promise<AnalysisPreparationResult> {
  if (!input.environmentType || !input.area.name || !input.beforeImage || !input.afterImage) {
    throw new Error("Missing required analysis inputs.");
  }

  return {
    success: true,
    message: "Analysis preparation complete. Image processing will begin in the next stage.",
  };
}
