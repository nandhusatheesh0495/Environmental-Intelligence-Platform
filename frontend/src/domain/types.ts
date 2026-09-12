/**
 * Core domain types for the Environmental Intelligence Platform.
 * 
 * Strict standard:
 * - AI Confidence represents detection certainty (0 to 1), NOT probability of disaster.
 * - Detection labels employ caution terminology (e.g. "Potential Riverbank Erosion").
 */

export type UserRole = "officer" | "citizen" | "admin";

export type EnvironmentType =
  | "river"
  | "landslide"
  | "forest"
  | "coastline"
  | "wetland"
  | "agriculture"
  | "wildfire"
  | "unknown";

export type ImageType = "before" | "after";

export type AnalysisStatus =
  | "draft"
  | "validating"
  | "ready"
  | "processing"
  | "completed"
  | "failed"
  | "reviewed";

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export type ReportStatus =
  | "new"
  | "submitted"
  | "under_review"
  | "reviewed"
  | "resolved"
  | "rejected"
  | "validated"
  | "dismissed";

export type ReviewDecision = "confirmed" | "rejected" | "inconclusive";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  department?: string;
}

export interface Area {
  id: string;
  name: string;
  environment_type: EnvironmentType;
  coordinates?: Record<string, unknown>;
  description?: string;
}

export interface ImageMetadata {
  width?: number;
  height?: number;
  resolution_meters_per_pixel?: number;
  cloud_cover_percentage?: number;
  file_format?: string;
  sensor?: string;
}

export interface ImageRecord {
  id: string;
  area_id: string;
  image_type: ImageType;
  date: string;
  file_path: string;
  source: string;
  metadata?: ImageMetadata;
}

export interface Detection {
  id: string;
  analysis_id: string;
  problem_type: string;
  severity: SeverityLevel;
  confidence: number; // 0.0 to 1.0 (AI classification certainty)
  change_percentage?: number;
  geometry?: Record<string, unknown>;
  evidence_summary: string;
  explanation: string;
  recommendation: string;
}

export interface Analysis {
  id: string;
  area_id: string;
  environment_type: EnvironmentType;
  before_image_id: string;
  after_image_id: string;
  created_at: string;
  status: AnalysisStatus;
  investigation_notes?: string;
  detections: Detection[];
}

export interface Review {
  id: string;
  detection_id: string;
  reviewer_id: string;
  decision: ReviewDecision;
  comment: string;
  created_at: string;
}

export interface CitizenReport {
  id: string;
  environment_type: EnvironmentType;
  location: string;
  description: string;
  image_path?: string;
  latitude?: number;
  longitude?: number;
  observation_date?: string;
  status: ReportStatus;
  created_at: string;
  submitted_at?: string;
  reporter_name?: string;
  reporter_contact?: string;
}

export interface ProblemTypeDefinition {
  problem_type_id: string;
  display_name: string;
  description: string;
  default_severity: SeverityLevel;
  recommended_action: string;
}

export interface GuidedQuestion {
  id: string;
  prompt: string;
  input_type: "text" | "select" | "boolean" | "number";
  options?: string[];
  required?: boolean;
  helper_text?: string;
}

export interface ValidationRule {
  key: string;
  description: string;
  rule_type: "dimension_ratio" | "file_type" | "max_cloud_cover" | "date_order";
  threshold?: number;
  allowed_values?: string[];
}

export interface EnvironmentDefinition {
  environment_id: EnvironmentType;
  display_name: string;
  description: string;
  is_primary: boolean;
  supported_problem_types: ProblemTypeDefinition[];
  guided_questions: GuidedQuestion[];
  validation_rules: ValidationRule[];
}
