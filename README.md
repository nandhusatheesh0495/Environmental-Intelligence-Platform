# Environmental Intelligence Platform

> AI-powered environmental change detection and monitoring platform for environmental and disaster-management officers, with a citizen observation workflow and human-in-the-loop review.

## 1. Product purpose
The platform compares environmental imagery over time, identifies meaningful surface alterations, surfaces potential environmental issues, presents evidence and confidence, and supports human officers in investigation and reporting.

It is designed to be honest about the current MVP scope:
- it supports evidence-based review and interpretation
- it does not claim scientifically validated disaster prediction
- it separates AI-assisted classification from human confirmation
- it keeps demo data clearly labeled as synthetic

## 2. Primary users
- Environmental / Disaster Management Officer
- Citizen Reporter

## 3. Supported environments
- River
- Landslide

The architecture remains environment-agnostic so the registry can support more domains without rewriting the core platform.

## 4. Core workflow
1. Dashboard overview
2. New Analysis
3. Select environment and location
4. Guided investigation questions
5. Upload before and after imagery
6. Validate inputs
7. Analyze imagery and produce change detection
8. Interpret potential problems with confidence and evidence
9. Review on monitoring map
10. Generate area report
11. Human officer review and confirmation
12. Citizen observation submission and officer review

## 5. Architecture overview

```text
User (Officer / Citizen)
  ↓
Next.js 14 + React + TypeScript + Tailwind frontend
  ↓
FastAPI backend + Pydantic validation
  ↓
Environment registry + analysis services + map services + citizen reporting services
  ↓
Local storage for uploaded images and demo data fixtures
```

## 6. Requirements
- Node.js 20+
- Python 3.13+
- npm
- pip / virtual environment

## 7. Install

### Frontend
```bash
cd frontend
npm install
```

### Backend
```bash
cd backend
python -m venv .venv
./.venv/Scripts/pip install -r requirements.txt
```

## 8. Run

### Backend
```bash
cd backend
./.venv/Scripts/uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

Open:
- http://localhost:3000
- http://localhost:8000/docs for API docs

## 9. Demo workflow
The platform includes explicit demo fixtures to help with presentation and QA without replacing the upload-your-own workflow.

Use the demo toggle from the overview page, or run the seed command:

```bash
cd backend
./.venv/Scripts/python -m app.seed_demo
```

See DEMO_SCRIPT.md for a concise 3–5 minute hackathon script.

## 10. Environment variables
Documented environment variables are limited to the app-level configuration used by the frontend/backend:
- NEXT_PUBLIC_API_BASE_URL
- NEXT_PUBLIC_MAP_STYLE_URL

Do not commit secrets or private credentials.

## 11. Test commands

```bash
cd frontend
npm run test -- --run --reporter=basic
npm run type-check
npm run lint
npm run build

cd backend
./.venv/Scripts/pytest -q
```

## 12. Current verification status
Verified in the repo as of 2026-09-13:
- Frontend tests: 49 passed
- Backend tests: 32 passed
- TypeScript check: passed
- Frontend lint: passed (warnings only)
- Production build: passed

## 13. Final MVP status
This repository is ready for a concise hackathon demonstration and final handoff. It is a strong MVP, not a production-grade environmental monitoring system.

## 14. Architecture and implementation notes
- River and Landslide are implemented as environment-specific registry entries.
- Analysis and interpretation stay separate from the UI and use cautious confidence language.
- Human confirmation is intentionally separate from AI confidence.
- Citizen reports remain distinct from AI detections and map layers.
- Demo data is clearly labeled and does not imply live operational conditions.

## 15. Known limitations
- No live satellite or external model ingestion
- No production cloud infrastructure or auth layer
- No advanced ML training pipeline
- Demo data remains synthetic for presentation and QA purposes

## 16. Notes for maintainers
- Prefer evidence-backed language over disaster-probability claims.
- Keep demo content distinct from user-submitted operational data.
- Preserve the environment registry pattern when extending the platform.
- Do not introduce production-grade integrations during MVP work.
