# Pratyaksh.AI – Fine‑Tuned Deepfake Detection Platform

<p align="center">
  <img src="public/placeholder-logo.png" alt="Pratyaksh.AI" width="140" />
</p>

<p align="center">
  <strong>Multi‑modal deepfake & synthetic media detection powered by the fine‑tuned Pratyaksh.AI model pipeline.</strong><br/>
  Fast, containerized, privacy‑aware analysis of images, video & audio with automatic key fallback and real‑time progress tracking.
</p>

<p align="center">
  <a href="https://github.com/404NotFound-dotcom/Pratyaksh.AI/actions"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/404NotFound-dotcom/Pratyaksh.AI/ci.yml?branch=main&logo=github&label=CI"/></a>
  <a href="https://github.com/404NotFound-dotcom/Pratyaksh.AI/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/404NotFound-dotcom/Pratyaksh.AI?style=flat"/></a>
  <a href="https://github.com/404NotFound-dotcom/Pratyaksh.AI/network/members"><img alt="Forks" src="https://img.shields.io/github/forks/404NotFound-dotcom/Pratyaksh.AI"/></a>
  <a href="https://github.com/404NotFound-dotcom/Pratyaksh.AI/issues"><img alt="Issues" src="https://img.shields.io/github/issues/404NotFound-dotcom/Pratyaksh.AI"/></a>
  <a href="https://github.com/404NotFound-dotcom/Pratyaksh.AI/pulls"><img alt="PRs" src="https://img.shields.io/github/issues-pr/404NotFound-dotcom/Pratyaksh.AI"/></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/License-MIT-green.svg"/></a>
  <img alt="Node" src="https://img.shields.io/badge/Node-18+-339933?logo=node.js"/>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?logo=next.js"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript"/>
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-8+-F69220?logo=pnpm"/>
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker"/>
</p>

---

## Table of Contents
1. Overview
2. Core Features
3. Architecture & Data Flow
4. Workflow Summary
5. Project Structure
6. Technology Stack
7. Local Development
8. Environment Configuration
9. Docker & Deployment
10. Analysis internals
11. Key Fallback Mechanism
12. Admin Panel
13. Security & Privacy
14. Performance Notes
15. Monitoring & Health
16. Testing & Quality
17. Troubleshooting
18. Roadmap
19. Contributing
20. License

---

## 1. Overview
Pratyaksh.AI is a platform built around the fine‑tuned Pratyaksh.AI model for detecting potentially manipulated (synthetic / deepfake / AI‑generated) visual and audio media. It ingests uploaded assets, normalizes them in memory, extracts discriminative feature representations, and queries the Pratyaksh.AI inference endpoint (with automatic key rotation) to produce a structured multi‑score analysis.

The system is:
- Multi‑modal (image / video / audio)
- Stateless (ephemeral in‑memory storage)
- Resilient (automatic API credential fallback)
- Observable (real‑time progress polling)
- Portable (single Docker image / compose stack)

> NOTE: All media is processed transiently and never written to persistent disk by default.

---

## 2. Core Features
- Multi‑format upload: JPG, PNG, MP4, MOV, MP3, WAV, M4A
- Fine‑tuned Pratyaksh.AI inference pipeline (pluggable abstraction layer for future providers)
- Progressive, stage‑based analysis with user‑visible milestones
- Automatic API key fallback & health probing
- Admin panel: key visibility (masked), validation, stress/fallback tests
- Rich UI built with shadcn/ui + Tailwind CSS
- Real‑time progress tracking via polling endpoints
- Exportable PDF summary (evidence & scoring)
- Dockerized production build with optional Nginx reverse proxy
- Strict size limits with graceful error feedback
- Architecture designed for horizontal scaling (stateless API layer)

---

## 3. Architecture & Data Flow
```
┌────────────┐      Upload         ┌───────────────────┐   Feature    ┌─────────────────┐  Inference   ┌────────────────────────┐
│   Client   │ ─────────────────▶ │  Next.js API Edge │ ─ Extraction ▶│  Pre‑Processor  │ ───────────▶ │ Pratyaksh.AI Model API │
│  (React)   │  progress polling  │    (/api/*)       │   (in‑mem)    │ (normalization) │  (fallback)  │    (fine‑tuned)        │
└─────┬──────┘ ◀── status JSON ───└─────────┬─────────┘               └────────┬────────┘             └─────────┬──────────┘
      │ PDF export                          │ events                                │ scores                      │ result
      │                                      ▼                                      ▼                           ▼
      │                              Progress Tracker                      Result Aggregator             Signed Response
      │                                      │                                      │                           │
      ▼                                      ▼                                      ▼                           ▼
  User Display  ◀───────────────────── UI Components ◀──────────────────── Structured Analysis ◀────────── Normalized Scores
```

