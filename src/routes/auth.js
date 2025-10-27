import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../db/models/user.js';
import { signToken } from '../utils/jwt.js';
import { Hotel } from '../db/models/hotel.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, role = 'hotelOwner', hotel } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    let tenantId = null;
    let newHotel = null;

    // If hotelOwner or admin is registering and providing hotel name → create hotel first
    if (hotel && (role === 'hotelOwner' || role === 'admin')) {
      newHotel = await Hotel.create({ name: hotel });
      tenantId = newHotel.id;
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name, role, tenantId });

    // ✅ Now link hotel.ownerId = this user.id (after user is created)
    if (newHotel && role === 'hotelOwner') {
      await newHotel.update({ ownerId: user.id });
    }

    const token = signToken({ sub: user.id, role: user.role, tenantId: user.tenantId });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, role: user.role, name: user.name, tenantId: user.tenantId },
      token
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/users/add-staff
 * hotelOwner or admin adds staff (manager, reception, etc.)
 */
router.post('/add-staff', authMiddleware, requireRole(['hotelOwner', 'admin']), async (req, res, next) => {
  try {
    const { email, password, name, role = 'staff', hotelId } = req.body;
    const creator = req.user;

    if (!hotelId) return res.status(400).json({ error: 'HotelId is required' });

    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

    const passwordHash = await bcrypt.hash(password, 10);
    const staff = await User.create({
      email,
      passwordHash,
      name,
      role,
      tenantId: hotel.id,
      createdBy: creator.id
    });

    res.json({ message: 'Staff added successfully', staff });
  } catch (err) {
    next(err);
  }
});


// login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await user.validatePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ sub: user.id, role: user.role, tenantId: user.tenantId });
    res.json({ user: { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId }, token });
  } catch (err) {
    next(err);
  }
});

/**
 * 🔹 Get all users (admin only)
 * GET /api/users
 */
router.get('/', authMiddleware, requireRole(['superadmin', 'admin']), async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'role', 'tenantId', 'createdAt'],
      include: [{ model: Hotel, attributes: ['id', 'name'], required: false }]
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

/**
 * 🔹 Get a single user by ID
 * GET /api/users/:id
 */
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'email', 'name', 'role', 'tenantId', 'createdAt']
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * 🔹 Update a user (admin or the user themself)
 * PATCH /api/users/:id
 */
router.patch('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!['superadmin', 'admin', 'hotelOwner'].includes(req.user.role) && req.user.id !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const allowed = ['name', 'email', 'role', 'tenantId', 'password'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    await User.update(updates, { where: { id } });
    const updated = await User.findByPk(id, {
      attributes: ['id', 'email', 'name', 'role', 'tenantId']
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * 🔹 Delete user (admin only)
 * DELETE /api/users/:id
 */
router.delete('/:id', authMiddleware, requireRole(['superadmin', 'admin', 'hotelOwner']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
