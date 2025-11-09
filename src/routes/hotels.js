import express from 'express';
import { Hotel } from '../db/models/hotel.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// list hotels (admin)
// Get all hotels (admin or superadmin only)
router.get("/get-hotels", authMiddleware, requireRole(["admin", "superadmin", "hotelOwner", "staff", "reception", "manager"]), async (req, res, next) => {
  try {
    const hotels = await Hotel.findAll();
    res.json(hotels);
  } catch (err) { next(err); }
});

// Create hotel (superadmin only)
router.post("/add-hotel",authMiddleware, requireRole(["superadmin", "admin", "hotelOwner", "staff", "reception", "manager"]), async (req, res, next) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ message: "Hotel created", hotel });
  } catch (err) { next(err); }
});

// Update hotel
router.put("/update-hotel/:id", authMiddleware, requireRole(["superadmin", "admin", "hotelOwner"]), async (req, res, next) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });
    await hotel.update(req.body);
    res.json({ message: "Hotel updated", hotel });
  } catch (err) { next(err); }
});

// Delete hotel
router.delete("/delete-hotel/:id", authMiddleware, requireRole(["superadmin", "admin", "hotelOwner"]), async (req, res, next) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });
    await hotel.destroy();
    res.json({ message: "Hotel deleted" });
  } catch (err) { next(err); }
});

export default router;
