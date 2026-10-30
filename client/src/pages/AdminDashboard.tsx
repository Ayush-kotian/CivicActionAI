import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Search,
  Filter,
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Layers,
  Flame,
  Map as MapIcon,
  ListFilter,
  Eye,
  RefreshCw,
  Building2,
  ExternalLink
} from 'lucide-react';
import { fetchReports, fetchDashboardStats, fetchHotspots } from '../services/api';
import { Report, DashboardStats, Hotspot, User } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { CivicMap } from '../components/CivicMap';
import { AdminLoginView } from '../components/AdminLoginView';
import { getStoredUser } from '../services/api';

interface AdminDashboardProps {
  onNavigate: (view: string, param?: string) => void;
  currentUser?: User | null;
  onAdminLogin?: (user: User) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  currentUser,
  onAdminLogin
}) => {
  const activeUser = currentUser || getStoredUser();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [department, setDepartment] = useState('ALL');
  const [duplicateOnly, setDuplicateOnly] = useState(false);
  const [sortBy, setSortBy] = useState('highest_priority');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // View mode
  const [activeTab, setActiveTab] = useState<'table' | 'map'>('table');

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsRes, statsRes, hotspotsRes] = await Promise.all([
        fetchReports({
          page,
          limit: 15,
          category,
          priority,
          status,
          department,
          duplicateOnly,
          search,
          sortBy
        }),
        fetchDashboardStats(),
        fetchHotspots()
      ]);

      setReports(reportsRes.data);
      setTotalPages(reportsRes.pagination.pages || 1);
      setStats(statsRes.data);
      setHotspots(hotspotsRes.data);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, category, priority, status, department, duplicateOnly, sortBy]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      loadData();
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  if (!activeUser || activeUser.role !== 'admin') {
    return (
      <AdminLoginView
        onLoginSuccess={(adminUser) => {
          if (onAdminLogin) onAdminLogin(adminUser);
          loadData();
        }}
        onCancel={() => onNavigate('home')}
      />
    );
  }

  return (
    <div className="py-6 sm:py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase font-mono">
            <LayoutDashboard className="w-4 h-4" />
            <span>Municipal Decision-Support Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Authority Operations Desk
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Prioritize citizen filings, review AI explainability, dispatch field departments, and clear municipal bottlenecks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('hotspots')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4" />
            <span>Hotspots & Briefs ({hotspots.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Total Reports</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            {stats?.totalReports ?? 0}
          </div>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl shadow-2xs">
          <span className="text-xs text-red-800 font-semibold uppercase tracking-wider flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
            <span>Critical</span>
          </span>
          <div className="text-2xl font-extrabold text-red-700 mt-1 font-mono">
            {stats?.critical ?? 0}
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl shadow-2xs">
          <span className="text-xs text-amber-800 font-semibold uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>High Priority</span>
          </span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1 font-mono">
            {stats?.high ?? 0}
          </div>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl shadow-2xs">
          <span className="text-xs text-purple-800 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Duplicates</span>
          </span>
          <div className="text-2xl font-extrabold text-purple-700 mt-1 font-mono">
            {stats?.potentialDuplicates ?? 0}
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl shadow-2xs">
          <span className="text-xs text-blue-800 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>In Progress</span>
          </span>
          <div className="text-2xl font-extrabold text-blue-700 mt-1 font-mono">
            {stats?.inProgress ?? 0}
          </div>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-2xs">
          <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Resolved</span>
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono">
            {stats?.resolved ?? 0}
          </div>
        </div>
      </div>

      {/* Tabs: Table View vs Interactive Map View */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'table'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Table Feed</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'map'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Geospatial Map & Hotspots</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Showing {reports.length} of {stats?.totalReports ?? 0} registered issues
        </div>
      </div>

      {/* Interactive Map View */}
      {activeTab === 'map' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Click any marker to view complaint summary or jump to full inspection.</span>
            <span className="font-semibold text-orange-700">Dashed circles indicate active multi-report hotspots.</span>
          </div>
          <CivicMap
            reports={reports}
            hotspots={hotspots}
            onSelectReport={(id) => onNavigate('report-detail', id)}
            height="h-[550px]"
          />
        </div>
      )}

      {/* Table & Filtering View */}
      {activeTab === 'table' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search input */}
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ID, description, or landmark..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Waterlogging">Waterlogging</option>
                  <option value="Road Damage">Road Damage</option>
                  <option value="Drainage">Drainage</option>
                  <option value="Waste Management">Waste Management</option>
                  <option value="Streetlight">Streetlight</option>
                  <option value="Public Safety">Public Safety</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Public Transport">Public Transport</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={priority}
                  onChange={(e) => { setPriority(e.target.value); setPage(1); }}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER REVIEW">Under Review</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-4">
                {/* Department Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Department:</span>
                  <select
                    value={department}
                    onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
                    className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Road Maintenance">Road Maintenance</option>
                    <option value="Waste Management">Waste Management</option>
                    <option value="Drainage">Drainage</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Public Safety">Public Safety</option>
                    <option value="Water Services">Water Services</option>
                  </select>
                </div>

                {/* Duplicates Only Toggle */}
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={duplicateOnly}
                    onChange={(e) => { setDuplicateOnly(e.target.checked); setPage(1); }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Duplicates Only</span>
                </label>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                >
                  <option value="highest_priority">Highest Priority First</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th scope="col" className="px-4 py-3">ID & Time</th>
                    <th scope="col" className="px-4 py-3">Category</th>
                    <th scope="col" className="px-4 py-3">Priority</th>
                    <th scope="col" className="px-4 py-3">Summary & Details</th>
                    <th scope="col" className="px-4 py-3">Location</th>
                    <th scope="col" className="px-4 py-3">Department</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                        No complaints match your current filter parameters.
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr key={report.complaintId} className="hover:bg-slate-50/80 transition">
                        {/* ID */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-blue-700 block">
                            #{report.complaintId}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-900">
                          {report.category}
                        </td>

                        {/* Priority Badge */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <PriorityBadge
                            priority={report.priority}
                            score={report.priorityScore}
                            showScore={true}
                          />
                        </td>

                        {/* Summary */}
                        <td className="px-4 py-3.5 max-w-xs">
                          <p className="text-slate-800 font-medium line-clamp-1">
                            {report.summary || report.description}
                          </p>
                          {report.duplicatePossible && (
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              {report.duplicateStatus === 'confirmed' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-300">
                                  <Layers className="w-2.5 h-2.5" /> Confirmed Duplicate (#{report.duplicateOf || report.duplicateReportIds?.[0]})
                                </span>
                              ) : report.duplicateStatus === 'rejected' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                  Distinct Issue (Reviewed)
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                                  (report.duplicateTier === 'Strong Duplicate' || report.duplicateScore >= 80)
                                    ? 'text-amber-800 bg-amber-50 border-amber-300'
                                    : 'text-purple-700 bg-purple-50 border-purple-200'
                                }`}>
                                  <Layers className="w-2.5 h-2.5" />
                                  {report.duplicateTier || (report.duplicateScore >= 80 ? 'Likely Duplicate' : 'Possible Duplicate')} ({report.duplicateScore}%)
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 text-[11px]">
                          {report.location?.address || 'Incident Pin'}
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-slate-700 font-medium">
                            {report.assignedDepartment}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={report.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => onNavigate('report-detail', report.complaintId)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition border border-blue-200 inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-white border border-slate-300 rounded-md font-medium text-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 bg-white border border-slate-300 rounded-md font-medium text-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
