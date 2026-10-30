import React, { useState } from 'react';
import {
  FilePlus2,
  Sparkles,
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Layers,
  FileText
} from 'lucide-react';
import { LocationPicker } from '../components/LocationPicker';
import { PriorityBadge } from '../components/PriorityBadge';
import { DuplicateAlert } from '../components/DuplicateAlert';
import { submitReport } from '../services/api';
import { Report, CivicCategory } from '../types';

interface SubmitReportProps {
  onNavigate: (view: string, param?: string) => void;
}

const CATEGORY_OPTIONS: (CivicCategory | 'Auto Detect')[] = [
  'Auto Detect',
  'Waterlogging',
  'Road Damage',
  'Drainage',
  'Waste Management',
  'Streetlight',
  'Public Safety',
  'Water Supply',
  'Public Transport',
  'Other'
];

export const SubmitReport: React.FC<SubmitReportProps> = ({ onNavigate }) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Auto Detect');
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);
  const [address, setAddress] = useState('Main Road / Commercial Cross');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);
  const [copied, setCopied] = useState(false);

  // Quick pre-fill buttons for test scenarios
  const handlePreFill = (text: string, cat: string, lat: number, lon: number, addr: string) => {
    setDescription(text);
    setCategory(cat);
    setLatitude(lat);
    setLongitude(lon);
    setAddress(addr);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5 MB limit. Please select a smaller photo.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (description.trim().length < 5) {
      setErrorMessage('Please provide a clear description (at least 5 characters).');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('category', category === 'Auto Detect' ? 'Other' : category);
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
      formData.append('address', address.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await submitReport(formData);
      setSubmittedReport(res.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-8">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase">
          <FilePlus2 className="w-4 h-4" />
          <span>Stage 1: Citizen Intake</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Submit a Civic Complaint
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Report road damage, waterlogging, overflowing waste, or broken public infrastructure. Our AI pipeline analyzes and prioritizes your filing immediately.
        </p>
      </div>

      {/* Pre-fill Quick Test Scenarios */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-blue-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Judge / Evaluator Demo Quick Pre-fills:</span>
          </span>
          <span className="text-blue-700 font-medium">Click any to auto-fill</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() =>
              handlePreFill(
                'Large pothole near the main road causing problems for vehicles.',
                'Road Damage',
                12.9716,
                77.5946,
                'Main Road / Commercial Cross'
              )
            }
            className="px-2.5 py-1 bg-white hover:bg-blue-100 border border-blue-400 rounded-md text-blue-900 font-bold transition shadow-2xs"
          >
            📋 Demo A: Pothole on Main Road
          </button>
          <button
            type="button"
            onClick={() =>
              handlePreFill(
                'There is a large pothole on the main road making it dangerous for vehicles.',
                'Road Damage',
                12.9718,
                77.5948,
                'Main Road / Commercial Cross'
              )
            }
            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 border border-amber-400 rounded-md text-amber-950 font-bold transition shadow-2xs"
          >
            ⚡ Demo B: Submit Duplicate of A
          </button>
          <button
            type="button"
            onClick={() =>
              handlePreFill(
                'Severe waterlogging near the main road after yesterday rain. Vehicles are struggling to pass and water has entered nearby storefronts.',
                'Waterlogging',
                12.9718,
                77.5948,
                'Main Road / Commercial Cross'
              )
            }
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-md text-slate-800 font-medium transition shadow-2xs"
          >
            🌊 Waterlogging Cluster
          </button>
          <button
            type="button"
            onClick={() =>
              handlePreFill(
                'Open manhole left completely uncovered right in front of the school gate! Immediate hazard during student morning arrival.',
                'Public Safety',
                12.9750,
                77.6100,
                'St. Jude School Road Gate 3'
              )
            }
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-md text-slate-800 font-medium transition shadow-2xs"
          >
            ⚠️ Open Manhole (Safety)
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-xl text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Submission Error</h4>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Description Field */}
        <div>
          <label htmlFor="issue-description" className="block text-sm font-semibold text-slate-800 mb-1">
            Describe the Problem <span className="text-red-500">*</span>
          </label>
          <textarea
            id="issue-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Flooded roadway near bus stand, overflowing garbage bins, open manhole, flickering streetlight..."
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition leading-relaxed"
            required
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Be as descriptive as possible to assist AI prioritization.</span>
            <span>{description.length} chars</span>
          </div>
        </div>

        {/* Category & Photo Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="issue-category" className="block text-sm font-semibold text-slate-800 mb-1">
              Issue Category
            </label>
            <select
              id="issue-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'Auto Detect' ? '✨ Auto Detect with AI' : cat}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Select a category or let AI classify automatically.
            </span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Attach Photo (Optional)
            </label>
            {!imagePreview ? (
              <label
                htmlFor="photo-upload"
                className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl text-xs text-slate-600 hover:text-blue-700 cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition h-[42px]"
              >
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Upload JPG, PNG or WEBP (&le; 5 MB)</span>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 truncate">
                  <img src={imagePreview} alt="Preview" className="w-8 h-8 rounded object-cover border" />
                  <span className="text-xs text-slate-700 truncate">{imageFile?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Location Picker */}
        <div className="pt-2 border-t border-slate-100">
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            address={address}
            onChange={(lat, lon, addr) => {
              setLatitude(lat);
              setLongitude(lon);
              setAddress(addr);
            }}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Pipeline Analyzing Report...</span>
              </>
            ) : (
              <>
                <FilePlus2 className="w-4 h-4" />
                <span>Submit & Analyze Report</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Post-Submission AI Analysis Modal Card */}
      {submittedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                <div>
                  <h3 className="text-lg font-bold">Complaint Recorded & Analyzed</h3>
                  <span className="text-xs text-emerald-200">AI understanding pipeline completed</span>
                </div>
              </div>
              <button
                onClick={() => setSubmittedReport(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Complaint ID Badge */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Your Tracking Reference</span>
                  <div className="text-xl font-extrabold text-blue-700 font-mono mt-0.5">
                    #{submittedReport.complaintId}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(submittedReport.complaintId)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy ID'}</span>
                </button>
              </div>

              {/* Safety Hazard Alert */}
              {submittedReport.safetyRisk && (
                <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl text-red-900 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold uppercase tracking-wide">Public Safety Hazard Flagged</span>
                    <p className="mt-0.5 text-red-800">
                      This issue contains high physical hazard indicators and has been escalated for priority dispatch.
                    </p>
                  </div>
                </div>
              )}

              {/* AI Understanding Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border rounded-xl">
                  <span className="text-slate-500 font-semibold block">AI Category Classification</span>
                  <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                    {submittedReport.category}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border rounded-xl">
                  <span className="text-slate-500 font-semibold block">Assigned Priority Level</span>
                  <div className="mt-1">
                    <PriorityBadge
                      priority={submittedReport.priority}
                      score={submittedReport.priorityScore}
                      showScore={true}
                    />
                  </div>
                </div>
              </div>

              {/* AI Operational Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>AI Operational Summary</span>
                </h4>
                <p className="text-xs text-slate-800 bg-blue-50/50 p-3 rounded-lg border border-blue-100 leading-relaxed font-sans">
                  {submittedReport.summary}
                </p>
              </div>

              {/* Explainable Prioritization Reasons */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Explainable Priority Reasoning (Why this score?)
                </h4>
                <ul className="space-y-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {submittedReport.priorityReasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">&bull;</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Duplicate check alert if duplicate flagged */}
              {submittedReport.duplicatePossible && (
                <DuplicateAlert
                  duplicateScore={submittedReport.duplicateScore}
                  duplicateReportIds={submittedReport.duplicateReportIds}
                  duplicateExplanation={submittedReport.duplicateExplanation}
                  duplicateStatus={submittedReport.duplicateStatus}
                  duplicateTier={submittedReport.duplicateTier}
                  duplicateOf={submittedReport.duplicateOf}
                  duplicateReason={submittedReport.duplicateReason}
                  duplicateReasons={submittedReport.duplicateReasons}
                  isCitizenView={true}
                  onViewReport={(id) => onNavigate('track', id)}
                />
              )}
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubmittedReport(null);
                  setDescription('');
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
              >
                Submit Another Report
              </button>

              <button
                type="button"
                onClick={() => onNavigate('track', submittedReport.complaintId)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <span>Track Complaint Progress</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
