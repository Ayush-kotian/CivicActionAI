import mongoose from 'mongoose';

export const VALID_CATEGORIES = [
  'Waterlogging',
  'Road Damage',
  'Waste Management',
  'Streetlight',
  'Drainage',
  'Public Safety',
  'Water Supply',
  'Public Transport',
  'Other'
];

export const VALID_PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export const VALID_STATUSES = [
  'SUBMITTED',
  'UNDER REVIEW',
  'ASSIGNED',
  'IN PROGRESS',
  'RESOLVED'
];

export const VALID_DUPLICATE_STATUSES = [
  'none',
  'possible',
  'confirmed',
  'rejected'
];

export const VALID_DEPARTMENTS = [
  'Road Maintenance',
  'Waste Management',
  'Drainage',
  'Electrical',
  'Public Safety',
  'Water Services',
  'Unassigned'
];

const StatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: VALID_STATUSES,
    required: true
  },
  changedBy: {
    type: String,
    default: 'System Authority'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  }
}, { _id: false });

const ReportSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: VALID_CATEGORIES,
    required: true
  },
  aiCategory: {
    type: String,
    enum: VALID_CATEGORIES
  },
  aiCategoryConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.9
  },
  summary: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: null
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      default: 'Location specified by coordinates'
    }
  },
  priority: {
    type: String,
    enum: VALID_PRIORITIES,
    default: 'MEDIUM',
    index: true
  },
  priorityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  priorityReasons: {
    type: [String],
    default: []
  },
  safetyRisk: {
    type: Boolean,
    default: false
  },
  impactLevel: {
    type: String,
    enum: VALID_PRIORITIES,
    default: 'MEDIUM'
  },
  keywords: {
    type: [String],
    default: []
  },
  duplicatePossible: {
    type: Boolean,
    default: false
  },
  duplicateStatus: {
    type: String,
    enum: VALID_DUPLICATE_STATUSES,
    default: 'none',
    index: true
  },
  duplicateTier: {
    type: String,
    enum: ['Strong Duplicate', 'Possible Duplicate', 'None'],
    default: 'None'
  },
  duplicateOf: {
    type: String,
    default: null,
    index: true
  },
  duplicateReportIds: {
    type: [String],
    default: []
  },
  duplicateScore: {
    type: Number,
    default: 0
  },
  duplicateExplanation: {
    type: String,
    default: ''
  },
  duplicateReason: {
    type: String,
    default: ''
  },
  duplicateReasons: {
    type: [String],
    default: []
  },
  actionBrief: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: VALID_STATUSES,
    default: 'SUBMITTED',
    index: true
  },
  assignedDepartment: {
    type: String,
    enum: VALID_DEPARTMENTS,
    default: 'Unassigned',
    index: true
  },
  assignedTo: {
    type: String,
    default: ''
  },
  statusHistory: {
    type: [StatusHistorySchema],
    default: []
  },
  source: {
    type: String,
    default: 'CITIZEN_WEB'
  },
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  citizenName: {
    type: String,
    default: ''
  },
  citizenEmail: {
    type: String,
    default: '',
    index: true
  },
  citizenPhone: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound indexes for rapid query performance
ReportSchema.index({ createdAt: -1 });
ReportSchema.index({ status: 1, priority: 1 });
ReportSchema.index({ category: 1 });

export const Report = mongoose.model('Report', ReportSchema);