### Logical Layers
- Presentation: Next.js (App Router) + component library
- API Layer: Route handlers under `/app/api/*`
- Processing: In‑memory staging (buffers + metadata)
- Inference: Pratyaksh.AI fine‑tuned model endpoint (HTTP)
- Resilience: Key rotation utility + health probe
- Reporting: PDF generation utility

---

## 4. Workflow Summary
1. User selects media (client‑side validation & size checks).
2. File posted to `/api/upload` → session/analysis id generated.
3. Analysis initiated: server orchestrates sequential stages:
   - Validation & MIME inspection
   - Pre‑processing (resampling / frame metadata / waveform stats)
   - Feature packaging / encoding
   - Remote inference request (with key rotation on failure)
   - Score normalization & label mapping
   - Persistence in ephemeral in‑memory store
4. Client polls `/api/progress/{analysisId}` for stage updates.
5. When complete, client fetches aggregated result `/api/analyze` (or dedicated result route) and renders breakdown.
6. Optional PDF export generated on demand.
7. Automatic cleanup task expires entries after TTL.

---

## 5. Project Structure
```
app/
  layout.tsx            # Root layout & theming
  page.tsx              # Landing + main upload & analysis UI
  api/
    upload/route.ts     # Receive uploads & init analysis
    analyze/route.ts    # Trigger / aggregate analysis
    progress/[id]/route.ts # Progress polling
    health/route.ts     # Health & readiness
    admin/keys/route.ts # Key listing (masked)
    admin/test-key/route.ts # Single key test
    test-fallback/route.ts  # Fallback stress test
    ...
components/
  file-upload.tsx       # Drag/drop & validation
  progress-tracker.tsx  # Stage progress UI
  analysis-results.tsx  # Result visualization
  admin-panel.tsx       # Key management & tests
  animated-background.tsx / dynamic-background.tsx
  ui/*                  # shadcn/ui component primitives
hooks/
  use-toast.ts          # Toast notifications
  use-mobile.ts         # Responsive detection
lib/
  ai-analysis.ts        # Orchestration & inference call logic
  file-storage.ts       # In-memory file store & cleanup
  key-storage.ts        # Key rotation & health metrics
  pdf-generator.ts      # PDF export utility
  upload-utils.ts       # Validation & MIME helpers
  utils.ts              # Common helpers
scripts/
  test-hackathon-readiness.ts # Scenario script
  test-system-integration.ts  # Integration script
styles/                 # Global styles & Tailwind entrypoints
public/                 # Static assets
Dockerfile / docker-compose*.yml
```

---

## 6. Technology Stack
- Runtime: Node.js 18+
- Framework: Next.js 14 (App Router)
- Language: TypeScript 5+
- UI: React 18, Tailwind CSS, shadcn/ui (Radix primitives)
- Charts & Visuals: Recharts, Lucide icons
- Forms: React Hook Form + Zod validation
- Packaging: pnpm (fast, content‑addressed)
- Container: Multi‑stage Docker build, optional Nginx reverse proxy profile

---

## 7. Local Development
```bash
# Clone
git clone https://github.com/404NotFound-dotcom/Pratyaksh.AI.git
cd Pratyaksh.AI

# Install pnpm if needed
npm install -g pnpm

# Dependencies
pnpm install

# Start dev server
pnpm dev
# → http://localhost:3000
```

### NPM Alternative
```bash
npm install
npm run dev
```

---

## 8. Environment Configuration
Create `.env.local` in project root.

Required (at least one key):
```
PRIMARY_MODEL_API_KEY=your_primary_key
```
Optional fallback keys (sequential priority):
```
MODEL_API_KEY_1=...
MODEL_API_KEY_2=...
MODEL_API_KEY_3=...
MODEL_API_KEY_4=...
MODEL_API_KEY_5=...
MODEL_API_KEY_6=...
```
Optional tuning / limits:
```
MAX_IMAGE_MB=10
MAX_VIDEO_MB=50
MAX_AUDIO_MB=25
ANALYSIS_TTL_MINUTES=60
```
> Backwards compatibility: legacy provider‑specific variable names are still recognized internally if present (no need to rename immediately when upgrading).

---

## 9. Docker & Deployment
### Compose (Recommended)
```bash
docker-compose up --build
# Background
docker-compose up -d --build
```
Development profile (hot reload):
```bash
docker-compose -f docker-compose.dev.yml up --build
```
Production + Nginx (if profile included):
```bash
docker-compose --profile production up -d --build
```

### Manual
```bash
docker build -t pratyaksh-ai .
docker run -p 3000:3000 --env-file .env.local pratyaksh-ai
```

