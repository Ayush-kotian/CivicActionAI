import { Report, VALID_CATEGORIES, VALID_STATUSES, VALID_DEPARTMENTS } from '../models/Report.js';
import { generateComplaintId } from '../utils/idGenerator.js';
import { analyzeReportWithAI } from '../services/ai/geminiService.js';
import { getRecommendedDepartment } from '../services/ai/fallbackService.js';
import { findDuplicatesInPool } from '../services/duplicate/duplicateService.js';

export async function createReport(req, res, next) {
  try {
    const { description, category, latitude, longitude, address } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A detailed description (at least 5 characters) is required.'
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: 'Valid geographic coordinates (latitude and longitude) are required.'
      });
    }

    let userCategory = category;
    if (!userCategory || !VALID_CATEGORIES.includes(userCategory)) {
      userCategory = 'Other';
    }

    const locationObj = {
      latitude: lat,
      longitude: lon,
      address: address ? address.trim() : `Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}`
    };

    // 1. Generate unique Complaint ID
    const complaintId = generateComplaintId();

    // 2. Handle uploaded image if present
    let imageUrl = null;
    if (req.file) {
      // Local URL served by static express middleware
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // 3. Run AI Analysis Pipeline
    const aiResult = await analyzeReportWithAI(description, userCategory, locationObj);

    // 4. Duplicate Detection against existing database records
    const recentReports = await Report.find({}, 'complaintId description category aiCategory location _id')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const tempReport = {
      complaintId,
      description,
      category: aiResult.category || userCategory,
      aiCategory: aiResult.category,
      location: locationObj
    };

    const duplicateCheck = findDuplicatesInPool(tempReport, recentReports);

    // Determine initial department
    const recommendedDept = getRecommendedDepartment(aiResult.category || userCategory);

    // Build initial status history
    const statusHistory = [
      {
        status: 'SUBMITTED',
        changedBy: 'Citizen Portal',
        timestamp: new Date(),
        note: 'Report intake recorded into civic registry.'
      },
      {
        status: 'SUBMITTED',
        changedBy: 'AI Intelligence Pipeline',
        timestamp: new Date(Date.now() + 1000),
        note: `AI analysis completed (${aiResult.engine || 'CIVIC_AI'}). Priority classified as ${aiResult.priority} (${aiResult.priorityScore}/100).`
      }
    ];

    if (duplicateCheck.duplicatePossible) {
      statusHistory.push({
        status: 'SUBMITTED',
        changedBy: 'Duplicate Engine',
        timestamp: new Date(Date.now() + 1500),
        note: `Potential duplicate flag triggered. Related report: #${duplicateCheck.duplicateOf || duplicateCheck.duplicateReportIds[0]} with similarity ${duplicateCheck.duplicateScore}% (${duplicateCheck.duplicateTier}).`
      });
    }

    const newReport = new Report({
      complaintId,
      description: description.trim(),
      category: userCategory === 'Auto Detect' || userCategory === 'Other' ? aiResult.category : userCategory,
      aiCategory: aiResult.category,
      aiCategoryConfidence: aiResult.categoryConfidence,
      summary: aiResult.summary,
      imageUrl,
      location: locationObj,
      priority: aiResult.priority,
      priorityScore: aiResult.priorityScore,
      priorityReasons: aiResult.priorityReasons,
      safetyRisk: aiResult.safetyRisk,
      impactLevel: aiResult.impactLevel,
      keywords: aiResult.keywords,
      duplicatePossible: duplicateCheck.duplicatePossible,
      duplicateStatus: duplicateCheck.duplicateStatus,
      duplicateTier: duplicateCheck.duplicateTier,
      duplicateOf: duplicateCheck.duplicateOf,
      duplicateReportIds: duplicateCheck.duplicateReportIds,
      duplicateScore: duplicateCheck.duplicateScore,
      duplicateExplanation: duplicateCheck.duplicateExplanation,
      duplicateReason: duplicateCheck.duplicateReason,
      duplicateReasons: duplicateCheck.duplicateReasons,
      actionBrief: aiResult.actionBrief,
      status: 'SUBMITTED',
      assignedDepartment: recommendedDept,
      statusHistory
    });

    const saved = await newReport.save();

    // If duplicate found, bidirectionally update the target report to link back
    if (duplicateCheck.duplicatePossible && duplicateCheck.duplicateReportIds.length > 0) {
      const primaryTargetId = duplicateCheck.duplicateReportIds[0];
      await Report.updateOne(
        { complaintId: primaryTargetId },
        { 
          $set: { duplicatePossible: true },
          $addToSet: { duplicateReportIds: complaintId }
        }
      ).catch(e => console.warn('Could not bidirectionally link duplicate:', e.message));
    }

    res.status(201).json({
      success: true,
      message: 'Complaint submitted and analyzed successfully',
      data: saved
    });
  } catch (error) {
    next(error);
  }
}

