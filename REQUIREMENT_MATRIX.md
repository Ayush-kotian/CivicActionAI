# REQUIREMENT_MATRIX.md
## CivicActionAI — Requirement Traceability Matrix

| Requirement | Implementation Component | Technical Mechanism | Status |
| :--- | :--- | :--- | :---: |
| **Citizen Complaint Capture** | `client/src/pages/SubmitReport.tsx` | Mobile-first form with description, category, photo upload & coordinates | **DONE** |
| **Category Selection + Auto-Detect** | `server/src/services/ai/geminiService.js` | Dual manual selector + AI automatic classification fallback | **DONE** |
| **Image Upload & Validation** | `server/src/middleware/upload.js` | Multer with strict MIME check (JPG, PNG, WEBP), 5MB size limit | **DONE** |
| **Location Map Selection** | `client/src/components/LocationPicker.tsx` | Interactive Leaflet map with draggable pin & browser geolocation | **DONE** |
| **AI Structured Categorization** | `server/src/services/ai/geminiService.js` | JSON Schema output validated against allowed civic category list | **DONE** |
| **AI Operational Summarization** | `server/src/services/ai/geminiService.js` | Synthesizes verbose citizen text into 1-2 sentence municipal summary | **DONE** |
| **Explainable Prioritization** | `server/src/services/ai/fallbackService.js` | Multi-factor scoring (safety, urgency, impact) + plain-language explanation | **DONE** |
| **Hybrid Duplicate Detection** | `server/src/services/duplicate/duplicateService.js` | Multi-factor formula: Text (0.50) + Distance (0.35) + Category (0.15) | **DONE** |
| **Geospatial Hotspot Detection** | `server/src/services/hotspot/hotspotService.js` | Haversine clustering within 600m radius with risk aggregation | **DONE** |
| **Action Brief Generator** | `server/src/services/hotspot/hotspotService.js` | Generates 1-minute authority action brief from cluster data | **DONE** |
| **Decision-Maker Dashboard** | `client/src/pages/AdminDashboard.tsx` | Real-time KPI counters, priority breakdown, and filterable complaint feed | **DONE** |
| **Interactive Map with Markers** | `client/src/components/CivicMap.tsx` | Priority-coded markers with popup previews and hotspot overlay circles | **DONE** |
| **Status Lifecycle Workflow** | `server/src/controllers/reportController.js` | 5-stage workflow (Submitted → Under Review → Assigned → In Progress → Resolved) | **DONE** |
| **Department Assignment** | `server/src/controllers/reportController.js` | Assignment to 6 civic departments with officer tracking | **DONE** |
| **Immutable Status Audit Trail** | `server/src/models/Report.js` | Array of `{ status, changedBy, timestamp, note }` preserved on every update | **DONE** |
| **Citizen Tracking Portal** | `client/src/pages/CitizenTrack.tsx` | Visual progress timeline and status history lookup by Complaint ID | **DONE** |
| **Deterministic AI Fallback** | `server/src/services/ai/fallbackService.js` | Rule-based classifier & priority engine when LLM is unavailable | **DONE** |
| **Prompt Injection Protection** | `server/src/services/ai/geminiService.js` | Strict boundary tagging separating instructions from untrusted citizen input | **DONE** |
| **Synthetic Dataset (35 reports)** | `server/src/scripts/seed.js` | 35 realistic complaints with duplicates, hotspots, and hazard scenarios | **DONE** |
| **Automated Testing Suite** | `server/tests/*.test.js` | Unit and integration test suite covering API, AI, duplicate & workflow logic | **DONE** |
| **Security Controls** | `server/src/middleware/` | Helmet, CORS, input sanitization, safe error handlers, zero secrets in Git | **DONE** |
| **Accessibility (WCAG)** | `client/src/` | Semantic HTML5, ARIA labels, keyboard navigation, high color contrast | **DONE** |
| **Single Branch & Size Constraint** | Root Git repository | Maintained on single branch `main`, repository kept well under 10 MB | **DONE** |
