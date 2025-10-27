import express from 'express';
import { Hotel } from '../db/models/hotel.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// list hotels (admin)
router.get('/', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const hotels = await Hotel.findAll();
    res.json(hotels);
  } catch (err) { next(err); }
});

// create hotel
router.post('/', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, address, timezone } = req.body;
    const h = await Hotel.create({ name, address, timezone });
    res.status(201).json(h);
  } catch (err) { next(err); }
});

export default router;
