export type CivicCategory =
  | 'Waterlogging'
  | 'Road Damage'
  | 'Waste Management'
  | 'Streetlight'
  | 'Drainage'
  | 'Public Safety'
  | 'Water Supply'
  | 'Public Transport'
  | 'Other';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ReportStatus =
  | 'SUBMITTED'
  | 'UNDER REVIEW'
  | 'ASSIGNED'
  | 'IN PROGRESS'
  | 'RESOLVED';

export type Department =
  | 'Road Maintenance'
  | 'Waste Management'
  | 'Drainage'
  | 'Electrical'
  | 'Public Safety'
  | 'Water Services'
  | 'Unassigned';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export interface StatusHistoryItem {
  status: ReportStatus;
  changedBy: string;
  timestamp: string;
  note: string;
}

export interface Report {
  _id: string;
  complaintId: string;
  description: string;
  category: CivicCategory;
  aiCategory?: CivicCategory;
  aiCategoryConfidence?: number;
  summary: string;
  imageUrl?: string | null;
  location: LocationData;
  priority: PriorityLevel;
  priorityScore: number;
  priorityReasons: string[];
  safetyRisk: boolean;
  impactLevel: PriorityLevel;
  keywords: string[];
  duplicatePossible: boolean;
  duplicateReportIds: string[];
  duplicateScore: number;
  duplicateExplanation: string;
  actionBrief: string;
  status: ReportStatus;
  assignedDepartment: Department;
  assignedTo?: string;
  statusHistory: StatusHistoryItem[];
  relatedDuplicates?: Partial<Report>[];
  createdAt: string;
  updatedAt: string;
}

export interface HotspotActionBrief {
  issue: string;
  impact: string;
  evidence: string;
  priority: PriorityLevel;
  recommendedAction: string;
  reason: string;
}

export interface Hotspot {
  id: string;
  title: string;
  center: LocationData;
  radiusMeters: number;
  reportCount: number;
  reportIds: string[];
  categories: Record<string, number>;
  priorities: Record<string, number>;
  primaryCategory: string;
  riskLevel: PriorityLevel;
  safetyHazardsCount: number;
  actionBrief: HotspotActionBrief;
}

export interface DashboardStats {
  totalReports: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  inProgress: number;
  resolved: number;
  potentialDuplicates: number;
  activeHotspots: number;
  statusDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  departmentDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
}

export interface RecurringIssue {
  category: string;
  count: number;
  insight: string;
}

export interface InsightsData {
  highestPriorityArea: string;
  mostCommonIssue: string;
  recurringIssues: RecurringIssue[];
  emergingHotspot: Hotspot | null;
  totalActiveHotspots: number;
}
