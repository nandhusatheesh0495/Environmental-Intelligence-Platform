import { describe, it, expect } from "vitest";
import {
  RIVER_ENVIRONMENT,
  LANDSLIDE_ENVIRONMENT,
  REGISTERED_ENVIRONMENTS,
  getEnvironment,
} from "@/domain/environments";

describe("Environment Abstraction & Registry", () => {
  it("establishes River as the primary demonstration environment", () => {
    expect(RIVER_ENVIRONMENT.is_primary).toBe(true);
    expect(RIVER_ENVIRONMENT.environment_id).toBe("river");
    expect(RIVER_ENVIRONMENT.display_name).toContain("River");
  });

  it("includes all required River detection types", () => {
    const ptIds = RIVER_ENVIRONMENT.supported_problem_types.map(
      (pt) => pt.problem_type_id
    );
    expect(ptIds).toContain("potential_riverbank_erosion");
    expect(ptIds).toContain("significant_water_area_change");
    expect(ptIds).toContain("exposed_riverbed");
    expect(ptIds).toContain("potential_sediment_related_change");
    expect(ptIds).toContain("riverbank_movement");
    expect(ptIds).toContain("significant_water_body_change");
  });

  it("establishes Landslide as the secondary demonstration environment", () => {
    expect(LANDSLIDE_ENVIRONMENT.is_primary).toBe(false);
    expect(LANDSLIDE_ENVIRONMENT.environment_id).toBe("landslide");
    expect(LANDSLIDE_ENVIRONMENT.display_name).toContain("Landslide");
  });

  it("includes all required Landslide detection types", () => {
    const ptIds = LANDSLIDE_ENVIRONMENT.supported_problem_types.map(
      (pt) => pt.problem_type_id
    );
    expect(ptIds).toContain("potential_landslide_related_change");
    expect(ptIds).toContain("terrain_disturbance");
    expect(ptIds).toContain("vegetation_loss");
    expect(ptIds).toContain("exposed_ground");
  });

  it("strictly enforces cautious terminology across all environments", () => {
    for (const env of REGISTERED_ENVIRONMENTS) {
      for (const pt of env.supported_problem_types) {
        // Must not assert disaster certainty
        expect(pt.display_name.toLowerCase()).not.toContain("definitely");
        expect(pt.display_name.toLowerCase()).not.toContain("guaranteed");
      }
    }
  });

  it("retrieves environments via getEnvironment lookup", () => {
    expect(getEnvironment("river")).toBeDefined();
    expect(getEnvironment("river")?.is_primary).toBe(true);
    expect(getEnvironment("landslide")).toBeDefined();
    expect(getEnvironment("nonexistent")).toBeUndefined();
  });
});
