import { calculateTextSimilarity } from '../../utils/similarity.js';
import { calculateDistanceMeters, calculateProximityScore } from '../../utils/geo.js';

export function calculateCategorySimilarity(catA, catB) {
  if (!catA || !catB) return 0;
  if (catA.toLowerCase() === catB.toLowerCase()) return 1.0;

  // Correlated civic categories
  const relatedGroups = [
    ['waterlogging', 'drainage', 'water supply'],
    ['road damage', 'public safety', 'public transport'],
    ['waste management', 'drainage']
  ];

  const lowerA = catA.toLowerCase();
  const lowerB = catB.toLowerCase();

  for (const group of relatedGroups) {
    if (group.includes(lowerA) && group.includes(lowerB)) {
      return 0.6;
    }
  }

  return 0.0;
}

/**
 * Evaluates duplicate similarity between a new report and an existing report
 * Handles both coordinate-enabled and coordinate-missing edge cases.
 */
export function evaluateDuplicateMatch(newReport, existingReport) {
  const textSim = calculateTextSimilarity(newReport.description, existingReport.description);

  const hasCoordsNew = newReport.location && typeof newReport.location.latitude === 'number';
  const hasCoordsOld = existingReport.location && typeof existingReport.location.latitude === 'number';

  let distanceMeters = Infinity;
  let geoProx = 0;
  let hasGeo = false;

  if (hasCoordsNew && hasCoordsOld) {
    distanceMeters = calculateDistanceMeters(
      newReport.location.latitude,
      newReport.location.longitude,
      existingReport.location.latitude,
      existingReport.location.longitude
    );
    geoProx = calculateProximityScore(distanceMeters);
    hasGeo = true;
  }

  const catA = newReport.category || newReport.aiCategory || 'Other';
  const catB = existingReport.category || existingReport.aiCategory || 'Other';
  const catSim = calculateCategorySimilarity(catA, catB);

  // Score formula
  let duplicateScoreFloat = 0;
  if (hasGeo) {
    // 50% Text, 35% Geo-Proximity, 15% Category
    duplicateScoreFloat = (textSim * 0.50) + (geoProx * 0.35) + (catSim * 0.15);
  } else {
    // Fallback when coordinates are missing: 75% Text, 25% Category
    duplicateScoreFloat = (textSim * 0.75) + (catSim * 0.25);
  }

  const duplicateScorePercent = Math.min(100, Math.max(0, Math.round(duplicateScoreFloat * 100)));

  // Tier classification based on PRD requirements:
  // 80-100%: Strong duplicate
  // 60-79%: Possible duplicate
  // Below 60%: Probably not duplicate
  let tier = 'None';
  let duplicateStatus = 'none';
  const isDuplicate = duplicateScorePercent >= 60;

  if (duplicateScorePercent >= 80) {
    tier = 'Strong Duplicate';
    duplicateStatus = 'possible';
  } else if (duplicateScorePercent >= 60) {
    tier = 'Possible Duplicate';
    duplicateStatus = 'possible';
  }

  // Explainable reasons list
  const reasons = [];
  const textPercent = Math.round(textSim * 100);

  if (textPercent >= 50) {
    reasons.push(`High textual and semantic similarity (${textPercent}%) in issue description`);
  } else if (textPercent >= 30) {
    reasons.push(`Moderate textual correlation (${textPercent}%) with shared civic keywords`);
  }

  if (catSim === 1.0) {
    reasons.push(`Identical civic category: ${catA}`);
  } else if (catSim > 0) {
    reasons.push(`Directly correlated categories: ${catA} and ${catB}`);
  }

  if (hasGeo) {
    const distText = distanceMeters < 1000 
      ? `${Math.round(distanceMeters)}m` 
      : `${(distanceMeters / 1000).toFixed(1)}km`;

    if (distanceMeters <= 200) {
      reasons.push(`Located in immediate proximity (approx. ${distText} away)`);
    } else if (distanceMeters <= 600) {
      reasons.push(`Located within the same neighborhood cluster (approx. ${distText} away)`);
    } else {
      reasons.push(`Separated by ${distText} across municipal boundaries`);
    }
  } else {
    reasons.push('Location coordinates not provided; evaluated via text and category signals');
  }

  let distLabel = hasGeo && distanceMeters < Infinity
    ? (distanceMeters < 1000 ? `${Math.round(distanceMeters)}m away` : `${(distanceMeters / 1000).toFixed(1)}km away`)
    : 'in the vicinity';

  const explanation = isDuplicate
    ? `High contextual similarity (${duplicateScorePercent}%) to complaint #${existingReport.complaintId}. Both describe related ${existingReport.category} issues ${distLabel}.`
    : 'No significant duplicate relationship identified.';

  const singleReason = isDuplicate
    ? `Both complaints report ${existingReport.category} at approximately the same location (${distLabel}).`
    : '';

  return {
    isDuplicate,
    score: duplicateScorePercent,
    tier,
    duplicateStatus,
    textSimilarity: textPercent,
    geoProximityScore: Math.round(geoProx * 100),
    categorySimilarity: Math.round(catSim * 100),
    distanceMeters: hasGeo ? Math.round(distanceMeters) : null,
    targetComplaintId: existingReport.complaintId,
    targetReportId: existingReport._id,
    targetDescription: existingReport.description,
    targetCategory: existingReport.category,
    targetStatus: existingReport.status,
    explanation,
    reason: singleReason,
    reasons
  };
}

/**
 * Searches a pool of existing reports for potential duplicates
 */
export function findDuplicatesInPool(newReport, existingReports = []) {
  if (!existingReports || existingReports.length === 0) {
    return {
      duplicatePossible: false,
      duplicateStatus: 'none',
      duplicateTier: 'None',
      duplicateOf: null,
      duplicateReportIds: [],
      duplicateScore: 0,
      duplicateExplanation: 'No prior complaints exist in system.',
      duplicateReason: '',
      duplicateReasons: [],
      allMatches: []
    };
  }

  const matches = [];

  for (const report of existingReports) {
    // Skip comparing report to itself
    const sameId = report._id && newReport._id && String(report._id) === String(newReport._id);
    const sameComplaintId = report.complaintId && newReport.complaintId && report.complaintId === newReport.complaintId;
    if (sameId || sameComplaintId) {
      continue;
    }

    const match = evaluateDuplicateMatch(newReport, report);
    if (match.isDuplicate) {
      matches.push(match);
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  const topMatch = matches[0];

  return {
    duplicatePossible: matches.length > 0,
    duplicateStatus: topMatch ? topMatch.duplicateStatus : 'none',
    duplicateTier: topMatch ? topMatch.tier : 'None',
    duplicateOf: topMatch ? topMatch.targetComplaintId : null,
    duplicateReportIds: matches.map(m => m.targetComplaintId),
    duplicateScore: topMatch ? topMatch.score : 0,
    duplicateExplanation: topMatch ? topMatch.explanation : 'No duplicate reports detected within operational threshold.',
    duplicateReason: topMatch ? topMatch.reason : '',
    duplicateReasons: topMatch ? topMatch.reasons : [],
    allMatches: matches
  };
}
