import express from 'express';
import Event from '../../../shared/models/eventModel.js';

// TODO: replace with your real admin auth middleware
function verifyTokenAndAdmin(req, res, next) {
  // If you have upstream auth attaching req.user, check here
  // For initial testing, allow through. Swap this with real middleware later.
  return next();
}

const router = express.Router();

/**
 * GET /api/admin/events/history
 * Returns events for admin history view.
 * Response: { events: [...] }
 */
router.get('/events/history', verifyTokenAndAdmin, async (req, res) => {
  try {
    const { limit = 0, status, start, end, department } = req.query;
    const q = {};

    if (status) q.status = status;

    const ors = [];
    if (department) {
      ors.push({ 'organizingDepartments.primary': { $regex: new RegExp(`^${department}$`, 'i') } });
      ors.push({ 'organizingDepartments.associative': { $elemMatch: { $regex: new RegExp(department, 'i') } } });
    }
    if (ors.length) q.$or = ors;

    if (start || end) {
      q.startDate = {};
      if (start) q.startDate.$gte = new Date(start + 'T00:00:00.000Z');
      if (end) q.startDate.$lte = new Date(end + 'T23:59:59.999Z');
    }

    const projection = {
      title: 1,
      startDate: 1,
      endDate: 1,
      venue: 1,
      mode: 1,
      duration: 1,
      type: 1,
      budget: 1,
      status: 1,
      claimBill: 1,
      createdBy: 1,
      createdAt: 1,
      coordinators: 1,
      organizingDepartments: 1,
      organizingCommittee: 1,
      reviewComments: 1,
    };

    let query = Event.find(q, projection).sort({ startDate: -1 });
    const lim = parseInt(limit);
    if (!isNaN(lim) && lim > 0) query = query.limit(lim);

    const events = await query.lean().exec();
    return res.json({ events });
  } catch (err) {
    console.error('Error in /api/admin/events/history', err);
    return res.status(500).json({ message: 'Failed to load event history' });
  }
});

export default router;
