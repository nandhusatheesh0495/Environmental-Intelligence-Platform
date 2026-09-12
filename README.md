# Environmental Intelligence Platform

> **AI-Powered Environmental Change Detection & Monitoring Console**  
> Built for Environmental and Disaster Management Officers with human-in-the-loop verification.

---

## 1. Executive Summary & Vision

The **Environmental Intelligence Platform** compares environmental imagery over time, identifies meaningful surface alterations, detects potential environmental threats, presents visual evidence with classification confidence, and equips human officers to investigate, verify, and respond.

### Primary User Persona
* **Primary**: Environmental / Disaster Management Officer
* **Secondary**: Citizen Reporter

### Core Design Principle
**Professional + Minimal + Clear + Evidence-focused**
* Clean whitespace, strong typography, subtle borders, and restrained shadows.
* No gaming aesthetic, no futuristic sci-fi neon, no oversized decorative metrics, no visual clutter.
* Scientific caution strictly enforced in all labels and metadata.

---

## 2. Core Architecture

```
USER (Officer / Citizen)
   ↓
PROFESSIONAL WEB DASHBOARD (Next.js 14 App Router + TypeScript + Tailwind)
   ↓
FRONTEND DOMAIN ENGINE & COMPONENT SYSTEM
   ↓
BACKEND API (Python 3.13 + FastAPI + Pydantic v2)
   ↓
ENVIRONMENT ABSTRACTION & ANALYSIS ENGINE (Extensible Registry)
   ↓
STORAGE (Local filesystem raster storage for MVP) & RESULTS PIPELINE
```

### Extensible Environment Model
The platform architecture completely decouples environmental domain logic from image processing plumbing:
* **River (Primary MVP Environment)**:
  * Potential Riverbank Erosion
  * Significant Water-Area Change
  * Exposed Riverbed
  * Potential Sediment-Related / Exposed-Bed Change
  * Riverbank Movement
  * Other Significant Water-Body Change
* **Landslide (Secondary MVP Environment)**:
  * Potential Landslide-related Change
  * Potential Terrain Disturbance
  * Vegetation Loss / Canopy Stripping
  * Exposed Ground & Colluvium
* **Future Environments (Extensible without altering core pipelines)**:
  * Forest, Coastline, Wetland, Agriculture, Wildfire.

---

## 3. Scientific Terminology Standards

To avoid misleading officers or presenting image analysis as infallible:
* **Cautious Problem Naming**: Detections use phrasing such as *"Potential Riverbank Erosion"* or *"Potential Landslide-related Change"* instead of definitive claims.
* **AI Confidence Standard**: Represents model classifier certainty (e.g. `AI Confidence: 88%`), **never** the probability of disaster occurrence.
* **Human-in-the-Loop Protocol**: Detections require human officer sign-off (`Confirmed`, `Rejected`, or `Inconclusive`) prior to report issuance.

---

## 4. Repository Structure

```
environmental-intelligence-platform/
├── package.json                         # Root orchestration scripts
├── README.md                            # System architecture & documentation
├── backend/                             # Python 3.13 FastAPI backend
│   ├── app/
│   │   ├── main.py                      # FastAPI app entrypoint, CORS, global error handling
│   │   ├── core/
│   │   │   └── config.py                # Platform settings & governance configurations
│   │   ├── models/
│   │   │   └── domain.py                # Pydantic domain models (User, Area, Image, Analysis, Detection, Review, CitizenReport)
│   │   ├── environments/
│   │   │   ├── base.py                  # BaseEnvironment abstract interface
│   │   │   ├── river.py                 # River environment definition (Primary)
│   │   │   ├── landslide.py             # Landslide environment definition (Secondary)
│   │   │   └── registry.py              # Central EnvironmentRegistry
│   │   └── api/
│   │       └── v1/
│   │           ├── system.py            # /api/v1/system/status
│   │           ├── environments.py      # /api/v1/environments catalog
│   │           └── router.py            # API v1 route aggregator
│   ├── tests/
│   │   ├── test_domain_models.py        # Pydantic validation & confidence boundary tests
│   │   ├── test_environments.py         # River & Landslide specification & registry tests
│   │   └── test_api.py                  # Integration tests for FastAPI endpoints
│   ├── requirements.txt
│   └── pyproject.toml
└── frontend/                            # Next.js 14 App Router frontend
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx               # Root layout with responsive AppShell
    │   │   ├── page.tsx                 # Operations Overview Dashboard
    │   │   ├── new-analysis/page.tsx    # "Upload Your Own" primary workflow foundation
    │   │   ├── environments/page.tsx    # Environment Domains catalog
    │   │   └── globals.css              # Design tokens and Tailwind base
    │   ├── components/
    │   │   ├── ui/                      # Button, Card, Input, Select, Textarea, Checkbox, Radio,
    │   │   │                            # Badge, StatusBadge, Alert, Modal, ConfirmationDialog,
    │   │   │                            # Tooltip, DropZone
    │   │   ├── common/                  # PageHeader, SectionHeader, EmptyState, LoadingState,
    │   │   │                            # ErrorState, DataRow
    │   │   └── layout/                  # AppShell, Sidebar, Header
    │   ├── domain/
    │   │   ├── types.ts                 # TypeScript domain contracts
    │   │   ├── environments.ts          # River & Landslide client-side registry
    │   │   └── status.ts                # Strict terminology and severity formatters
    │   ├── lib/
    │   │   └── utils.ts                 # Utility functions (cn, date formatters)
    │   └── tests/
    │       ├── status.test.ts           # Status and terminology tests
    │       ├── environments.test.ts     # Environment registry tests
    │       └── components.test.tsx      # Reusable UI primitives component tests
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── vitest.config.ts
```

---

## 5. Quickstart & Verification

### Running the Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
```
API Documentation: `http://localhost:8000/docs`

### Running Backend Tests
```bash
cd backend
.\.venv\Scripts\pytest -v
```

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
Dashboard: `http://localhost:3000`

### Running Frontend Tests & Verification
```bash
cd frontend
npm run test         # Vitest unit and component tests
npm run type-check   # TypeScript compiler check
npm run lint         # ESLint check
npm run build        # Next.js production build
```

---

## 6. Phase 1 Definition of Done Checklist

* [x] Repository inspected and established at recommended scratch location.
* [x] Python 3.13 + FastAPI backend initialized with Pydantic domain models.
* [x] Extensible Environment Registry created with **River** (Primary) and **Landslide** (Secondary).
* [x] Scientific caution terminology standard established.
* [x] Next.js 14 + TypeScript + Tailwind CSS frontend initialized.
* [x] Professional, minimal, evidence-focused visual design system created.
* [x] Complete reusable UI component catalog implemented and tested.
* [x] Reusable AppShell with responsive sidebar navigation created.
* [x] "Upload Your Own" primary workflow foundation established at `/new-analysis`.
* [x] Backend automated unit and API integration tests passing (14/14).
* [x] Frontend automated unit and component tests passing.
* [x] Type checking passes without errors.
* [x] Next.js production build succeeds.