### Cloud Platforms
- Vercel: Add environment variables (prefix consistent with above) → Deploy
- Render / Railway / Fly.io: Supply environment vars, run `pnpm build && pnpm start`
- Bare metal / VPS: Use PM2 or systemd for process supervision.

---

## 10. Analysis Internals
Stages (reported via progress endpoint):
1. QUEUED – Accepted, awaiting processing
2. VALIDATING – MIME / size / format checks
3. PREPROCESSING – Normalization, frame / waveform sampling
4. ENCODING – Feature packaging for inference
5. INFERENCE – Pratyaksh.AI model call
6. AGGREGATING – Score normalization & label mapping
7. FINALIZING – Cache store & cleanup scheduling
8. COMPLETE – Ready for retrieval / PDF export

Score Dimensions (example):
- authenticityScore (0–1)
- tamperProbability
- aiArtifactLikelihood
- compressionAnomalyScore
- overallConfidence

> Exact schema can evolve; client reads dynamic keys safely.

---

## 11. Key Fallback Mechanism
- Ordered key ring stored in memory
- Each inference attempt uses the current active key
- Failures classified: transient (retry) vs credential (rotate)
- Rotation advances pointer; exhausted ring returns structured failure
- Admin fallback test endpoint simulates rapid sequential calls to verify resilience
- Health route summarizes current success / failure ratios

---

## 12. Admin Panel
Accessible from main interface footer (role‑agnostic demo panel):
- Masked key list (first & last chars only)
- Individual key probe test
- Full fallback cascade test
- System health & uptime snapshot
- Manual cache purge (if implemented in future roadmap)

---

## 13. Security & Privacy
- In‑memory only (no persistence) for uploaded media
- Automatic TTL cleanup (default 60 min) prevents retention
- Keys never returned unmasked
- Strict size caps mitigate abuse
- CORS controlled at API layer (adjust as needed)
- Docker image follows multi‑stage build minimizing attack surface
- No third‑party analytics embedded by default

---

## 14. Performance Notes
- Use pnpm for 2–3x faster cold installs
- Stateless design → horizontally scalable behind a load balancer
- Progressive polling avoids WebSocket overhead at small scale
- Potential future optimization: switch to incremental streaming responses
- Client side code‑splitting by Next.js (App Router) reduces payload

---

## 15. Monitoring & Health
Endpoints:
- `/api/health` – basic readiness & key ring status summary
- `/api/progress/{analysisId}` – fine‑grained stage polling
- Admin panel – aggregated operational data

Docker health check (if defined) calls the health endpoint for orchestrator restarts.

---

## 16. Testing & Quality
Suggested (scripts scaffold present):
- Unit tests (Jest / Vitest) – not yet included by default
- Integration & scenario scripts in `scripts/` folder
- Lint: `pnpm lint`
- Type safety: `pnpm type-check`

> Add a CI workflow (`.github/workflows/ci.yml`) invoking build, lint, type‑check, and future test commands.

---

## 17. Troubleshooting
Common issues:
1. No keys configured → Ensure `PRIMARY_MODEL_API_KEY` exists & restart server
2. Entity too large → Respect MAX_*_MB limits; compress media
3. Repeated inference failure → Check key validity / quota; run fallback test
4. Video errors → Re‑encode to MP4 (h.264 + AAC) under size limit
5. Install hangs → Clear cache `pnpm store prune` then reinstall
6. Docker port clash → Ensure 3000 (or mapped port) free; change with `-p` flag

---

## 18. Roadmap
- [ ] WebSocket / Server‑Sent Events real‑time streaming
- [ ] Pluggable model providers (multi‑vendor abstraction layer)
- [ ] On‑device lightweight heuristic pre‑screening
- [ ] GPU accelerated frame feature extraction (FFmpeg integration)
- [ ] Advanced forensic visualizations (heatmaps / temporal drift)
- [ ] RBAC & authenticated admin area
- [ ] Persistent optional storage + audit trails (opt‑in)
- [ ] Enhanced PDF report templates
- [ ] Multi‑language UI i18n

---

## 19. Contributing
1. Fork repository
2. Create feature branch: `git checkout -b feat/descriptive-name`
3. Install deps & implement changes
4. Run lint / type checks
5. Commit using conventional style if possible
6. Open Pull Request – describe rationale & testing evidence

PR Guidelines:
- Keep changes focused
- Include screenshots for UI modifications
- Note any environment / migration considerations

---

## 20. License
MIT © 2025 404NotFound-dotcom

---

### Acknowledgements
Thanks to the open‑source community for UI primitives, tooling, and inspiration in multimodal analysis research. Underlying provider internals are abstracted; all detection logic references the fine‑tuned Pratyaksh.AI model.

---

Need help? Open an issue: https://github.com/404NotFound-dotcom/Pratyaksh.AI/issues
