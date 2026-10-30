import { describe, it, expect } from 'vitest';
import { clusterReportsByProximity, buildHotspotInsights } from '../src/services/hotspot/hotspotService.js';

describe('Geospatial Hotspot & Clustering Service', () => {
  it('should cluster reports within 600m radius and generate actionable insights', () => {
    const reports = [
      {
        _id: '1',
        complaintId: 'CAI-1',
        category: 'Waterlogging',
        priority: 'HIGH',
        safetyRisk: false,
        location: { latitude: 12.9718, longitude: 77.5948, address: 'Main Road' }
      },
      {
        _id: '2',
        complaintId: 'CAI-2',
        category: 'Drainage',
        priority: 'HIGH',
        safetyRisk: false,
        location: { latitude: 12.9715, longitude: 77.5945, address: 'Main Road' }
      },
      {
        _id: '3',
        complaintId: 'CAI-3',
        category: 'Waterlogging',
        priority: 'CRITICAL',
        safetyRisk: true,
        location: { latitude: 12.9720, longitude: 77.5942, address: 'Main Road' }
      },
      {
        _id: '4',
        complaintId: 'CAI-4',
        category: 'Streetlight',
        priority: 'LOW',
        safetyRisk: false,
        location: { latitude: 12.9100, longitude: 77.5100, address: 'Distant South Ward' }
      }
    ];

    const clusters = clusterReportsByProximity(reports, 600);
    expect(clusters.length).toBe(1);
    expect(clusters[0].length).toBe(3);

    const hotspots = buildHotspotInsights(clusters);
    expect(hotspots.length).toBe(1);
    expect(hotspots[0].reportCount).toBe(3);
    expect(hotspots[0].riskLevel).toBe('CRITICAL');
    expect(hotspots[0].actionBrief).toBeDefined();
    expect(hotspots[0].actionBrief.issue).toContain('Main Road');
  });
});
