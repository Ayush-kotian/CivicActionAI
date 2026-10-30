import { describe, it, expect } from 'vitest';
import { evaluateDuplicateMatch, findDuplicatesInPool } from '../src/services/duplicate/duplicateService.js';

describe('Hybrid Duplicate Detection Service', () => {
  it('should identify near-identical complaints at the same location as duplicates', () => {
    const reportA = {
      complaintId: 'CAI-1010',
      description: 'Large pothole near college gate on North Avenue, bikes and scooters are slipping and falling.',
      category: 'Road Damage',
      location: { latitude: 12.9852, longitude: 77.6052 }
    };

    const reportB = {
      complaintId: 'CAI-1011',
      description: 'Huge pothole beside college entrance causing severe traffic slowdown and motorcycle accidents.',
      category: 'Road Damage',
      location: { latitude: 12.9851, longitude: 77.6053 }
    };

    const match = evaluateDuplicateMatch(reportB, reportA);

    expect(match.isDuplicate).toBe(true);
    expect(match.score).toBeGreaterThanOrEqual(60);
    expect(match.distanceMeters).toBeLessThan(50);
    expect(match.explanation).toContain('High contextual similarity');
  });

  it('should NOT flag unrelated complaints at distant locations as duplicates', () => {
    const reportA = {
      complaintId: 'CAI-1010',
      description: 'Large pothole near college gate on North Avenue.',
      category: 'Road Damage',
      location: { latitude: 12.9852, longitude: 77.6052 }
    };

    const reportC = {
      complaintId: 'CAI-1040',
      description: 'Streetlight not working on 8th Main Green Glen Park.',
      category: 'Streetlight',
      location: { latitude: 12.9781, longitude: 77.5702 }
    };

    const match = evaluateDuplicateMatch(reportC, reportA);

    expect(match.isDuplicate).toBe(false);
    expect(match.score).toBeLessThan(40);
  });

  it('should find duplicates in a pool of existing reports and sort by score', () => {
    const newReport = {
      complaintId: 'CAI-9999',
      description: 'Deep crater and road damage right outside college main gate.',
      category: 'Road Damage',
      location: { latitude: 12.9853, longitude: 77.6051 }
    };

    const pool = [
      {
        complaintId: 'CAI-1010',
        description: 'Large pothole near college gate on North Avenue.',
        category: 'Road Damage',
        location: { latitude: 12.9852, longitude: 77.6052 }
      },
      {
        complaintId: 'CAI-1040',
        description: 'Entire row of streetlights not working in Green Glen.',
        category: 'Streetlight',
        location: { latitude: 12.9781, longitude: 77.5702 }
      }
    ];

    const result = findDuplicatesInPool(newReport, pool);

    expect(result.duplicatePossible).toBe(true);
    expect(result.duplicateReportIds).toContain('CAI-1010');
    expect(result.duplicateScore).toBeGreaterThanOrEqual(60);
    expect(result.duplicateOf).toBe('CAI-1010');
    expect(Array.isArray(result.duplicateReasons)).toBe(true);
    expect(result.duplicateReasons.length).toBeGreaterThan(0);
  });

  it('should score >= 80% (Strong Duplicate) for nearly identical text and location', () => {
    const reportA = {
      complaintId: 'CAI-2001',
      description: 'Large pothole near the main road causing problems for vehicles',
      category: 'Road Damage',
      location: { latitude: 12.9852, longitude: 77.6052 }
    };

    const reportB = {
      complaintId: 'CAI-2002',
      description: 'There is a large pothole on the main road making it dangerous for vehicles',
      category: 'Road Damage',
      location: { latitude: 12.9853, longitude: 77.6054 }
    };

    const match = evaluateDuplicateMatch(reportB, reportA);
    expect(match.score).toBeGreaterThanOrEqual(80);
    expect(match.tier).toBe('Strong Duplicate');
    expect(match.isDuplicate).toBe(true);
    expect(match.reasons.some(r => r.includes('similarity'))).toBe(true);
    expect(match.reasons.some(r => r.includes('Identical civic category'))).toBe(true);
  });

  it('should score < 60% for same issue category at a distant location (>5km)', () => {
    const reportA = {
      complaintId: 'CAI-2010',
      description: 'Broken streetlight on MG Road causing dark spots at night',
      category: 'Streetlight',
      location: { latitude: 12.9750, longitude: 77.6100 }
    };

    const reportB = {
      complaintId: 'CAI-2011',
      description: 'Streetlight completely off on Outer Ring Road Bellandur',
      category: 'Streetlight',
      location: { latitude: 12.9250, longitude: 77.6750 } // ~9 km away
    };

    const match = evaluateDuplicateMatch(reportB, reportA);
    expect(match.distanceMeters).toBeGreaterThan(5000);
    expect(match.score).toBeLessThan(60);
    expect(match.isDuplicate).toBe(false);
    expect(match.tier).toBe('None');
  });

  it('should gracefully handle missing or partial coordinates with fallback weighting', () => {
    const reportNoCoordsA = {
      complaintId: 'CAI-3001',
      description: 'Overflowing garbage bin behind municipal bus stand smelling terrible',
      category: 'Waste Management'
      // No coordinates
    };

    const reportNoCoordsB = {
      complaintId: 'CAI-3002',
      description: 'Garbage bin overflowing near bus stand with waste spilled all over',
      category: 'Waste Management',
      location: { latitude: 12.9700, longitude: 77.6000 }
    };

    // Should not throw an error and compute text + category similarity
    const match = evaluateDuplicateMatch(reportNoCoordsB, reportNoCoordsA);
    expect(match).toBeDefined();
    expect(match.score).toBeGreaterThanOrEqual(50);
    expect(match.reasons.some(r => r.includes('Location coordinates not provided'))).toBe(true);
  });
});
