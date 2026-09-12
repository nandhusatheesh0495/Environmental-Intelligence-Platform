# Environmental Intelligence Platform

## Product
Environmental Intelligence Platform

## Purpose
Professional environmental intelligence web application for environmental/disaster-management officers and citizens, focused on image-based change detection, human review, and evidence-backed reporting.

## Primary users
- Environmental / Disaster Management Officer
- Citizen Reporter

## Primary workflow
Select Environment → Select Location → Guided Investigation Questions → Upload Before + After → Validate → Analyze → Detect Change → Identify Potential Problems → Show Confidence + Evidence → Monitoring Map → Human Review → Generate Area Report

## Current implementation status
Phase 1: Complete
Phase 2: Complete
Phase 3: Complete
Phase 4: Complete
Phase 5: Complete
Phase 6: Complete
Phase 7: Complete — human review, report generation, and evidence-backed analysis workflows are implemented and validated
Phase 8: Complete — citizen reporting workflow is implemented with validation, image handling, officer review, and status transitions
Phase 9: Complete — deterministic demo dataset, seed workflow, demo UX, and reliability edge-case hardening are in place
Phase 10: Complete — final integration, QA, demo polish, and hackathon-readiness checks are complete
Phases 1–10: Complete

## Current tech stack
- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide React, Vitest, Testing Library
- Backend: Python 3.13, FastAPI, Pydantic, Pytest
- Map layer: MapLibre GL JS for monitoring-map context and feature display
- Demo dataset: deterministic in-memory seeded fixtures and root-level demo generation
- AI/image-processing architecture: modular analysis pipeline with environment-specific interpretation and evidence-first output language

## Repository structure
- backend/: Python FastAPI application, domain models, environment abstractions, API routes, services, and tests
- frontend/: Next.js app with dashboard, analysis workflow, monitoring map, citizen reporting, reusable UI, domain types, and tests
- demo/: curated demo dataset and helper assets
- package.json: root orchestration for frontend/backend verification
- README.md: system overview and run/test instructions
- PROJECT_CONTEXT.md: final handoff and status documentation
- DEMO_SCRIPT.md: concise hackathon demo flow

## Architecture
- frontend: professional dashboard and UI shell for monitoring, review, reporting, and environment workflows
- backend: API layer exposing environment registry, map features, dashboard summaries, analysis data, and citizen reports
- domain: shared entities for users, areas, images, analyses, detections, review, reports, and citizen reports
- environment registry: modular registry pattern via BaseEnvironment and EnvironmentRegistry for extensible environment definitions
- API: REST endpoints under backend/app/api/v1 for system health, dashboard, environments, map features, analysis, citizen reporting, and reports
- storage: local filesystem storage for uploaded images and in-memory seeded demo fixtures for MVP reliability
- tests: backend pytest suite and frontend Vitest suite covering domain, UI, integration, and regression behavior

## Environment support
- River: primary workflow environment with riverbank and water-body change detections, guidance, and demo fixtures
- Landslide: secondary workflow environment with slope and terrain instability interpretations and guidance
- Architecture remains environment-agnostic: shared registry, environment-specific questions, detection rules, and recommendations remain separate from core platform logic

## Design system
The implementation uses a professional, minimal, evidence-focused aesthetic with light surfaces, dark charcoal text, restrained accent colors, subtle borders, modest rounded corners, generous whitespace, and clear operational hierarchy. It does not claim scientific certainty beyond the actual confidence language and review flow.

## Current routes
- /: Environmental Overview dashboard
- /new-analysis: guided upload-and-analysis workflow for River or Landslide imagery
- /environments: environment registry and domain spec catalog
- /analysis/[analysisId]: change-detection detail page, evidence panel, review controls, and report generation
- /monitoring-map: monitoring map with environment filters, priority filters, feature detail side panel, and layered evidence display
- /citizen-report: citizen observation submission form with validation and image upload
- /citizen-reports: officer-facing list of submitted citizen reports
- /citizen-reports/[reportId]: detailed citizen report review page with status transitions

## Phase-by-phase completion summary
- Phase 1–3: foundation, environment registry, and guided analysis flow
- Phase 4: image-processing and compare-analysis pipeline
- Phase 5: detection interpretation, confidence, and evidence generation
- Phase 6: monitoring map and safe feature-layer display
- Phase 7: human review, report generation, and evidence-backed analysis workflows
- Phase 8: citizen reporting workflow and officer review workflow
- Phase 9: deterministic demo dataset, seed workflow, demo UX, and reliability hardening
- Phase 10: final integration, QA sweep, navigation cleanup, docs, and hackathon polish

## Demo dataset and reliability
- Deterministic demo assets are generated under the root-level demo/ area and are explicitly labeled as synthetic fixtures.
- The demo workflow is secondary to the primary upload-your-own path and is not presented as live hazard data.
- Empty states, partial-data handling, error states, and review flows remain honest and operationally credible.
- The platform distinguishes demo fixtures from actual user-created data and avoids fabricated statistics.

## Test commands
The commands verified in this repository are:
- Backend: cd backend && .\.venv\Scripts\pytest -q
- Demo seed: cd backend && .\.venv\Scripts\python -m app.seed_demo
- Frontend tests: cd frontend && npm run test -- --run --reporter=basic
- Frontend type check: cd frontend && npm run type-check
- Frontend lint: cd frontend && npm run lint
- Frontend production build: cd frontend && npm run build

## Verified results
- Frontend tests: 49 passed
- Backend tests: 32 passed
- TypeScript: clean
- Frontend lint: successful with warnings only for image optimization and hook dependency suggestions
- Production build: successful

## Known limitations
- No live AI model inference or production-grade environmental classification pipeline is active yet.
- Demo map features remain explicit and synthetic; they do not imply real-time field conditions.
- This is an MVP for a hackathon or guided demo, not a production-grade environmental monitoring system.

## Final MVP status
Ready for a 3–5 minute hackathon demonstration. The application remains evidence-first, intentionally cautious, and operationally credible.

## Important development rules
- preserve environment abstraction
- do not hard-code River-specific architecture
- do not fabricate environmental statistics
- do not claim disaster probability from image classification
- use cautious "Potential..." and "AI Confidence" language
- preserve human-in-the-loop review
- prefer evidence-backed outputs
- keep UI professional and minimal
- keep demo content distinct from operational data
- do not add production infrastructure beyond the MVP scope