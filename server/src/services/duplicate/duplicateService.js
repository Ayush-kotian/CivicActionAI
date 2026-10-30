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
 * Evaluates duplicate similarity between a new report and existing reports
 * Formula:
 * duplicateScore = (textSim * 0.55) + (geoProx * 0.30) + (catSim * 0.15)
 */
export function evaluateDuplicateMatch(newReport, existingReport) {
  const textSim = calculateTextSimilarity(newReport.description, existingReport.description);

  let distanceMeters = Infinity;
  let geoProx = 0;
  if (newReport.location && existingReport.location) {
    distanceMeters = calculateDistanceMeters(
      newReport.location.latitude,
      newReport.location.longitude,
      existingReport.location.latitude,
      existingReport.location.longitude
    );
    geoProx = calculateProximityScore(distanceMeters);
  }

  const catSim = calculateCategorySimilarity(
    newReport.category || newReport.aiCategory,
    existingReport.category || existingReport.aiCategory
  );

  const duplicateScoreFloat = (textSim * 0.55) + (geoProx * 0.30) + (catSim * 0.15);
  const duplicateScorePercent = Math.round(duplicateScoreFloat * 100);

  const isDuplicate = duplicateScorePercent >= 60; // 60%+ threshold

  let explanation = '';
  if (isDuplicate) {
    const distText = distanceMeters < 1000 
      ? `${Math.round(distanceMeters)}m away` 
      : `${(distanceMeters / 1000).toFixed(1)}km away`;
    explanation = `High contextual similarity (${duplicateScorePercent}%) to complaint #${existingReport.complaintId}. Both describe related ${existingReport.category} issues ${distText}.`;
  }

  return {
    isDuplicate,
    score: duplicateScorePercent,
    textSimilarity: Math.round(textSim * 100),
    geoProximityScore: Math.round(geoProx * 100),
    categorySimilarity: Math.round(catSim * 100),
    distanceMeters: Math.round(distanceMeters),
    targetComplaintId: existingReport.complaintId,
    targetReportId: existingReport._id,
    explanation
  };
}

/**
 * Searches a collection of existing reports for potential duplicates
 */
export function findDuplicatesInPool(newReport, existingReports = []) {
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

  return {
    duplicatePossible: matches.length > 0,
    duplicateReportIds: matches.map(m => m.targetComplaintId),
    duplicateScore: matches.length > 0 ? matches[0].score : 0,
    duplicateExplanation: matches.length > 0 ? matches[0].explanation : 'No duplicate reports detected within operational threshold.',
    allMatches: matches
  };
}
