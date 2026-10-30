import type { Report, DashboardStats, Hotspot, InsightsData } from '../types';

const BASE_URL = '/api';

export async function submitReport(formData: FormData): Promise<{ success: boolean; data: Report; message?: string }> {
  const response = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    body: formData
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to submit report');
  }
  return json;
}

export async function fetchReports(params: {
  page?: number;
  limit?: number;
  category?: string;
  priority?: string;
  status?: string;
  department?: string;
  duplicateOnly?: boolean;
  search?: string;
  sortBy?: string;
} = {}): Promise<{
  success: boolean;
  data: Report[];
  pagination: { page: number; limit: number; total: number; pages: number };
}> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.category && params.category !== 'ALL') query.append('category', params.category);
  if (params.priority && params.priority !== 'ALL') query.append('priority', params.priority);
  if (params.status && params.status !== 'ALL') query.append('status', params.status);
  if (params.department && params.department !== 'ALL') query.append('department', params.department);
  if (params.duplicateOnly) query.append('duplicateOnly', 'true');
  if (params.search) query.append('search', params.search);
  if (params.sortBy) query.append('sortBy', params.sortBy);

  const response = await fetch(`${BASE_URL}/reports?${query.toString()}`);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to fetch reports');
  }
  return json;
}

export async function fetchReportById(id: string): Promise<{ success: boolean; data: Report }> {
  const response = await fetch(`${BASE_URL}/reports/${encodeURIComponent(id)}`);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || `Failed to fetch report #${id}`);
  }
  return json;
}

export async function updateReportStatus(
  id: string,
  status: string,
  note?: string,
  changedBy?: string
): Promise<{ success: boolean; data: Report }> {
  const response = await fetch(`${BASE_URL}/reports/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note, changedBy })
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to update status');
  }
  return json;
}

export async function assignReport(
  id: string,
  department: string,
  assignedTo?: string,
  note?: string
): Promise<{ success: boolean; data: Report }> {
  const response = await fetch(`${BASE_URL}/reports/${encodeURIComponent(id)}/assign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ department, assignedTo, note })
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to assign report');
  }
  return json;
}

export async function updateDuplicateStatus(
  id: string,
  status: 'confirmed' | 'rejected' | 'possible' | 'none',
  note?: string
): Promise<{ success: boolean; data: Report }> {
  const response = await fetch(`${BASE_URL}/reports/${encodeURIComponent(id)}/duplicate-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note })
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to update duplicate status');
  }
  return json;
}

export async function fetchTracking(complaintId: string): Promise<{ success: boolean; data: Report }> {
  const cleanId = complaintId.trim().toUpperCase();
  const response = await fetch(`${BASE_URL}/reports/tracking/${encodeURIComponent(cleanId)}`);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || `No record found for ID ${complaintId}`);
  }
  return json;
}

export async function fetchDashboardStats(): Promise<{ success: boolean; data: DashboardStats }> {
  const response = await fetch(`${BASE_URL}/dashboard/stats`);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to fetch dashboard stats');
  }
  return json;
}

export async function fetchHotspots(): Promise<{ success: boolean; count: number; data: Hotspot[] }> {
  const response = await fetch(`${BASE_URL}/dashboard/hotspots`);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to fetch hotspots');
  }
  return json;
}

export async function fetchInsights(): Promise<{ success: boolean; data: InsightsData }> {
  const response = await fetch(`${BASE_URL}/dashboard/insights`);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to fetch insights');
  }
  return json;
}
