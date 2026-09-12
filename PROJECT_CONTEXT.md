# Environmental Intelligence Platform

## Product
Environmental Intelligence Platform

## Purpose
AI-assisted environmental change detection and investigation platform.

## Primary users
- Environmental / Disaster Management Officer
- Citizen

## Primary workflow
Upload Your Own → Validate → Analyze → Detect Change → Interpret → Review → Report

## Current implementation status
Phase 1: Complete
Phase 2: Complete
Phase 3: Not started
Phase 4: Not started
Phase 5: Not started
Phase 6: Not started
Phase 7: Not started
Phase 8: Not started
Phase 9: Not started
Phase 10: Not started

## Current tech stack
- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide React, Vitest, Testing Library
- Backend: Python 3.13, FastAPI, Pydantic, Pytest
- Future image-processing: OpenCV / NumPy / Pillow / lightweight CV-ML
- Future map layer: MapLibre GL JS

## Repository structure
- backend/: Python FastAPI application, domain models, environment abstractions, API routes, and tests
- frontend/: Next.js app with dashboard, environment catalog pages, reusable UI, domain types, and tests
- package.json: root task wiring for frontend and backend verification
- README.md: project overview and setup guidance
- PROJECT_CONTEXT.md: handoff and status documentation

## Architecture
- frontend: professional dashboard and UI shell for monitoring and analysis workflows
- backend: API layer exposing environment registry and dashboard summaries
- domain: shared entities for users, areas, images, analyses, detections, review, and citizen reports
- environment registry: modular registry pattern via BaseEnvironment and EnvironmentRegistry for extensible environment definitions
- API: REST endpoints under backend/app/api/v1 for system health, environment catalog, and dashboard operations
- tests: backend pytest suite and frontend Vitest suite covering domain, UI, and dashboard behavior

## Environment support
- River: primary demonstration environment, with geospatial and fluvial risk problem types and guided questions covering basin context, rainfall, seasonal flow, and infrastructure proximity
- Landslide: secondary environment, with slope instability and terrain disturbance problem types and guided questions covering sector name, antecedent rainfall, steepness, and downslope exposure

## Design system
The implementation follows a professional, minimal, evidence-focused aesthetic: light surfaces, dark charcoal typography, restrained accent colors, subtle borders, modest rounded corners, generous whitespace, and clear operational hierarchy. It avoids sci-fi styling, heavy gradients, and decorative noise.

## Current routes
- /: Environmental Overview dashboard
- /new-analysis: analysis intake workflow shell
- /environments: environment registry and domain spec catalog

## Test commands
The commands verified in this repository are:
- Backend: cd backend && .\.venv\Scripts\pytest -v
- Frontend tests: cd frontend && npm run test
- Frontend type check: cd frontend && npm run type-check
- Frontend lint: cd frontend && npm run lint
- Frontend production build: cd frontend && npm run build

## Known limitations
- Phase 3 guided upload workflow is not implemented beyond the intake shell
- No actual OpenCV / image-processing pipeline is active yet
- No AI classification engine or model inference is in place
- No interactive map monitoring layer is implemented
- No human review/report generation workflow beyond the conceptual domain model and UI placeholders
- No citizen reporting workflow beyond the domain scaffolding

## Next phase
Next planned phase: Phase 3 — Guided Analysis & Upload Workflow

## Important development rules
- preserve environment abstraction
- do not hard-code River-specific architecture
- do not fabricate environmental statistics
- do not claim disaster probability from image classification
- use cautious "Potential..." terminology
- preserve human-in-the-loop review
- prefer evidence-backed outputs
- keep UI professional and minimal