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
  });
});
