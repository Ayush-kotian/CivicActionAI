import { describe, it, expect } from 'vitest';
import { runDeterministicAnalysis } from '../src/services/ai/fallbackService.js';
import { validateAISchema } from '../src/services/ai/schema.js';

describe('AI Pipeline & Fallback Engine', () => {
  it('should detect critical public safety hazard when open manhole is reported near school', () => {
    const description = 'Open manhole left completely uncovered right in front of the school gate! Children could fall in.';
    const result = runDeterministicAnalysis(description, 'Auto Detect');

    expect(result.safetyRisk).toBe(true);
    expect(result.priority).toBe('CRITICAL');
    expect(result.priorityScore).toBeGreaterThanOrEqual(80);
    expect(result.category).toBe('Public Safety');
    expect(result.priorityReasons.length).toBeGreaterThan(0);
    expect(result.priorityReasons.some(r => r.includes('Direct public safety hazard'))).toBe(true);
  });

  it('should classify waterlogging issues and explain priority factors', () => {
    const description = 'Severe waterlogging on Main Road after heavy rain. Vehicles cannot pass.';
    const result = runDeterministicAnalysis(description, 'Waterlogging');

    expect(result.category).toBe('Waterlogging');
    expect(['CRITICAL', 'HIGH']).toContain(result.priority);
    expect(result.summary).toContain('Waterlogging');
    expect(result.actionBrief).toContain('Drainage');
  });

  it('should validate and normalize compliant AI output JSON', () => {
    const rawAiOutput = {
      category: 'Road Damage',
      categoryConfidence: 0.95,
      summary: 'Deep pothole impeding two-wheeler traffic.',
      priority: 'HIGH',
      priorityScore: 78,
      priorityReasons: ['Roadway surface crater', 'Accident risk'],
      safetyRisk: true,
      impactLevel: 'HIGH',
      keywords: ['pothole', 'road'],
      actionBrief: 'Patch road surface.'
    };

    const validation = validateAISchema(rawAiOutput);
    expect(validation.valid).toBe(true);
    expect(validation.data.category).toBe('Road Damage');
    expect(validation.data.priority).toBe('HIGH');
  });

  it('should reject or safely sanitize invalid AI output without crashing', () => {
    const invalidAiOutput = {
      category: 'NonExistentCategory',
      priority: 'SUPER_URGENT_INVALID',
      priorityScore: 999
    };

    const validation = validateAISchema(invalidAiOutput);
    expect(validation.valid).toBe(true);
    expect(validation.data.category).toBe('Other');
    expect(validation.data.priority).toBe('MEDIUM');
    expect(validation.data.priorityScore).toBe(100);
  });
});
