# IMPLEMENTATION_PLAN.md
## CivicActionAI — From Complaints to Action

### 1. Executive Architecture Overview
CivicActionAI is an AI-powered civic issue intelligence and workflow management platform built to bridge the gap between fragmented citizen reports and decisive municipal action. The platform is architected around a 4-stage lifecycle:
1. **CAPTURE**: Instant, mobile-friendly report capture with text, category selection, image upload, and interactive map coordinate selection.
2. **UNDERSTAND**: Real-time AI pipeline executing structured categorization, contextual summarization, explainable multi-factor prioritization, and hybrid duplicate detection.
3. **REVEAL**: Decision-support dashboard showing live KPI metrics, interactive map layers (OpenStreetMap/Leaflet), geospatial hotspot clustering, recurring problem alerts, and automated Action Briefs.
4. **ACT**: Full-lifecycle workflow management (Submitted → Under Review → Assigned → In Progress → Resolved), department assignment, immutable audit history, and citizen tracking portal.

```
+-------------------------------------------------------------+
|                      CITIZEN EXPERIENCE                     |
|  - Mobile-Optimized Submission Form                         |
|  - Map Pin & Geolocation Picker                             |
|  - Image Upload & Immediate AI Confirmation                 |
|  - Public Tracking Portal by Complaint ID                   |
+------------------------------+------------------------------+
                               | REST API (JSON / Multipart)
                               v
+-------------------------------------------------------------+
|                   NODE.JS / EXPRESS BACKEND                 |
|  - Input Validation & Rate Limiting                         |
|  - Secure File Handling (Multer)                            |
|  - Controllers & REST Endpoints                             |
+--------------+-------------------------------+--------------+
               |                               |
               v                               v
+------------------------------+ +----------------------------+
|        AI & INTELLIGENCE     | |      DATABASE LAYER        |
|  - Gemini API (Structured)   | |  - MongoDB / Mongoose      |
|  - Deterministic Fallback    | |  - Reports, Hotspots,      |
|  - Hybrid Duplicate Engine   | |    Status Audit Trail      |
|  - Geospatial Hotspot Engine | |  - Optimized Indexes       |
|  - Action Brief Generator    | +----------------------------+
+------------------------------+
                               ^
                               | REST API
+------------------------------+------------------------------+
|                     AUTHORITY DASHBOARD                     |
|  - KPI Cards & Trend Analytics                              |
|  - Interactive Map with Priority Markers & Hotspot Circles  |
|  - Multi-Filterable Complaint Table                         |
|  - Detailed Report View with AI Reasoning & Action Briefs   |
|  - Workflow Transitions & Department Assignment             |
+-------------------------------------------------------------+
```

---

### 2. Components Breakdown

#### Frontend (`client/`)
- **Technology**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet.
- **Pages**:
  - `/` Landing / Overview with product mission, live demo quick-start, and stats preview.
  - `/report` Citizen issue reporting wizard (text, auto-detect category, map picker, image upload).
  - `/track` & `/track/:id` Citizen tracking portal with timeline visualizer, status history, and AI summary.
  - `/admin` Authority Decision-Maker Dashboard with KPIs, live map, hotspot cards, and filterable table.
  - `/admin/reports/:id` Detailed Authority review page with AI reasoning explanation, duplicate detection links, and department assignment & workflow transition controls.
  - `/admin/hotspots` Dedicated geospatial cluster explorer and Action Brief generator.
- **Accessibility & UX**: Semantic HTML5, ARIA attributes, keyboard-navigable dialogs, high-contrast badges (not color alone), responsive breakpoints (375px mobile to 1440px desktop).

#### Backend (`server/`)
- **Technology**: Node.js, Express.js, Mongoose (MongoDB), Multer, Cors, Helmet, Joi/validator.
- **Modules**:
  - `config/`: MongoDB connection, environment defaults.
  - `models/`: `Report.js` (complaint schema with location, AI analysis, statusHistory, duplicates) and `Hotspot.js`.
  - `controllers/`: `reportController.js`, `dashboardController.js`, `trackingController.js`.
  - `services/`:
    - `ai/`: Gemini API integration with structured JSON prompting and robust schema validation.
    - `ai/fallbackService.js`: Deterministic civic classification, priority scoring, and reasoning rules if Gemini is unavailable.
    - `duplicate/duplicateService.js`: Hybrid duplicate scoring algorithm.
    - `hotspot/hotspotService.js`: Haversine geospatial clustering, category aggregation, and risk scoring.
    - `ai/actionBriefService.js`: Synthesizes related reports into an operational Action Brief.
  - `middleware/`: File upload filter, input sanitization, error handler.

---

### 3. Core Algorithms & AI Logic

#### A. Structured AI Pipeline
- Structured system prompt separating untrusted user data from operational instructions (prompt-injection defense).
- Strictly parses JSON containing: `category`, `summary`, `priority`, `priorityScore`, `priorityReason` (array of reasons), `safetyRisk`, `impactLevel`, `keywords`, `actionBrief`.
- Schema validator verifies enums (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, allowed categories).

#### B. Fallback Intelligence Engine
- If Gemini API key is missing, network fails, or output violates schema, the system executes deterministic scoring:
  - Text pattern matching for critical hazards (e.g., "open manhole", "live wire", "flooding", "school entrance", "accident").
  - Mathematical priority calculation: Base Category Weight + Hazard Keyword Weight + Proximity/Duplicate Multiplier.
  - Score mapped: 0–30 Low, 31–60 Medium, 61–80 High, 81–100 Critical.
  - Produces plain-language explanation array justifying the calculated score.

#### C. Hybrid Duplicate Detection Formula
```
duplicateScore = (textSimilarity * 0.55) + (geoProximityScore * 0.30) + (categorySimilarity * 0.15)
```
- **Text Similarity**: Jaccard index on normalized token n-grams and keyword stems.
- **Geo-Proximity**: Inverse decay based on Haversine distance ($d \le 100m \to 1.0$, $d \le 500m \to 0.7$, $d \le 1km \to 0.4$).
- **Category Similarity**: 1.0 if match, 0.5 if related (e.g. Drainage & Waterlogging), 0.0 otherwise.
- Threshold: $\ge 0.65$ triggers a "Possible Duplicate" flag, preserving both complaints and linking them bidirectionally.

#### D. Geospatial Hotspot / Cluster Engine
- Clusters complaints within a configurable radius ($r = 500$ meters) using the Haversine formula.
- Groups by primary issue type, computes aggregate risk (sum of priority weights), identifies recurring patterns, and surfaces actionable intelligence.

---

### 4. Workflow Lifecycle
1. **SUBMITTED**: Initial state upon citizen report intake.
2. **UNDER REVIEW**: Authority acknowledges report and inspects AI analysis & duplicates.
3. **ASSIGNED**: Delegated to specific department (e.g., Road Maintenance, Drainage, Waste Management).
4. **IN PROGRESS**: Field crew deployed, resolution work actively underway.
5. **RESOLVED**: Work completed, closure note recorded, citizen notified via tracking view.
- Every state transition appends an immutable entry to `statusHistory` with `status`, `timestamp`, `changedBy`, and `note`.

---

### 5. Testing & Verification Strategy
- **Backend Tests**: Automated tests for Report creation, AI schema validation, deterministic fallback, duplicate scoring, hotspot clustering, status transitions, and assignment.
- **Frontend Verification**: Component tests & manual end-to-end browser walkthrough of the 5-minute demo journey.
- **Security Audit**: Zero committed secrets, parameter sanitization, file extension & size validation.
