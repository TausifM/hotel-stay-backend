import express from 'express';
import { Room } from '../db/models/room.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// create room (staff/admin) — tenant-aware
router.post('/', authMiddleware, requireRole('staff'), async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    if (!tenantId) return res.status(400).json({ error: 'No tenant assigned' });
    const { number, type, rate } = req.body;
    const room = await Room.create({ hotelId: tenantId, number, type, rate });
    res.status(201).json(room);
  } catch (err) { next(err); }
});

// list rooms for tenant
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    if (!tenantId) return res.status(400).json({ error: 'No tenant assigned' });
    const rooms = await Room.findAll({ where: { hotelId: tenantId }});
    res.json(rooms);
  } catch (err) { next(err); }
});

// update room status
router.patch('/:id/status', authMiddleware, requireRole('staff'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const room = await Room.findByPk(id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.hotelId !== req.user.tenantId) return res.status(403).json({ error: 'Forbidden' });
    room.status = status;
    await room.save();
    res.json(room);
  } catch (err) { next(err); }
});

export default router;
