import { Report } from '../models/Report.js';
import { clusterReportsByProximity, buildHotspotInsights } from '../services/hotspot/hotspotService.js';

export async function getDashboardStats(req, res, next) {
  try {
    const [
      total,
      critical,
      high,
      medium,
      low,
      inProgress,
      resolved,
      submitted,
      underReview,
      assigned,
      duplicates,
      allReports
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ priority: 'CRITICAL' }),
      Report.countDocuments({ priority: 'HIGH' }),
      Report.countDocuments({ priority: 'MEDIUM' }),
      Report.countDocuments({ priority: 'LOW' }),
      Report.countDocuments({ status: 'IN PROGRESS' }),
      Report.countDocuments({ status: 'RESOLVED' }),
      Report.countDocuments({ status: 'SUBMITTED' }),
      Report.countDocuments({ status: 'UNDER REVIEW' }),
      Report.countDocuments({ status: 'ASSIGNED' }),
      Report.countDocuments({ duplicatePossible: true }),
      Report.find({}, 'category priority status assignedDepartment location createdAt').lean()
    ]);

    // Compute dynamic hotspots count from actual report coordinates
    const clusters = clusterReportsByProximity(allReports, 600);
    const hotspots = buildHotspotInsights(clusters);

    // Dynamic Category distribution
    const categoryDistribution = {};
    const departmentDistribution = {};
    const statusDistribution = {
      SUBMITTED: submitted,
      'UNDER REVIEW': underReview,
      ASSIGNED: assigned,
      'IN PROGRESS': inProgress,
      RESOLVED: resolved
    };

    allReports.forEach(r => {
      const cat = r.category || 'Other';
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;

      const dept = r.assignedDepartment || 'Unassigned';
      departmentDistribution[dept] = (departmentDistribution[dept] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalReports: total,
        critical,
        high,
        medium,
        low,
        inProgress,
        resolved,
        potentialDuplicates: duplicates,
        activeHotspots: hotspots.length,
        statusDistribution,
        categoryDistribution,
        departmentDistribution,
        priorityDistribution: {
          CRITICAL: critical,
          HIGH: high,
          MEDIUM: medium,
          LOW: low
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getHotspots(req, res, next) {
  try {
    const allReports = await Report.find(
      { status: { $ne: 'RESOLVED' } },
      'complaintId description category priority safetyRisk location createdAt'
    ).lean();

    const clusters = clusterReportsByProximity(allReports, 600);
    const hotspots = buildHotspotInsights(clusters);

    res.json({
      success: true,
      count: hotspots.length,
      data: hotspots
    });
  } catch (error) {
    next(error);
  }
}

export async function getInsights(req, res, next) {
  try {
    const allReports = await Report.find(
      {},
      'complaintId description category priority safetyRisk location status'
    ).lean();

    const clusters = clusterReportsByProximity(allReports, 600);
    const hotspots = buildHotspotInsights(clusters);

    // 1. Highest Priority Area
    let highestPriorityArea = 'None detected';
    if (hotspots.length > 0) {
      const topHotspot = [...hotspots].sort((a, b) => {
        const riskWeights = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (riskWeights[b.riskLevel] * 10 + b.reportCount) - (riskWeights[a.riskLevel] * 10 + a.reportCount);
      })[0];
      highestPriorityArea = `${topHotspot.center.address} (${topHotspot.reportCount} reports, Risk: ${topHotspot.riskLevel})`;
    }

    // 2. Most Common Issue
    const catCounts = {};
    allReports.forEach(r => {
      catCounts[r.category] = (catCounts[r.category] || 0) + 1;
    });
    const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    const mostCommonIssue = sortedCats.length > 0 
      ? `${sortedCats[0][0]} (${sortedCats[0][1]} reports, ${Math.round((sortedCats[0][1] / (allReports.length || 1)) * 100)}% of total)`
      : 'None';

    // 3. Recurring problem patterns
    const recurringIssues = [];
    for (const [cat, count] of sortedCats) {
      if (count >= 5) {
        recurringIssues.push({
          category: cat,
          count,
          insight: `High volume pattern: ${count} separate citizen reports filed for ${cat}. Requires structural review.`
        });
      }
    }

    // 4. Emerging Hotspot
    const emergingHotspot = hotspots.length > 0 ? hotspots[0] : null;

    res.json({
      success: true,
      data: {
        highestPriorityArea,
        mostCommonIssue,
        recurringIssues,
        emergingHotspot,
        totalActiveHotspots: hotspots.length
      }
    });
  } catch (error) {
    next(error);
  }
}
