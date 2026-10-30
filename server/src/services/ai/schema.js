import { VALID_CATEGORIES, VALID_PRIORITIES } from '../../models/Report.js';

export function validateAISchema(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'AI output is not a valid JSON object' };
  }

  // Validate or normalize Category
  let category = data.category;
  if (!category || !VALID_CATEGORIES.includes(category)) {
    // If category has partial match
    const matched = VALID_CATEGORIES.find(c =>
      c.toLowerCase() === (category || '').toLowerCase()
    );
    category = matched || 'Other';
  }

  // Validate or normalize Priority
  let priority = (data.priority || '').toUpperCase();
  if (!VALID_PRIORITIES.includes(priority)) {
    priority = 'MEDIUM';
  }

  // Normalize Priority Score
  let priorityScore = Number(data.priorityScore);
  if (isNaN(priorityScore) || priorityScore < 0) priorityScore = 50;
  if (priorityScore > 100) priorityScore = 100;

  // Validate reasons
  let priorityReasons = Array.isArray(data.priorityReasons)
    ? data.priorityReasons.filter(r => typeof r === 'string' && r.trim().length > 0)
    : [];
  if (priorityReasons.length === 0 && typeof data.priorityReason === 'string') {
    priorityReasons = [data.priorityReason];
  }
  if (priorityReasons.length === 0) {
    priorityReasons = ['Evaluated according to standard municipal priority matrix.'];
  }

  // Validate Safety Risk
  const safetyRisk = Boolean(data.safetyRisk);

  // Validate Impact Level
  let impactLevel = (data.impactLevel || '').toUpperCase();
  if (!VALID_PRIORITIES.includes(impactLevel)) {
    impactLevel = priority;
  }

  // Summary
  const summary = (typeof data.summary === 'string' && data.summary.trim().length > 0)
    ? data.summary.trim()
    : 'Citizen reported municipal issue requiring department review.';

  // Keywords
  const keywords = Array.isArray(data.keywords)
    ? data.keywords.map(k => String(k).trim()).filter(Boolean)
    : [];

  // Action brief
  const actionBrief = (typeof data.actionBrief === 'string' && data.actionBrief.trim().length > 0)
    ? data.actionBrief.trim()
    : 'Conduct site inspection and deploy maintenance crew to remediate the reported condition.';

  return {
    valid: true,
    data: {
      category,
      categoryConfidence: typeof data.categoryConfidence === 'number' ? Math.min(1, Math.max(0, data.categoryConfidence)) : 0.92,
      summary,
      priority,
      priorityScore,
      priorityReasons,
      safetyRisk,
      impactLevel,
      keywords,
      actionBrief
    }
  };
}
