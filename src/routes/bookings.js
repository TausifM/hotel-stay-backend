import express from 'express';
import { Booking } from '../db/models/booking.js';
import { Room } from '../db/models/room.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { ioEmit } from '../realtime/index.js';

const router = express.Router();

// create a booking (guest or staff) — for demo we allow creation; in prod check availability
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    if (!tenantId) return res.status(400).json({ error: 'No tenant' });
    const { guestName, guestEmail, checkinAt, checkoutAt, roomId, price } = req.body;
    // if a roomId was provided, ensure it belongs to tenant and is available
    if (roomId) {
      const room = await Room.findByPk(roomId);
      if (!room || room.hotelId !== tenantId) return res.status(400).json({ error: 'Invalid room' });
      if (room.status !== 'available') return res.status(400).json({ error: 'Room not available' });
      // optionally lock room
    }
    const booking = await Booking.create({
      hotelId: tenantId, roomId, guestName, guestEmail, checkinAt, checkoutAt, price, status: 'reserved'
    });
    // notify realtime listeners
    ioEmit(tenantId, 'booking:created', booking);
    res.status(201).json(booking);
  } catch (err) { next(err); }
});

// list bookings (tenant)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const bookings = await Booking.findAll({ where: { hotelId: tenantId }, order: [['createdAt','DESC']] });
    res.json(bookings);
  } catch (err) { next(err); }
});

// update booking status (checkin/checkout/cancel)
router.patch('/:id/status', authMiddleware, requireRole('staff'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    if (booking.hotelId !== req.user.tenantId) return res.status(403).json({ error: 'Forbidden' });

    booking.status = status;

    // if checked_in mark room occupied
    if (status === 'checked_in' && booking.roomId) {
      const room = await Room.findByPk(booking.roomId);
      if (room) { room.status = 'occupied'; await room.save(); }
    }
    if (status === 'checked_out' && booking.roomId) {
      const room = await Room.findByPk(booking.roomId);
      if (room) { room.status = 'cleaning'; await room.save(); }
    }

    await booking.save();
    ioEmit(req.user.tenantId, 'booking:updated', booking);
    res.json(booking);
  } catch (err) { next(err); }
});

export default router;
