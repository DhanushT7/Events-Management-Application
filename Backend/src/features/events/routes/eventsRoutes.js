import express from 'express';
import Event from '../../../shared/models/eventModel.js';

const router = express.Router();

// GET /api/events - return all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().lean().exec();
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/events/top?limit=3
router.get('/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '3', 10);
    const now = new Date();

    const ongoing = await Event.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ endDate: 1 })
      .limit(limit)
      .lean()
      .exec();

    if (ongoing.length >= limit) {
      return res.json(ongoing.slice(0, limit));
    }

    const needed = limit - ongoing.length;
    const coming = await Event.find({ startDate: { $gt: now } })
      .sort({ startDate: 1 })
      .limit(needed)
      .lean()
      .exec();

    res.json([...ongoing, ...coming].slice(0, limit));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
