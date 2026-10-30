import React, { useState, useEffect } from 'react';
import {
  FilePlus2,
  LayoutDashboard,
  Search,
  Sparkles,
  AlertOctagon,
  Flame,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Clock,
  Layers,
  MapPin
} from 'lucide-react';
import { fetchDashboardStats } from '../services/api';
import { DashboardStats } from '../types';

interface LandingPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [trackIdInput, setTrackIdInput] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.warn('Could not load live landing stats:', err.message));
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackIdInput.trim()) {
      onNavigate('track', trackIdInput.trim());
    }
  };

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-12 lg:p-16 shadow-xl border border-blue-800/50">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>AI for Civic Impact &bull; Hackathon Prototype</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            From Complaints to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">Action</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Transform scattered citizen reports into prioritized, explainable, and trackable municipal interventions.
            AI understands the report, flags hazards, detects duplicates, clusters hotspots, and keeps citizens informed until resolution.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('report')}
              className="px-6 py-3.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 transition"
            >
              <FilePlus2 className="w-4 h-4 text-slate-950" />
              <span>Report an Issue (&lt; 1 Min)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm border border-white/20 backdrop-blur-sm flex items-center gap-2 transition"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-300" />
              <span>Open Authority Desk</span>
            </button>
          </div>

          {/* Quick Citizen Tracking Bar */}
          <div className="pt-6 border-t border-white/10 max-w-xl">
            <form onSubmit={handleTrackSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={trackIdInput}
                  onChange={(e) => setTrackIdInput(e.target.value)}
                  placeholder="Enter Complaint ID (e.g. CAI-1001, CAI-1030)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-xs sm:text-sm hover:bg-slate-100 transition shrink-0"
              >
                Track Status
              </button>
            </form>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
              <span>Try sample IDs:</span>
              <button
                type="button"
                onClick={() => onNavigate('track', 'CAI-1001')}
                className="underline hover:text-white"
              >
                #CAI-1001
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => onNavigate('track', 'CAI-1030')}
                className="underline hover:text-white"
              >
                #CAI-1030 (Critical Hazard)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time KPI metrics banner */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Live Civic Operations Metrics (Synthetically Seeded)
          </h2>
          <span className="text-[11px] text-emerald-600 bg-emerald-50 font-semibold px-2 py-0.5 rounded border border-emerald-200">
            Real-time MongoDB Engine
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Total Reports</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats?.totalReports ?? 35}
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <span className="text-xs text-red-700 font-medium flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5 text-red-600" /> Critical Hazards
            </span>
            <div className="text-2xl font-extrabold text-red-700 mt-1">
              {stats?.critical ?? 7}
            </div>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <span className="text-xs text-amber-700 font-medium">High Priority</span>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">
              {stats?.high ?? 15}
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <span className="text-xs text-purple-700 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-600" /> Duplicates Flagged
            </span>
            <div className="text-2xl font-extrabold text-purple-700 mt-1">
              {stats?.potentialDuplicates ?? 10}
            </div>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
            <span className="text-xs text-orange-700 font-medium flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-600" /> Active Hotspots
            </span>
            <div className="text-2xl font-extrabold text-orange-700 mt-1">
              {stats?.activeHotspots ?? 3}
            </div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolved Actions
            </span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              {stats?.resolved ?? 10}
            </div>
          </div>
        </div>
      </section>

      {/* 5-Minute Hackathon Demo Journey Guide */}
      <section className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-blue-300 font-semibold">
              Judge & Evaluator Walkthrough
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              The 5-Minute End-to-End Demo Journey
            </h2>
          </div>
          <div className="text-xs text-slate-300 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
            Full Functional Flow
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('report')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </div>
            <h3 className="font-bold text-sm text-white">Citizen Report Submission</h3>
            <p className="text-xs text-slate-400">
              Submit an issue (e.g., waterlogging on Main Road). Real-time AI pipeline classifies and scores priority with explainable reasoning.
            </p>
          </div>

          <div
            onClick={() => onNavigate('hotspots')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </div>
            <h3 className="font-bold text-sm text-white">Reveal Hotspots & Briefs</h3>
            <p className="text-xs text-slate-400">
              Inspect the Main Road cluster. View the automated 1-minute Action Brief synthesized from multiple related reports.
            </p>
          </div>

          <div
            onClick={() => onNavigate('admin')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </div>
            <h3 className="font-bold text-sm text-white">Authority Assignment & Resolution</h3>
            <p className="text-xs text-slate-400">
              Assign work order to Drainage Department. Transition status to In Progress, then Resolved, and verify live citizen tracking timeline.
            </p>
          </div>
        </div>
      </section>

      {/* Four Lifecycle Stages Cards */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Challenge Alignment
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for the 4 Lifecycle Stages
          </h2>
          <p className="text-sm text-slate-600">
            How CivicActionAI transforms raw complaints into accountable city action.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stage 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-base">Stage 1: Capture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mobile-optimized report intake under 1 minute. Accepts text descriptions, category selection with Auto-Detect, photo attachments, and interactive Leaflet map pins.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-base">Stage 2: Understand</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI pipeline executes structured JSON schema validation. Produces concise operational summaries, flags public safety risks, and provides human-readable priority justifications.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-base">Stage 3: Reveal</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Geospatial Haversine clustering spots localized civic hotspots within 600m. Hybrid formula detects duplicates without deleting citizen evidence.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-base">Stage 4: Act</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              5-stage municipal workflow: Submitted &rarr; Under Review &rarr; Assigned &rarr; In Progress &rarr; Resolved. Department delegation and immutable audit trail.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
