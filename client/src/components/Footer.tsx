import React from 'react';
import { Building2, Shield, Info, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight">CivicActionAI</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs max-w-md">
              From Complaints to Action. Transforming fragmented citizen reports into prioritized, explainable, and trackable municipal interventions.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Synthetic test dataset utilized &bull; No personal data stored</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Platform Workflow
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>1. Capture & Geo-Pin</li>
              <li>2. AI Categorization & Prioritization</li>
              <li>3. Duplicate & Hotspot Detection</li>
              <li>4. Department Assignment & Resolution</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Honesty & Prototype Notice
            </h4>
            <div className="space-y-2 text-[11px] text-slate-400 leading-normal">
              <p className="flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Working hackathon prototype demonstrating real AI decision pipelines, hybrid duplicate scoring, and workflow audit trails.</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} CivicActionAI &bull; AI for Civic Impact
          </div>
          <div className="flex items-center gap-1">
            <span>Built for PromptWars x ASTRA Hackathon</span>
            <Heart className="w-3 h-3 text-red-500 inline fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
