import { VALID_CATEGORIES } from '../../models/Report.js';

export function runDeterministicAnalysis(description, userCategory = 'Other') {
  const text = (description || '').toLowerCase();
  
  // 1. Identify Safety Hazard & Vulnerable Areas
  const hazardKeywords = [
    'manhole', 'open hole', 'live wire', 'electric', 'shock', 'spark', 
    'fire', 'gas leak', 'collapse', 'falling', 'accident', 'injur', 
    'drown', 'deep pit', 'exposed wire', 'open ditch'
  ];
  const vulnerableKeywords = ['school', 'hospital', 'college', 'kindergarten', 'elderly', 'children', 'gate'];
  const urgencyKeywords = ['severe', 'emergency', 'completely blocked', 'overflow', 'heavy traffic', 'danger', 'unable to pass'];
  const durationKeywords = ['days', 'weeks', 'month', 'repeated', 'recurring', 'frequently'];

  let safetyRisk = false;
  const reasons = [];

  for (const kw of hazardKeywords) {
    if (text.includes(kw)) {
      safetyRisk = true;
      reasons.push(`Direct public safety hazard detected: mentions "${kw}".`);
      break;
    }
  }

  let hasVulnerableLocation = false;
  for (const kw of vulnerableKeywords) {
    if (text.includes(kw)) {
      hasVulnerableLocation = true;
      reasons.push(`Located near vulnerable or high-density facility: "${kw}".`);
      break;
    }
  }

  let hasUrgency = false;
  for (const kw of urgencyKeywords) {
    if (text.includes(kw)) {
      hasUrgency = true;
      reasons.push(`High civic urgency: reports "${kw}".`);
      break;
    }
  }

  for (const kw of durationKeywords) {
    if (text.includes(kw)) {
      reasons.push(`Persistent or recurring condition reported ("${kw}").`);
      break;
    }
  }

  // 2. Determine Category if not explicitly provided or if set to 'Other'/'Auto Detect'
  let detectedCategory = userCategory;
  if (!detectedCategory || detectedCategory === 'Other' || detectedCategory === 'Auto Detect') {
    if (text.includes('waterlog') || text.includes('flood') || text.includes('water accumul') || text.includes('submerged')) {
      detectedCategory = 'Waterlogging';
    } else if (text.includes('pothole') || text.includes('road') || text.includes('asphalt') || text.includes('crater') || text.includes('tar')) {
      detectedCategory = 'Road Damage';
    } else if (text.includes('drain') || text.includes('sewage') || text.includes('sewer') || text.includes('gutter') || text.includes('clog')) {
      detectedCategory = 'Drainage';
    } else if (text.includes('garbage') || text.includes('waste') || text.includes('trash') || text.includes('dump') || text.includes('bin') || text.includes('debris')) {
      detectedCategory = 'Waste Management';
    } else if (text.includes('light') || text.includes('dark') || text.includes('lamp') || text.includes('pole') || text.includes('streetlight')) {
      detectedCategory = 'Streetlight';
    } else if (text.includes('pipe') || text.includes('drinking water') || text.includes('tap') || text.includes('water supply') || text.includes('contamination')) {
      detectedCategory = 'Water Supply';
    } else if (text.includes('bus') || text.includes('transit') || text.includes('transport') || text.includes('crossing') || text.includes('signal')) {
      detectedCategory = 'Public Transport';
    } else if (safetyRisk) {
      detectedCategory = 'Public Safety';
    } else {
      detectedCategory = 'Other';
    }
  }

  // 3. Calculate Deterministic Priority Score (0-100)
  let score = 40; // baseline
  if (detectedCategory === 'Public Safety') score += 25;
  if (detectedCategory === 'Waterlogging') score += 20;
  if (detectedCategory === 'Road Damage') score += 15;
  if (detectedCategory === 'Drainage') score += 15;
  if (detectedCategory === 'Water Supply') score += 15;

  if (safetyRisk) score += 35;
  if (hasVulnerableLocation) score += 15;
  if (hasUrgency) score += 15;

  score = Math.min(100, Math.max(10, score));

  let priority = 'MEDIUM';
  if (score >= 80) priority = 'CRITICAL';
  else if (score >= 60) priority = 'HIGH';
  else if (score >= 35) priority = 'MEDIUM';
  else priority = 'LOW';

  if (reasons.length === 0) {
    reasons.push(`Standard civic maintenance required for category: ${detectedCategory}.`);
  }

  // 4. Operational Summary
  const cleanFirstSentence = description.split(/[.!?]/)[0].trim();
  const summary = cleanFirstSentence.length > 15 && cleanFirstSentence.length < 140
    ? `${detectedCategory} issue reported: ${cleanFirstSentence}.`
    : `Reported ${detectedCategory} condition requiring inspection and operational intervention.`;

  // 5. Action Brief
  const actionBrief = `Deploy ${getRecommendedDepartment(detectedCategory)} response team for on-site assessment and corrective works. Address flagged safety/transit constraints promptly.`;

  // 6. Keywords
  const keywords = [detectedCategory.toLowerCase(), ...reasons.map(r => r.slice(0, 15).trim())];

  return {
    category: detectedCategory,
    categoryConfidence: 0.88,
    summary,
    priority,
    priorityScore: score,
    priorityReasons: reasons,
    safetyRisk,
    impactLevel: priority,
    keywords,
    actionBrief,
    isFallback: true
  };
}

export function getRecommendedDepartment(category) {
  switch (category) {
    case 'Road Damage': return 'Road Maintenance';
    case 'Waterlogging': return 'Drainage';
    case 'Drainage': return 'Drainage';
    case 'Waste Management': return 'Waste Management';
    case 'Streetlight': return 'Electrical';
    case 'Water Supply': return 'Water Services';
    case 'Public Safety': return 'Public Safety';
    case 'Public Transport': return 'Road Maintenance';
    default: return 'Road Maintenance';
  }
}
