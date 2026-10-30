import React, { useState, useEffect } from 'react';
import {
  Flame,
  FileText,
  AlertTriangle,
  Building2,
  Layers,
  ArrowRight,
  TrendingUp,
  MapPin,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { fetchHotspots, fetchInsights } from '../services/api';
import { Hotspot, InsightsData, HotspotActionBrief } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { ActionBriefModal } from '../components/ActionBriefModal';

interface HotspotsPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const HotspotsPage: React.FC<HotspotsPageProps> = ({ onNavigate }) => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected brief modal
  const [activeBrief, setActiveBrief] = useState<{ title: string; brief: HotspotActionBrief } | null>(null);

  useEffect(() => {
    Promise.all([fetchHotspots(), fetchInsights()])
      .then(([hotspotsRes, insightsRes]) => {
        setHotspots(hotspotsRes.data);
        setInsights(insightsRes.data);
      })
      .catch((err) => console.error('Failed to load hotspots/insights:', err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        <span className="text-sm font-medium">Clustering geospatial hotspot intelligence...</span>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-orange-600 font-semibold text-xs tracking-wider uppercase font-mono">
          <Flame className="w-4 h-4" />
          <span>Stage 3: Pattern & Cluster Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Geospatial Hotspots & Action Briefs
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Detect systemic civic failures before they escalate. Hotspots cluster related reports within 600m to generate 1-minute decision briefs.
        </p>
      </div>

      {/* Top Insights Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Highest Priority Hotspot
            </span>
            <p className="text-sm font-bold text-red-700">
              {insights.highestPriorityArea}
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Most Frequent Civic Issue
            </span>
            <p className="text-sm font-bold text-blue-900">
              {insights.mostCommonIssue}
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Active Concentrated Hotspots
            </span>
            <p className="text-sm font-bold text-orange-700">
              {insights.totalActiveHotspots} Multi-Report Clusters
            </p>
          </div>
        </div>
      )}

      {/* Active Hotspot Cards List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-600" />
          <span>Active Geographic Clusters</span>
        </h2>

        {hotspots.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-500 text-xs">
            No geographic clusters currently exceed the minimum hotspot threshold (3+ correlated reports within 600m).
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {hotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-slate-300 transition space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-100 text-orange-900 border border-orange-200">
                        {hotspot.reportCount} Verified Reports
                      </span>
                      <PriorityBadge priority={hotspot.riskLevel} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{hotspot.title}</span>
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveBrief({ title: hotspot.title, brief: hotspot.actionBrief })}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View 1-Minute Action Brief</span>
                  </button>
                </div>

                {/* Categories breakdown */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-2">
                    Issue Breakdown in Cluster:
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {Object.entries(hotspot.categories).map(([cat, count]) => (
                      <span
                        key={cat}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                      >
                        {cat}: <strong className="font-mono text-blue-700">{count}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Brief Preview */}
                <div className="text-xs text-slate-700 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 space-y-1">
                  <span className="font-bold text-amber-950 uppercase tracking-wide block">
                    Recommended Immediate Action:
                  </span>
                  <p className="leading-relaxed font-sans">{hotspot.actionBrief.recommendedAction}</p>
                </div>

                {/* Linked Complaint IDs */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500">
                    Linked Filings ({hotspot.reportIds.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {hotspot.reportIds.slice(0, 5).map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onNavigate('report-detail', id)}
                        className="font-mono text-[11px] font-bold text-blue-700 bg-slate-100 hover:bg-blue-50 px-2 py-0.5 rounded border border-slate-200 transition"
                      >
                        #{id}
                      </button>
                    ))}
                    {hotspot.reportIds.length > 5 && (
                      <span className="text-[11px] text-slate-400 self-center">
                        +{hotspot.reportIds.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recurring Issues Section */}
      {insights && insights.recurringIssues && insights.recurringIssues.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>Recurring Municipal Patterns (5+ Filings)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.recurringIssues.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{item.category}</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {item.count} Reports
                  </span>
                </div>
                <p className="text-slate-600 font-sans">{item.insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Brief Dialog Modal */}
      {activeBrief && (
        <ActionBriefModal
          isOpen={true}
          onClose={() => setActiveBrief(null)}
          title={activeBrief.title}
          brief={activeBrief.brief}
        />
      )}
    </div>
  );
};
