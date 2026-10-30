import mongoose from 'mongoose';

const HotspotSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  center: {
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
      default: ''
    }
  },
  radiusMeters: {
    type: Number,
    default: 500
  },
  reportCount: {
    type: Number,
    default: 0
  },
  reportIds: {
    type: [String],
    default: []
  },
  categories: {
    type: Map,
    of: Number,
    default: {}
  },
  priorities: {
    type: Map,
    of: Number,
    default: {}
  },
  primaryCategory: {
    type: String,
    default: 'General Civic Issue'
  },
  riskLevel: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM'
  },
  actionBrief: {
    issue: { type: String, default: '' },
    impact: { type: String, default: '' },
    evidence: { type: String, default: '' },
    priority: { type: String, default: 'MEDIUM' },
    recommendedAction: { type: String, default: '' },
    reason: { type: String, default: '' }
  }
}, {
  timestamps: true
});

export const Hotspot = mongoose.model('Hotspot', HotspotSchema);
