import { calculateDistanceMeters } from '../../utils/geo.js';

export function clusterReportsByProximity(reports, clusterRadiusMeters = 600) {
  const clusters = [];
  const visited = new Set();

  for (let i = 0; i < reports.length; i++) {
    if (visited.has(String(reports[i]._id))) continue;

    const baseReport = reports[i];
    if (!baseReport.location || baseReport.location.latitude === undefined) continue;

    const currentCluster = [baseReport];
    visited.add(String(baseReport._id));

    for (let j = i + 1; j < reports.length; j++) {
      if (visited.has(String(reports[j]._id))) continue;
      const compareReport = reports[j];
      if (!compareReport.location || compareReport.location.latitude === undefined) continue;

      const dist = calculateDistanceMeters(
        baseReport.location.latitude,
        baseReport.location.longitude,
        compareReport.location.latitude,
        compareReport.location.longitude
      );

      if (dist <= clusterRadiusMeters) {
        currentCluster.push(compareReport);
        visited.add(String(compareReport._id));
      }
    }

    // Only qualify as a hotspot if there are at least 3 reports concentrated together
    if (currentCluster.length >= 3) {
      clusters.push(currentCluster);
    }
  }

  return clusters;
}

export function buildHotspotInsights(clusters) {
  return clusters.map((cluster, index) => {
    const reportCount = cluster.length;
    
    // Calculate centroid location
    const sumLat = cluster.reduce((sum, r) => sum + r.location.latitude, 0);
    const sumLon = cluster.reduce((sum, r) => sum + r.location.longitude, 0);
    const center = {
      latitude: Number((sumLat / reportCount).toFixed(6)),
      longitude: Number((sumLon / reportCount).toFixed(6)),
      address: cluster[0].location.address || `Area Cluster #${index + 1}`
    };

    // Category breakdown
    const categoryCounts = {};
    cluster.forEach(r => {
      const cat = r.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Sort categories by count
    const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    const primaryCategory = sortedCategories[0][0];

    // Priority breakdown & risk calculation
    const priorityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    let safetyHazardsCount = 0;

    cluster.forEach(r => {
      const prio = (r.priority || 'MEDIUM').toUpperCase();
      priorityCounts[prio] = (priorityCounts[prio] || 0) + 1;
      if (r.safetyRisk) safetyHazardsCount++;
    });

    let riskLevel = 'MEDIUM';
    if (priorityCounts.CRITICAL > 0 || safetyHazardsCount >= 2 || reportCount >= 8) {
      riskLevel = 'CRITICAL';
    } else if (priorityCounts.HIGH >= 2 || reportCount >= 5) {
      riskLevel = 'HIGH';
    }

    const title = `${center.address} — ${primaryCategory} Hotspot`;

    // Action Brief Generation
    const actionBrief = {
      issue: `Concentrated civic disruption: ${reportCount} active reports centered around ${center.address}. Dominant issue is ${primaryCategory} with ${sortedCategories[0][1]} filings.`,
      impact: `Significant pedestrian and vehicular delay with elevated safety hazard index (${safetyHazardsCount} confirmed hazard reports).`,
      evidence: `${reportCount} verified citizen reports including ${priorityCounts.CRITICAL} Critical and ${priorityCounts.HIGH} High-priority submissions.`,
      priority: riskLevel,
      recommendedAction: `Deploy cross-department inspection task force to ${center.address}. Prioritize immediate hazard mitigation and clearing of primary infrastructure blockages.`,
      reason: `Multi-report geographic cluster demonstrates systemic local failure rather than isolated incident.`
    };

    return {
      id: `hotspot-${index + 1}`,
      title,
      center,
      radiusMeters: 600,
      reportCount,
      reportIds: cluster.map(r => r.complaintId),
      categories: categoryCounts,
      priorities: priorityCounts,
      primaryCategory,
      riskLevel,
      safetyHazardsCount,
      actionBrief
    };
  });
}