export async function getReports(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      priority,
      status,
      department,
      duplicateOnly,
      search,
      sortBy = 'newest'
    } = req.query;

    const query = {};

    if (category && category !== 'ALL') {
      query.category = category;
    }
    if (priority && priority !== 'ALL') {
      query.priority = priority.toUpperCase();
    }
    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }
    if (department && department !== 'ALL') {
      query.assignedDepartment = department;
    }
    if (duplicateOnly === 'true') {
      query.duplicatePossible = true;
    }
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { complaintId: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { summary: { $regex: s, $options: 'i' } },
        { 'location.address': { $regex: s, $options: 'i' } }
      ];
    }

    const sortOption = {};
    if (sortBy === 'highest_priority') {
      sortOption.priorityScore = -1;
    } else if (sortBy === 'oldest') {
      sortOption.createdAt = 1;
    } else {
      sortOption.createdAt = -1;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      Report.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Report.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getReportById(req, res, next) {
  try {
    const { id } = req.params;
    let report = await Report.findOne({ complaintId: id }).lean();
    if (!report && id.match(/^[0-9a-fA-F]{24}$/)) {
      report = await Report.findById(id).lean();
    }

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Complaint report #${id} was not found.`
      });
    }

    // Fetch details of related duplicate reports if any
    let relatedDuplicates = [];
    if (report.duplicateReportIds && report.duplicateReportIds.length > 0) {
      relatedDuplicates = await Report.find(
        { complaintId: { $in: report.duplicateReportIds } },
        'complaintId description category priority status location duplicateStatus duplicateTier duplicateScore duplicateReason duplicateReasons createdAt'
      ).lean();
    }

    res.json({
      success: true,
      data: {
        ...report,
        relatedDuplicates
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDuplicateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note, changedBy = 'Authority Operations' } = req.body;

    const lowerStatus = (status || '').toLowerCase();
    if (!['confirmed', 'rejected', 'possible', 'none'].includes(lowerStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid duplicate status. Must be confirmed, rejected, possible, or none.'
      });
    }

    const report = await Report.findOne({
      $or: [{ complaintId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report #${id} not found.`
      });
    }

    report.duplicateStatus = lowerStatus;
    if (lowerStatus === 'rejected') {
      report.duplicatePossible = false;
      report.duplicateTier = 'None';
    } else if (lowerStatus === 'confirmed') {
      report.duplicatePossible = true;
      report.duplicateTier = 'Strong Duplicate';
    }

    report.statusHistory.push({
      status: report.status,
      changedBy,
      timestamp: new Date(),
      note: note
        ? note.trim()
        : (lowerStatus === 'confirmed'
            ? `Authority verified and confirmed report as duplicate of #${report.duplicateOf || 'related complaint'}.`
            : `Authority reviewed and cleared duplicate flag (marked as distinct complaint).`)
    });

    const updated = await report.save();

    res.json({
      success: true,
      message: `Duplicate status updated to ${lowerStatus}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

export async function updateReportStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note, changedBy = 'Municipal Admin' } = req.body;

    const upperStatus = (status || '').toUpperCase();
    if (!VALID_STATUSES.includes(upperStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const report = await Report.findOne({
      $or: [{ complaintId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report #${id} not found.`
      });
    }

    report.status = upperStatus;
    report.statusHistory.push({
      status: upperStatus,
      changedBy,
      timestamp: new Date(),
      note: note ? note.trim() : `Status transitioned to ${upperStatus}.`
    });

    const updated = await report.save();

    res.json({
      success: true,
      message: `Report #${report.complaintId} status updated to ${upperStatus}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

export async function assignReport(req, res, next) {
  try {
    const { id } = req.params;
    const { department, assignedTo, note } = req.body;

    if (!department || !VALID_DEPARTMENTS.includes(department)) {
      return res.status(400).json({
        success: false,
        message: `Invalid department. Must be one of: ${VALID_DEPARTMENTS.join(', ')}`
      });
    }

    const report = await Report.findOne({
      $or: [{ complaintId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report #${id} not found.`
      });
    }

    report.assignedDepartment = department;
    if (assignedTo !== undefined) {
      report.assignedTo = assignedTo.trim();
    }

    // Automatically transition to ASSIGNED if currently SUBMITTED or UNDER REVIEW
    if (report.status === 'SUBMITTED' || report.status === 'UNDER REVIEW') {
      report.status = 'ASSIGNED';
    }

    report.statusHistory.push({
      status: report.status,
      changedBy: 'Authority Operations',
      timestamp: new Date(),
      note: note
        ? note.trim()
        : `Work order assigned to ${department}${assignedTo ? ` (Lead: ${assignedTo})` : ''}.`
    });

    const updated = await report.save();

    res.json({
      success: true,
      message: `Report #${report.complaintId} assigned to ${department}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

export async function getCitizenTracking(req, res, next) {
  try {
    const { complaintId } = req.params;
    const report = await Report.findOne({ complaintId: complaintId.trim().toUpperCase() })
      .select('complaintId category summary priority status assignedDepartment location statusHistory createdAt updatedAt imageUrl duplicatePossible duplicateStatus duplicateTier duplicateOf duplicateScore duplicateReason duplicateReasons')
      .lean();

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `No public record found for complaint reference ID "${complaintId}". Please verify your reference number.`
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
}
